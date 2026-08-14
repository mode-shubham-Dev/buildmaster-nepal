<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Equipment\StoreEquipmentRequest;
use App\Models\Equipment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EquipmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $equipment = Equipment::with('project:id,name,project_code')
            ->when($request->search, fn ($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%"))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->category, fn ($q) => $q->where('category', $request->category))
            ->latest()
            ->get();

        return response()->json(['equipment' => $equipment]);
    }

    public function store(StoreEquipmentRequest $request): JsonResponse
    {
        $equipment = Equipment::create($request->validated());

        return response()->json([
            'message'   => 'Equipment added successfully.',
            'equipment' => $equipment->load('project:id,name'),
        ], 201);
    }

    public function show(Equipment $equipment): JsonResponse
    {
        $equipment->load(['project:id,name,project_code', 'maintenanceLogs']);

        return response()->json(['equipment' => $equipment]);
    }

    public function update(StoreEquipmentRequest $request, Equipment $equipment): JsonResponse
    {
        $equipment->update($request->validated());

        return response()->json([
            'message'   => 'Equipment updated successfully.',
            'equipment' => $equipment->load('project:id,name'),
        ]);
    }

    public function destroy(Equipment $equipment): JsonResponse
    {
        $equipment->delete();

        return response()->json(['message' => 'Equipment deleted successfully.']);
    }

    /**
     * Assign equipment to a project (or unassign with project_id = null).
     * Assigning sets status to in_use; unassigning frees it to available.
     */
    public function assign(Request $request, Equipment $equipment): JsonResponse
    {
        $data = $request->validate([
            'project_id' => ['nullable', 'exists:projects,id'],
        ]);

        $equipment->update([
            'project_id' => $data['project_id'] ?? null,
            'status'     => $data['project_id'] ? 'in_use' : 'available',
        ]);

        return response()->json([
            'message'   => $data['project_id'] ? 'Equipment assigned.' : 'Equipment unassigned.',
            'equipment' => $equipment->fresh()->load('project:id,name'),
        ]);
    }

    /**
     * Log a maintenance record. Sets status to maintenance if requested.
     */
    public function logMaintenance(Request $request, Equipment $equipment): JsonResponse
    {
        $data = $request->validate([
            'service_date'      => ['required', 'date'],
            'type'              => ['nullable', 'string', 'max:100'],
            'description'       => ['required', 'string'],
            'cost'              => ['nullable', 'numeric', 'min:0'],
            'next_service_date' => ['nullable', 'date'],
            'set_maintenance'   => ['boolean'],
        ]);

        $log = $equipment->maintenanceLogs()->create([
            'service_date'      => $data['service_date'],
            'type'              => $data['type'] ?? null,
            'description'       => $data['description'],
            'cost'              => $data['cost'] ?? 0,
            'next_service_date' => $data['next_service_date'] ?? null,
            'logged_by'         => $request->user()->id,
        ]);

        // optionally flip status to maintenance
        if (! empty($data['set_maintenance'])) {
            $equipment->update(['status' => 'maintenance']);
        }

        return response()->json([
            'message'     => 'Maintenance logged.',
            'maintenance' => $log,
            'equipment'   => $equipment->fresh()->load('maintenanceLogs'),
        ], 201);
    }

    public function deleteMaintenance(\App\Models\EquipmentMaintenance $maintenance): JsonResponse
    {
        $maintenance->delete();

        return response()->json(['message' => 'Maintenance record deleted.']);
    }
}