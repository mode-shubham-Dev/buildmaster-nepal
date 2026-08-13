<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Supplier\StoreSupplierRequest;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $suppliers = Supplier::withCount('purchaseOrders')
            ->when($request->search, fn ($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('category', 'like', "%{$request->search}%"))
            ->when($request->category, fn ($q) => $q->where('category', $request->category))
            ->latest()
            ->get();

        return response()->json(['suppliers' => $suppliers]);
    }

    public function store(StoreSupplierRequest $request): JsonResponse
    {
        $supplier = Supplier::create($request->validated());

        return response()->json([
            'message'  => 'Supplier created successfully.',
            'supplier' => $supplier,
        ], 201);
    }

    /**
     * Full supplier profile with DERIVED purchase history + stats.
     */
    public function show(Supplier $supplier): JsonResponse
    {
        $supplier->load(['contacts', 'attachments']);

        // Purchase history — derived from their existing POs (linked via M14)
        $orders = $supplier->purchaseOrders()
            ->select('id', 'po_number', 'status', 'total', 'order_date', 'supplier_id')
            ->latest('order_date')
            ->get();

        // Performance stats — computed from the POs
        $receivedOrders = $orders->where('status', 'received');
        $stats = [
            'total_orders'    => $orders->count(),
            'received_orders' => $receivedOrders->count(),
            'total_value'     => (float) $receivedOrders->sum('total'),  // value of completed purchases
        ];

        return response()->json([
            'supplier'         => $supplier,
            'purchase_history' => $orders,
            'stats'            => $stats,
        ]);
    }

    public function update(StoreSupplierRequest $request, Supplier $supplier): JsonResponse
    {
        $supplier->update($request->validated());

        return response()->json([
            'message'  => 'Supplier updated successfully.',
            'supplier' => $supplier,
        ]);
    }

    public function destroy(Supplier $supplier): JsonResponse
    {
        $supplier->delete();

        return response()->json(['message' => 'Supplier deleted successfully.']);
    }
}