<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Warehouse\StoreWarehouseRequest;
use App\Models\Warehouse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $warehouses = Warehouse::with('project:id,name,project_code')
            ->when($request->search, fn ($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%"))
            ->latest()
            ->get();

        return response()->json(['warehouses' => $warehouses]);
    }

    public function store(StoreWarehouseRequest $request): JsonResponse
    {
        $warehouse = Warehouse::create($request->validated());

        return response()->json([
            'message'   => 'Warehouse created successfully.',
            'warehouse' => $warehouse->load('project:id,name,project_code'),
        ], 201);
    }

    public function show(Warehouse $warehouse): JsonResponse
    {
        return response()->json(['warehouse' => $warehouse->load('project:id,name,project_code')]);
    }

    public function update(StoreWarehouseRequest $request, Warehouse $warehouse): JsonResponse
    {
        // allow same code on self
        $data = $request->validated();
        $warehouse->update($data);

        return response()->json([
            'message'   => 'Warehouse updated successfully.',
            'warehouse' => $warehouse->load('project:id,name,project_code'),
        ]);
    }

    public function destroy(Warehouse $warehouse): JsonResponse
    {
        $warehouse->delete();

        return response()->json(['message' => 'Warehouse deleted successfully.']);
    }
}