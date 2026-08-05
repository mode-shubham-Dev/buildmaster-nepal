<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmergencyContact;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmergencyContactController extends Controller
{
    /**
     * POST /employees/{employee}/emergency-contacts
     */
    public function store(Request $request, Employee $employee): JsonResponse
    {
        $data = $request->validate([
            'name'         => ['required', 'string', 'max:255'],
            'relationship' => ['nullable', 'string', 'max:255'],
            'phone'        => ['required', 'string', 'max:50'],
            'address'      => ['nullable', 'string'],
        ]);

        $contact = $employee->emergencyContacts()->create($data);

        return response()->json([
            'message' => 'Emergency contact added successfully.',
            'contact' => $contact,
        ], 201);
    }

    /**
     * DELETE /emergency-contacts/{emergencyContact}
     */
    public function destroy(EmergencyContact $emergencyContact): JsonResponse
    {
        $emergencyContact->delete();

        return response()->json(['message' => 'Emergency contact removed successfully.']);
    }
}