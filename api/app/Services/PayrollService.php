<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\Payslip;
use App\Models\PayrollRun;
use Illuminate\Support\Facades\DB;

class PayrollService
{
    /** Default tax rate (%). Nepal progressive slabs can replace this in Module 26. */
    protected float $defaultTaxRate = 1.0;

    /**
     * Generate (or regenerate) draft payslips for every active employee in a run.
     * Idempotent: wipes existing draft payslips and rebuilds — safe to re-run
     * while the run is still draft. Refuses if the run is finalized (locked).
     */
    public function generate(PayrollRun $run): void
    {
        abort_if($run->isLocked(), 422, 'A finalized payroll run cannot be regenerated.');

        DB::transaction(function () use ($run) {
            // clear any prior drafts (and their lines via cascade)
            $run->payslips()->delete();

            $employees = Employee::where('status', 'active')->get();

            // Pre-fetch ALL approved unpaid leave requests that overlap the
            // period in one query, then group by employee — eliminates N+1.
            $leaveByEmployee = LeaveRequest::where('status', 'approved')
                ->whereHas('leaveType', fn ($q) => $q->where('is_paid', false))
                ->whereIn('employee_id', $employees->pluck('id'))
                ->where('from_date', '<=', $run->period_end)
                ->where('to_date', '>=', $run->period_start)
                ->get()
                ->groupBy('employee_id');

            foreach ($employees as $employee) {
                $this->buildPayslip(
                    $run,
                    $employee,
                    $leaveByEmployee->get($employee->id, collect()),
                );
            }
        });
    }

    /**
     * Compute ONE payslip from source records. All math here; nothing trusted
     * from a client. Every figure is stored as a frozen snapshot.
     *
     * @param \Illuminate\Support\Collection<int, LeaveRequest> $leaveRequests
     */
    protected function buildPayslip(PayrollRun $run, Employee $employee, \Illuminate\Support\Collection $leaveRequests): Payslip
    {
        $basic = (float) ($employee->basic_salary ?? 0);

        // --- per-day rate, from the run's declared working days ---
        $perDay = $run->working_days > 0 ? $basic / $run->working_days : 0;

        // --- DERIVED: unpaid leave days that overlap this period ---
        $unpaidDays = $this->unpaidLeaveDays($leaveRequests, $run);
        $unpaidDeduction = round($perDay * $unpaidDays, 2);

        // --- earnings ---
        $allowances = 0.0;      // line items added after generation; 0 at draft creation
        $overtime   = 0.0;
        $gross = round($basic + $allowances + $overtime, 2);

        // --- tax: simple % of (gross − unpaid deduction) taxable base ---
        $taxRate   = $this->defaultTaxRate;
        $taxable   = max($gross - $unpaidDeduction, 0);
        $taxAmount = round($taxable * ($taxRate / 100), 2);

        // --- deductions ---
        $otherDeductions  = 0.0;   // line items added after generation
        $totalDeductions  = round($unpaidDeduction + $taxAmount + $otherDeductions, 2);

        // --- net ---
        $net = round($gross - $totalDeductions, 2);

        return $run->payslips()->create([
            'employee_id'            => $employee->id,
            'basic_salary'           => $basic,
            'total_allowances'       => $allowances,
            'overtime_amount'        => $overtime,
            'gross_pay'              => $gross,
            'unpaid_leave_deduction' => $unpaidDeduction,
            'tax_amount'             => $taxAmount,
            'other_deductions'       => $otherDeductions,
            'total_deductions'       => $totalDeductions,
            'net_pay'                => $net,
            'unpaid_leave_days'      => $unpaidDays,
            'tax_rate'               => $taxRate,
        ]);
    }

    /**
     * Count approved unpaid leave days (clamped to the run period) from the
     * pre-fetched collection. No DB query — caller pre-loads for the batch.
     *
     * @param \Illuminate\Support\Collection<int, LeaveRequest> $requests
     */
    protected function unpaidLeaveDays(\Illuminate\Support\Collection $requests, PayrollRun $run): int
    {
        $days = 0;
        foreach ($requests as $req) {
            // clamp the leave range to the payroll period, count inclusive days
            $start = max($req->from_date->timestamp, $run->period_start->timestamp);
            $end   = min($req->to_date->timestamp,   $run->period_end->timestamp);
            $days += (int) floor(($end - $start) / 86400) + 1;
        }

        return $days;
    }

    /**
     * Recompute a single payslip's totals AFTER line items (allowances/
     * deductions) were added or removed. Re-reads lines, re-runs the math.
     * Refuses if the run is locked.
     */
    public function recalculate(Payslip $payslip): void
    {
        abort_if($payslip->payrollRun->isLocked(), 422, 'Cannot edit a finalized payslip.');

        $payslip->loadMissing('lines');

        $allowances = $payslip->lines->where('type', 'allowance')->sum('amount');
        $otherDeduct = $payslip->lines->where('type', 'deduction')->sum('amount');

        $gross = round($payslip->basic_salary + $allowances + $payslip->overtime_amount, 2);

        $taxable   = max($gross - $payslip->unpaid_leave_deduction, 0);
        $taxAmount = round($taxable * ($payslip->tax_rate / 100), 2);

        $totalDeduct = round($payslip->unpaid_leave_deduction + $taxAmount + $otherDeduct, 2);
        $net = round($gross - $totalDeduct, 2);

        $payslip->update([
            'total_allowances' => $allowances,
            'gross_pay'        => $gross,
            'tax_amount'       => $taxAmount,
            'other_deductions' => $otherDeduct,
            'total_deductions' => $totalDeduct,
            'net_pay'          => $net,
        ]);
    }
}