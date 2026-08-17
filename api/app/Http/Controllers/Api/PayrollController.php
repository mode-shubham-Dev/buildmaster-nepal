<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payslip;
use App\Models\PayrollRun;
use App\Services\PayrollService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayrollController extends Controller
{
    public function __construct(
        protected PayrollService $payrollService
    ) {}

    /** List all runs, newest first, with payslip counts + net totals. */
    public function index(): JsonResponse
    {
        $runs = PayrollRun::withCount('payslips')
            ->withSum('payslips', 'net_pay')
            ->latest('period_start')
            ->get();

        return response()->json(['runs' => $runs]);
    }

    /** Create a payroll run (the period). */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'        => ['required', 'string', 'max:255'],
            'period_start' => ['required', 'date'],
            'period_end'   => ['required', 'date', 'after_or_equal:period_start'],
            'working_days' => ['required', 'integer', 'min:1', 'max:31'],
        ]);

        $run = PayrollRun::create([...$data, 'status' => 'draft', 'processed_by' => $request->user()->id]);

        return response()->json(['message' => 'Payroll run created.', 'run' => $run], 201);
    }

    /** Full run detail with every payslip + employee + lines. */
    public function show(PayrollRun $payrollRun): JsonResponse
    {
        $payrollRun->load([
            'payslips.employee:id,first_name,last_name,employee_code',
            'payslips.lines',
            'finalizer:id,name',
        ]);

        return response()->json(['run' => $payrollRun]);
    }

    /** Generate/regenerate draft payslips for all active employees. */
    public function generate(PayrollRun $payrollRun): JsonResponse
    {
        $this->payrollService->generate($payrollRun);

        return response()->json([
            'message' => 'Payslips generated.',
            'run'     => $payrollRun->fresh()->load('payslips.employee:id,first_name,last_name,employee_code'),
        ]);
    }

    /** Add an allowance/deduction line to a payslip, then recompute. */
    public function addLine(Request $request, Payslip $payslip): JsonResponse
    {
        abort_if($payslip->payrollRun->isLocked(), 422, 'Cannot edit a finalized payslip.');

        $data = $request->validate([
            'type'   => ['required', 'in:allowance,deduction'],
            'label'  => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
        ]);

        $payslip->lines()->create($data);
        $this->payrollService->recalculate($payslip);

        return response()->json([
            'message' => 'Line added.',
            'payslip' => $payslip->fresh()->load('lines'),
        ], 201);
    }

    /** Remove a line, then recompute. */
    public function removeLine(\App\Models\PayslipLine $line): JsonResponse
    {
        $payslip = $line->payslip;
        abort_if($payslip->payrollRun->isLocked(), 422, 'Cannot edit a finalized payslip.');

        $line->delete();
        $this->payrollService->recalculate($payslip);

        return response()->json([
            'message' => 'Line removed.',
            'payslip' => $payslip->fresh()->load('lines'),
        ]);
    }

    /** THE LOCK — finalize a run. Irreversible; freezes every payslip. */
    public function finalize(Request $request, PayrollRun $payrollRun): JsonResponse
    {
        abort_if($payrollRun->isLocked(), 422, 'This run is already finalized.');
        abort_if($payrollRun->payslips()->count() === 0, 422, 'Generate payslips before finalizing.');

        $payrollRun->update([
            'status'       => 'finalized',
            'finalized_by' => $request->user()->id,
            'finalized_at' => now(),
        ]);

        return response()->json(['message' => 'Payroll finalized and locked.']);
    }

    /** Delete a draft run (finalized runs can never be deleted). */
    public function destroy(PayrollRun $payrollRun): JsonResponse
    {
        abort_if($payrollRun->isLocked(), 422, 'A finalized payroll run cannot be deleted.');

        $payrollRun->delete();

        return response()->json(['message' => 'Payroll run deleted.']);
    }
}