<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectMemberController extends Controller
{
    /**
     * POST /projects/{project}/members — assign an employee to the project.
     */
    public function store(Request $request, Project $project): JsonResponse
    {
        $data = $request->validate([
            'employee_id'     => ['required', 'exists:employees,id'],
            'role_on_project' => ['nullable', 'string', 'max:255'],
        ]);

        // syncWithoutDetaching adds without removing others; avoids duplicate errors
        $project->members()->syncWithoutDetaching([
            $data['employee_id'] => ['role_on_project' => $data['role_on_project'] ?? null],
        ]);

        return response()->json(['message' => 'Member assigned successfully.'], 201);
    }

    /**
     * DELETE /projects/{project}/members/{employee} — remove from the project.
     */
    public function destroy(Project $project, int $employee): JsonResponse
    {
        $project->members()->detach($employee);

        return response()->json(['message' => 'Member removed successfully.']);
    }
}