<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\StoreEmployeeRequest;
use App\Http\Requests\Employee\UpdateEmployeeRequest;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    /**
     * GET /employees — list employees (with search + department filter).
     */
    public function index(Request $request): JsonResponse
    {
        $employees = Employee::with('department')
            ->when($request->search, function ($q) use ($request) {
                $q->where(function ($sub) use ($request) {
                    $sub->where('first_name', 'like', "%{$request->search}%")
                        ->orWhere('last_name', 'like', "%{$request->search}%")
                        ->orWhere('employee_code', 'like', "%{$request->search}%")
                        ->orWhere('job_title', 'like', "%{$request->search}%");
                });
            })
            ->when($request->department_id, fn ($q) => $q->where('department_id', $request->department_id))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->get();

        return response()->json([
            'employees' => EmployeeResource::collection($employees),
        ]);
    }

    /**
     * POST /employees — create an employee.
     */
    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        $employee = Employee::create($request->validated());

        return response()->json([
            'message'  => 'Employee created successfully.',
            'employee' => new EmployeeResource($employee),
        ], 201);
    }

    /**
     * GET /employees/{employee} — show one employee with ALL related data.
     */
    public function show(Employee $employee): JsonResponse
    {
        // Eager-load the relations so the resource includes them.
        $employee->load(['department', 'skills', 'certifications', 'emergencyContacts']);

        return response()->json([
            'employee' => new EmployeeResource($employee),
        ]);
    }

    /**
     * PUT /employees/{employee} — update an employee.
     */
    public function update(UpdateEmployeeRequest $request, Employee $employee): JsonResponse
    {
        $employee->update($request->validated());

        return response()->json([
            'message'  => 'Employee updated successfully.',
            'employee' => new EmployeeResource($employee),
        ]);
    }

    /**
     * DELETE /employees/{employee}
     */
    public function destroy(Employee $employee): JsonResponse
    {
        $employee->delete();

        return response()->json(['message' => 'Employee deleted successfully.']);
    }
}