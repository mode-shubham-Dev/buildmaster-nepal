<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Stock\RecordMovementRequest;
use App\Models\Material;
use App\Models\StockMovement;
use App\Services\StockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockController extends Controller
{
    public function __construct(
        protected StockService $stockService
    ) {}

    /**
     * POST /stock/movements — record a movement (INSERT ONLY).
     * For 'out' movements, we check there's enough stock first.
     */
    public function record(RecordMovementRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Guard: can't issue out more than what's in the warehouse.
        if ($data['type'] === 'out') {
            $available = $this->stockService->balance($data['warehouse_id'], $data['material_id']);
            if ($data['quantity'] > $available) {
                return response()->json([
                    'message' => "Insufficient stock. Available: {$available}.",
                ], 422);
            }
        }

        $data['moved_by'] = $request->user()->id;
        $data['moved_at'] = now();

        $movement = StockMovement::create($data);

        return response()->json([
            'message'  => 'Stock movement recorded successfully.',
            'movement' => $movement->load(['material:id,name,unit', 'warehouse:id,name']),
        ], 201);
    }

    /**
     * GET /stock/levels — current derived balances, with material + reorder info.
     * Optional ?warehouse_id= filter.
     */
    public function levels(Request $request): JsonResponse
    {
        $balances = $this->stockService->balances(
            $request->warehouse_id ? (int) $request->warehouse_id : null
        );

        // enrich each balance with material details + low-stock flag
        $materialIds = collect($balances)->pluck('material_id')->unique();
        $materials = Material::whereIn('id', $materialIds)->get()->keyBy('id');

        $levels = collect($balances)->map(function ($b) use ($materials) {
            $material = $materials->get($b['material_id']);
            return [
                'warehouse_id'  => $b['warehouse_id'],
                'material_id'   => $b['material_id'],
                'material_name' => $material?->name,
                'material_code' => $material?->code,
                'unit'          => $material?->unit,
                'balance'       => $b['balance'],
                'reorder_level' => $material ? (float) $material->reorder_level : 0,
                'low_stock'     => $material ? $b['balance'] <= (float) $material->reorder_level : false,
            ];
        })->values();

        return response()->json(['levels' => $levels]);
    }

    /**
     * GET /stock/movements — the ledger (movement history), most recent first.
     * Optional filters: ?warehouse_id= &material_id=
     */
    public function movements(Request $request): JsonResponse
    {
        $movements = StockMovement::query()
            ->with(['material:id,name,unit', 'warehouse:id,name', 'mover:id,name', 'project:id,name'])
            ->when($request->warehouse_id, fn ($q) => $q->where('warehouse_id', $request->warehouse_id))
            ->when($request->material_id, fn ($q) => $q->where('material_id', $request->material_id))
            ->latest('moved_at')
            ->limit(100)
            ->get();

        return response()->json(['movements' => $movements]);
    }
}