<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Department\StoreDepartmentRequest;
use App\Http\Requests\Department\UpdateDepartmentRequest;
use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    /**
     * GET /departments — list departments, optionally filtered by branch.
     * e.g. /departments?branch_id=1
     */
    public function index(Request $request): JsonResponse
    {
        $departments = Department::with('branch')
            ->when($request->branch_id, fn ($q) => $q->where('branch_id', $request->branch_id))
            ->withCount('teams')
            ->latest()
            ->get();

        return response()->json(['departments' => $departments]);
    }

    /**
     * POST /departments
     */
    public function store(StoreDepartmentRequest $request): JsonResponse
    {
        $department = Department::create($request->validated());

        return response()->json([
            'message'    => 'Department created successfully.',
            'department' => $department,
        ], 201);
    }

    /**
     * PUT /departments/{department}
     */
    public function update(UpdateDepartmentRequest $request, Department $department): JsonResponse
    {
        $department->update($request->validated());

        return response()->json([
            'message'    => 'Department updated successfully.',
            'department' => $department,
        ]);
    }

    /**
     * DELETE /departments/{department}
     */
    public function destroy(Department $department): JsonResponse
    {
        $department->delete();

        return response()->json(['message' => 'Department deleted successfully.']);
    }
}