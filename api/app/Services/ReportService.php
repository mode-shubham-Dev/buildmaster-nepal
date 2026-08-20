<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\Payslip;
use App\Models\Project;
use App\Models\PurchaseOrder;
use App\Models\RaBill;
use Illuminate\Support\Facades\DB;

class ReportService
{
    /**
     * Headline KPIs — the company's financial pulse. All derived live.
     */
    public function dashboardKpis(): array
    {
        $activeProjects = Project::where('status', '!=', 'completed')->count();

        // Total billed (approved + paid RA bills) and collected (payments)
        $totalBilled = (float) RaBill::whereIn('status', ['approved', 'paid'])->sum('net_payable');
        $totalCollected = (float) DB::table('ra_bill_payments')->sum('amount');
        $outstanding = round($totalBilled - $totalCollected, 2);

        // Total spend (received purchases + approved expenses)
        $purchaseSpend = (float) PurchaseOrder::where('status', 'received')->sum('total');
        $expenseSpend = (float) Expense::where('status', 'approved')->sum('amount');

        // Pending actions (things needing attention)
        $pendingBills = RaBill::where('status', 'submitted')->count();
        $pendingExpenses = Expense::where('status', 'pending')->count();

        return [
            'active_projects'   => $activeProjects,
            'total_billed'      => $totalBilled,
            'total_collected'   => $totalCollected,
            'outstanding'       => $outstanding,
            'purchase_spend'    => $purchaseSpend,
            'expense_spend'     => $expenseSpend,
            'total_spend'       => round($purchaseSpend + $expenseSpend, 2),
            'pending_bills'     => $pendingBills,
            'pending_expenses'  => $pendingExpenses,
        ];
    }

    /**
     * Per-project profitability: contract value vs billed vs costs.
     * Costs = received purchases + approved expenses.
     */
    public function projectProfitability(): array
    {
        return Project::query()
            ->select('id', 'name', 'project_code', 'contract_value', 'status')
            ->get()
            ->map(function ($project) {
                $billed = (float) RaBill::where('project_id', $project->id)
                    ->whereIn('status', ['approved', 'paid'])->sum('net_payable');

                $purchaseCost = (float) PurchaseOrder::where('project_id', $project->id)
                    ->where('status', 'received')->sum('total');

                $expenseCost = (float) Expense::where('project_id', $project->id)
                    ->where('status', 'approved')->sum('amount');

                $totalCost = round($purchaseCost + $expenseCost, 2);
                $margin = round($billed - $totalCost, 2);
                $marginPct = $billed > 0 ? round(($margin / $billed) * 100, 1) : 0;

                return [
                    'id'             => $project->id,
                    'name'           => $project->name,
                    'project_code'   => $project->project_code,
                    'status'         => $project->status,
                    'contract_value' => (float) $project->contract_value,
                    'billed'         => $billed,
                    'purchase_cost'  => $purchaseCost,
                    'expense_cost'   => $expenseCost,
                    'total_cost'     => $totalCost,
                    'margin'         => $margin,
                    'margin_pct'     => $marginPct,
                ];
            })
            ->values()
            ->all();
    }

    /**
     * Spending grouped by expense category (approved only).
     */
    public function expenseBreakdown(): array
    {
        return Expense::query()
            ->where('expenses.status', 'approved')
            ->join('expense_categories', 'expenses.expense_category_id', '=', 'expense_categories.id')
            ->select('expense_categories.name', DB::raw('SUM(expenses.amount) as total'))
            ->groupBy('expense_categories.name')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => ['name' => $row->name, 'total' => (float) $row->total])
            ->all();
    }

    /**
     * Billing vs collection over recent RA bills — receivables view.
     */
    public function billingCollection(): array
    {
        $bills = RaBill::with('project:id,name')
            ->whereIn('status', ['approved', 'paid'])
            ->orderByDesc('bill_date')
            ->limit(20)
            ->get();

        return $bills->map(function ($bill) {
            $paid = (float) $bill->payments()->sum('amount');
            return [
                'id'          => $bill->id,
                'label'       => ($bill->project?->name ?? 'Project') . " · RA-{$bill->bill_no}",
                'net_payable' => (float) $bill->net_payable,
                'collected'   => $paid,
                'outstanding' => round((float) $bill->net_payable - $paid, 2),
                'bill_date'   => $bill->bill_date->toDateString(),
            ];
        })->all();
    }

    /**
     * Payroll totals by run (finalized runs are the real cost).
     */
    public function payrollSummary(): array
    {
        return Payslip::query()
            ->join('payroll_runs', 'payslips.payroll_run_id', '=', 'payroll_runs.id')
            ->select(
                'payroll_runs.id',
                'payroll_runs.title',
                'payroll_runs.status',
                DB::raw('SUM(payslips.net_pay) as total_net'),
                DB::raw('SUM(payslips.gross_pay) as total_gross'),
                DB::raw('COUNT(payslips.id) as headcount'),
            )
            ->groupBy('payroll_runs.id', 'payroll_runs.title', 'payroll_runs.status')
            ->orderByDesc('payroll_runs.id')
            ->limit(12)
            ->get()
            ->map(fn ($row) => [
                'id'          => $row->id,
                'title'       => $row->title,
                'status'      => $row->status,
                'total_net'   => (float) $row->total_net,
                'total_gross' => (float) $row->total_gross,
                'headcount'   => (int) $row->headcount,
            ])
            ->all();
    }
}