<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Purchase\StorePurchaseOrderRequest;
use App\Models\PurchaseOrder;
use App\Services\PurchaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseOrderController extends Controller
{
    public function __construct(
        protected PurchaseService $purchaseService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $orders = PurchaseOrder::with(['supplier:id,name', 'warehouse:id,name'])
            ->withCount('items')
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->search, fn ($q) => $q->where('po_number', 'like', "%{$request->search}%"))
            ->latest()
            ->get();

        return response()->json(['orders' => $orders]);
    }

    public function show(PurchaseOrder $purchaseOrder): JsonResponse
    {
        $purchaseOrder->load([
            'supplier', 'warehouse:id,name', 'project:id,name,project_code',
            'items.material:id,name,unit', 'creator:id,name', 'approver:id,name',
        ]);

        return response()->json(['order' => $purchaseOrder]);
    }

    public function store(StorePurchaseOrderRequest $request): JsonResponse
    {
        $data = $request->validated();
        $items = $data['items'];
        unset($data['items']);

        $data['created_by'] = $request->user()->id;
        $data['vat_percentage'] = $data['vat_percentage'] ?? 13;
        $data['status'] = 'draft';

        $po = PurchaseOrder::create($data);

        // Create line items — amount computed on the backend (source of truth)
        foreach ($items as $item) {
            $po->items()->create([
                'material_id' => $item['material_id'],
                'quantity'    => $item['quantity'],
                'rate'        => $item['rate'],
                'amount'      => round($item['quantity'] * $item['rate'], 2),
            ]);
        }

        // Compute subtotal / VAT / total from the stored items
        $this->purchaseService->recalculate($po);

        return response()->json([
            'message' => 'Purchase order created successfully.',
            'order'   => $po->load(['supplier:id,name', 'items.material:id,name,unit']),
        ], 201);
    }

    public function destroy(PurchaseOrder $purchaseOrder): JsonResponse
    {
        if ($purchaseOrder->status === 'received') {
            return response()->json([
                'message' => 'A received purchase order cannot be deleted.',
            ], 422);
        }

        $purchaseOrder->delete();

        return response()->json(['message' => 'Purchase order deleted successfully.']);
    }

    /* ---------- STATE MACHINE TRANSITIONS ---------- */

    public function submit(PurchaseOrder $purchaseOrder): JsonResponse
    {
        $this->purchaseService->transition($purchaseOrder, 'submitted');
        return response()->json(['message' => 'Purchase order submitted for approval.']);
    }

    public function approve(Request $request, PurchaseOrder $purchaseOrder): JsonResponse
    {
        DB::transaction(function () use ($request, $purchaseOrder) {
            $this->purchaseService->transition($purchaseOrder, 'approved');
            $purchaseOrder->update([
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
            ]);
        });

        return response()->json(['message' => 'Purchase order approved.']);
    }

    public function reject(PurchaseOrder $purchaseOrder): JsonResponse
    {
        $this->purchaseService->transition($purchaseOrder, 'rejected');
        return response()->json(['message' => 'Purchase order rejected.']);
    }

    public function cancel(PurchaseOrder $purchaseOrder): JsonResponse
    {
        $this->purchaseService->transition($purchaseOrder, 'cancelled');
        return response()->json(['message' => 'Purchase order cancelled.']);
    }

    /**
     * RECEIVE — marks received AND writes stock-in movements to the ledger.
     */
    public function receive(Request $request, PurchaseOrder $purchaseOrder): JsonResponse
    {
        $this->purchaseService->receive($purchaseOrder, $request->user()->id);

        return response()->json([
            'message' => 'Purchase order received. Stock updated in the warehouse.',
            'order'   => $purchaseOrder->fresh()->load('items.material:id,name'),
        ]);
    }
}