<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\PettyCashFund;
use App\Services\ExpenseService;
use App\Services\FileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function __construct(
        protected ExpenseService $expenseService,
        protected FileService $fileService,
    ) {}

    /* ---------- reference data ---------- */

    public function categories(): JsonResponse
    {
        return response()->json(['categories' => ExpenseCategory::where('is_active', true)->get()]);
    }

    /* ---------- expenses ---------- */

    public function index(Request $request): JsonResponse
    {
        $expenses = Expense::with(['category:id,name', 'project:id,name', 'fund:id,name', 'spender:id,name'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->project_id, fn ($q) => $q->where('project_id', $request->project_id))
            ->latest('expense_date')
            ->get();

        return response()->json(['expenses' => $expenses]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'expense_category_id' => ['required', 'exists:expense_categories,id'],
            'project_id'          => ['nullable', 'exists:projects,id'],
            'petty_cash_fund_id'  => ['nullable', 'exists:petty_cash_funds,id'],
            'amount'              => ['required', 'numeric', 'gt:0'],
            'expense_date'        => ['required', 'date'],
            'description'         => ['required', 'string', 'max:255'],
        ]);

        $expense = Expense::create([...$data, 'status' => 'pending', 'spent_by' => $request->user()->id]);

        return response()->json([
            'message' => 'Expense submitted.',
            'expense' => $expense->load(['category:id,name', 'project:id,name', 'fund:id,name']),
        ], 201);
    }

    public function show(Expense $expense): JsonResponse
    {
        $expense->load(['category:id,name', 'project:id,name,project_code', 'fund:id,name', 'spender:id,name', 'approver:id,name', 'attachments']);
        return response()->json(['expense' => $expense]);
    }

    public function action(Request $request, Expense $expense): JsonResponse
    {
        $data = $request->validate([
            'status'         => ['required', 'in:approved,rejected'],
            'action_remarks' => ['nullable', 'string', 'max:255'],
        ]);

        $this->expenseService->action($expense, $data['status'], $data['action_remarks'] ?? null, $request->user()->id);

        return response()->json(['message' => "Expense {$data['status']}."]);
    }

    public function uploadReceipt(Request $request, Expense $expense): JsonResponse
    {
        $request->validate(['file' => ['required', 'file', 'max:10240', 'mimes:jpeg,jpg,png,gif,webp,pdf']]);
        $attachment = $this->fileService->attach($expense, $request->file('file'), 'receipts');
        return response()->json(['message' => 'Receipt uploaded.', 'attachment' => $attachment], 201);
    }

    public function destroy(Expense $expense): JsonResponse
    {
        if ($expense->status === 'approved') {
            return response()->json(['message' => 'An approved expense cannot be deleted.'], 422);
        }
        $expense->delete();
        return response()->json(['message' => 'Expense deleted.']);
    }

    /* ---------- petty cash funds ---------- */

    public function funds(): JsonResponse
    {
        $funds = PettyCashFund::with([
            'project:id,name',
            'custodian:id,first_name,last_name',
            'topups',
            'expenses' => fn ($q) => $q->where('status', 'approved'),
        ])
            ->where('is_active', true)
            ->get();

        return response()->json(['funds' => $funds]);
    }

    public function storeFund(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'         => ['required', 'string', 'max:255'],
            'project_id'   => ['nullable', 'exists:projects,id'],
            'custodian_id' => ['nullable', 'exists:employees,id'],
        ]);

        $fund = PettyCashFund::create([...$data, 'is_active' => true]);
        return response()->json(['message' => 'Petty cash fund created.', 'fund' => $fund], 201);
    }

    public function showFund(PettyCashFund $fund): JsonResponse
    {
        $fund->load(['project:id,name', 'custodian:id,first_name,last_name', 'topups.fund:id', 'expenses' => fn ($q) => $q->where('status', 'approved')->with('category:id,name')]);
        return response()->json(['fund' => $fund]);   // includes derived balance/total_topups/total_spent via $appends
    }

    public function topup(Request $request, PettyCashFund $fund): JsonResponse
    {
        $data = $request->validate([
            'amount'     => ['required', 'numeric', 'gt:0'],
            'topup_date' => ['required', 'date'],
            'remarks'    => ['nullable', 'string', 'max:255'],
        ]);

        $topup = $fund->topups()->create([...$data, 'added_by' => $request->user()->id]);
        return response()->json(['message' => 'Fund topped up.', 'topup' => $topup, 'fund' => $fund->fresh()], 201);
    }
}