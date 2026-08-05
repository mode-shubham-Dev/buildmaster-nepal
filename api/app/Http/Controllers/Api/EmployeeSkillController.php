<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeeSkill;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeSkillController extends Controller
{
    /**
     * POST /employees/{employee}/skills — add a skill to an employee.
     */
    public function store(Request $request, Employee $employee): JsonResponse
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'proficiency' => ['required', 'in:beginner,intermediate,expert'],
        ]);

        $skill = $employee->skills()->create($data);

        return response()->json([
            'message' => 'Skill added successfully.',
            'skill'   => $skill,
        ], 201);
    }

    /**
     * DELETE /skills/{skill}
     */
    public function destroy(EmployeeSkill $skill): JsonResponse
    {
        $skill->delete();

        return response()->json(['message' => 'Skill removed successfully.']);
    }
}