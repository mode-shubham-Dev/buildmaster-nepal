<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certification;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CertificationController extends Controller
{
    /**
     * POST /employees/{employee}/certifications
     */
    public function store(Request $request, Employee $employee): JsonResponse
    {
        $data = $request->validate([
            'name'              => ['required', 'string', 'max:255'],
            'issuing_authority' => ['nullable', 'string', 'max:255'],
            'issue_date'        => ['nullable', 'date'],
            'expiry_date'       => ['nullable', 'date'],
        ]);

        $certification = $employee->certifications()->create($data);

        return response()->json([
            'message'       => 'Certification added successfully.',
            'certification' => $certification,
        ], 201);
    }

    /**
     * DELETE /certifications/{certification}
     */
    public function destroy(Certification $certification): JsonResponse
    {
        $certification->delete();

        return response()->json(['message' => 'Certification removed successfully.']);
    }
}