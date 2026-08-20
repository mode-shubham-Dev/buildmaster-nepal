<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    public function __construct(protected ReportService $reports) {}

    public function overview(): JsonResponse
    {
        return response()->json([
            'kpis'            => $this->reports->dashboardKpis(),
            'profitability'   => $this->reports->projectProfitability(),
            'expense_breakdown' => $this->reports->expenseBreakdown(),
            'billing_collection' => $this->reports->billingCollection(),
            'payroll_summary' => $this->reports->payrollSummary(),
        ]);
    }
}