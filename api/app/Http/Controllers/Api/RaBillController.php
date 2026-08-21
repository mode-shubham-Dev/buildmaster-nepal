<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BoqItem;
use App\Models\Project;
use App\Models\RaBill;
use App\Models\RaBillLine;
use App\Services\BillingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RaBillController extends Controller
{
    public function __construct(
        protected BillingService $billingService
    ) {}

    /** All bills for a project, newest first. */
    public function index(Request $request): JsonResponse
    {
        $bills = RaBill::with(['project:id,name,project_code'])
            ->when($request->project_id, fn ($q) => $q->where('project_id', $request->project_id))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderByDesc('bill_date')
            ->orderByDesc('bill_no')
            ->get();

        return response()->json(['bills' => $bills]);
    }

    /**
     * The "billing basis" for a new bill: every BOQ item of the project, with
     * its total quantity, rate, and how much has ALREADY been billed — so the
     * UI can show remaining-to-bill per item.
     */
    public function billingBasis(Project $project): JsonResponse
    {
        $items = BoqItem::where('project_id', $project->id)
            ->orderBy('sort_order')
            ->get(['id', 'category', 'item_code', 'description', 'unit', 'quantity', 'rate']);

        // One query for all items instead of N — MAX cumulative_qty per item across
        // all bills for this project, keyed by boq_item_id.
        $previousBilled = RaBillLine::join('ra_bills', 'ra_bill_lines.ra_bill_id', '=', 'ra_bills.id')
            ->where('ra_bills.project_id', $project->id)
            ->groupBy('ra_bill_lines.boq_item_id')
            ->pluck(DB::raw('MAX(ra_bill_lines.cumulative_qty)'), 'ra_bill_lines.boq_item_id')
            ->map(fn ($v) => (float) $v);

        $basis = $items->map(function ($item) use ($previousBilled) {
            $previous = $previousBilled->get($item->id, 0.0);
            return [
                'boq_item_id'       => $item->id,
                'category'          => $item->category,
                'item_code'         => $item->item_code,
                'description'       => $item->description,
                'unit'              => $item->unit,
                'boq_quantity'      => (float) $item->quantity,
                'rate'              => (float) $item->rate,
                'previously_billed' => $previous,
                'remaining'         => round((float) $item->quantity - $previous, 3),
            ];
        });

        return response()->json(['basis' => $basis]);
    }

    public function show(RaBill $raBill): JsonResponse
    {
        $raBill->load([
            'project:id,name,project_code',
            'lines.boqItem:id,description,unit,category,item_code',
            'payments',
            'creator:id,name',
            'approver:id,name',
        ]);

        return response()->json(['bill' => $raBill]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'project_id'           => ['required', 'exists:projects,id'],
            'bill_date'            => ['required', 'date'],
            'retention_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'vat_percentage'       => ['nullable', 'numeric', 'min:0', 'max:100'],
            'advance_recovery'     => ['nullable', 'numeric', 'min:0'],
            'remarks'              => ['nullable', 'string'],
            'lines'                => ['required', 'array', 'min:1'],
            'lines.*.boq_item_id'  => ['required', 'exists:boq_items,id'],
            'lines.*.cumulative_qty' => ['required', 'numeric', 'min:0'],
        ]);

        $project = Project::findOrFail($data['project_id']);
        $data['user_id'] = $request->user()->id;

        $bill = $this->billingService->createBill($project, $data);

        return response()->json([
            'message' => "RA Bill No. {$bill->bill_no} created.",
            'bill'    => $bill->load('lines.boqItem:id,description,unit'),
        ], 201);
    }

    /** Workflow transitions: submit / approve / mark-paid / send back. */
    public function transition(Request $request, RaBill $raBill): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:submitted,approved,paid,draft'],
        ]);

        $this->billingService->transition($raBill, $data['status'], $request->user()->id);

        return response()->json(['message' => "Bill moved to {$data['status']}."]);
    }

    /** Record a payment received against an approved/paid bill. */
    public function recordPayment(Request $request, RaBill $raBill): JsonResponse
    {
        if (! in_array($raBill->status, ['approved', 'paid'], true)) {
            return response()->json(['message' => 'Only approved bills can receive payments.'], 422);
        }

        $data = $request->validate([
            'amount'       => ['required', 'numeric', 'gt:0'],
            'payment_date' => ['required', 'date'],
            'reference'    => ['nullable', 'string', 'max:255'],
            'remarks'      => ['nullable', 'string', 'max:255'],
        ]);

        $payment = $raBill->payments()->create([...$data, 'recorded_by' => $request->user()->id]);

        return response()->json([
            'message' => 'Payment recorded.',
            'payment' => $payment,
            'bill'    => $raBill->fresh()->load('payments'),
        ], 201);
    }

    public function destroy(RaBill $raBill): JsonResponse
    {
        if ($raBill->isLocked()) {
            return response()->json(['message' => 'An approved or paid bill cannot be deleted.'], 422);
        }

        $raBill->delete();

        return response()->json(['message' => 'Bill deleted.']);
    }
}