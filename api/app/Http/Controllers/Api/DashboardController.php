<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ActionCenterService;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        protected ActionCenterService $actionCenter,
        protected ReportService $reports,
    ) {}

    /**
     * The personalized dashboard payload. Everything is permission-gated,
     * so each user only receives the sections they're allowed to see.
     * Composes existing services — no new business logic.
     */
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();

        $payload = [
            // "Needs your attention" — reuses the M25 action center (already permission-gated per item)
            'actions' => $this->actionCenter->forUser($user),
        ];

        // Financial pulse — only if they can see reports
        if ($user->can('reports.view')) {
            $payload['kpis'] = $this->reports->dashboardKpis();
            $payload['profitability'] = $this->reports->projectProfitability();
        }

        return response()->json($payload);
    }
}