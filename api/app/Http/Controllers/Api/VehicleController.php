<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vehicle\StoreVehicleRequest;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $vehicles = Vehicle::with('project:id,name,project_code')
            ->when($request->search, fn ($q) =>
                $q->where('registration_no', 'like', "%{$request->search}%")
                  ->orWhere('make', 'like', "%{$request->search}%")
                  ->orWhere('model', 'like', "%{$request->search}%"))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->get();

        return response()->json(['vehicles' => $vehicles]);
    }

    public function store(StoreVehicleRequest $request): JsonResponse
    {
        $vehicle = Vehicle::create($request->validated());

        return response()->json([
            'message' => 'Vehicle added successfully.',
            'vehicle' => $vehicle->load('project:id,name'),
        ], 201);
    }

    public function show(Vehicle $vehicle): JsonResponse
    {
        $vehicle->load(['project:id,name,project_code', 'fuelLogs', 'maintenanceLogs']);

        return response()->json(['vehicle' => $vehicle]);
    }

    public function update(StoreVehicleRequest $request, Vehicle $vehicle): JsonResponse
    {
        $vehicle->update($request->validated());

        return response()->json([
            'message' => 'Vehicle updated successfully.',
            'vehicle' => $vehicle->load('project:id,name'),
        ]);
    }

    public function destroy(Vehicle $vehicle): JsonResponse
    {
        $vehicle->delete();

        return response()->json(['message' => 'Vehicle deleted successfully.']);
    }

    /**
     * Assign to a project (or unassign with project_id = null). Auto-syncs status.
     */
    public function assign(Request $request, Vehicle $vehicle): JsonResponse
    {
        $data = $request->validate([
            'project_id' => ['nullable', 'exists:projects,id'],
        ]);

        $vehicle->update([
            'project_id' => $data['project_id'] ?? null,
            'status'     => $data['project_id'] ? 'in_use' : 'available',
        ]);

        return response()->json([
            'message' => $data['project_id'] ? 'Vehicle assigned.' : 'Vehicle unassigned.',
            'vehicle' => $vehicle->fresh()->load('project:id,name'),
        ]);
    }

    /**
     * Log a fuel entry. Feeds the derived total_fuel_cost.
     */
    public function logFuel(Request $request, Vehicle $vehicle): JsonResponse
    {
        $data = $request->validate([
            'fuel_date' => ['required', 'date'],
            'litres'    => ['required', 'numeric', 'gt:0'],
            'cost'      => ['required', 'numeric', 'min:0'],
            'odometer'  => ['nullable', 'integer', 'min:0'],
            'filled_by' => ['nullable', 'string', 'max:255'],
        ]);

        $log = $vehicle->fuelLogs()->create([
            ...$data,
            'logged_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Fuel log recorded.',
            'fuel_log' => $log,
            'vehicle'  => $vehicle->fresh()->load(['fuelLogs', 'maintenanceLogs']),
        ], 201);
    }

    /**
     * Log a maintenance record. Optionally flips status to maintenance.
     */
    public function logMaintenance(Request $request, Vehicle $vehicle): JsonResponse
    {
        $data = $request->validate([
            'service_date'      => ['required', 'date'],
            'type'              => ['nullable', 'string', 'max:100'],
            'description'       => ['required', 'string'],
            'cost'              => ['nullable', 'numeric', 'min:0'],
            'next_service_date' => ['nullable', 'date'],
            'set_maintenance'   => ['boolean'],
        ]);

        $log = $vehicle->maintenanceLogs()->create([
            'service_date'      => $data['service_date'],
            'type'              => $data['type'] ?? null,
            'description'       => $data['description'],
            'cost'              => $data['cost'] ?? 0,
            'next_service_date' => $data['next_service_date'] ?? null,
            'logged_by'         => $request->user()->id,
        ]);

        if (! empty($data['set_maintenance'])) {
            $vehicle->update(['status' => 'maintenance']);
        }

        return response()->json([
            'message'     => 'Maintenance logged.',
            'maintenance' => $log,
            'vehicle'     => $vehicle->fresh()->load(['fuelLogs', 'maintenanceLogs']),
        ], 201);
    }

    public function deleteFuelLog(\App\Models\VehicleFuelLog $fuelLog): JsonResponse
    {
        $fuelLog->delete();
        return response()->json(['message' => 'Fuel log deleted.']);
    }

    public function deleteMaintenance(\App\Models\VehicleMaintenance $maintenance): JsonResponse
    {
        $maintenance->delete();
        return response()->json(['message' => 'Maintenance record deleted.']);
    }
}