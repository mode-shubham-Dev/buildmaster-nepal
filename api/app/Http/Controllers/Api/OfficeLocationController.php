<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\OfficeLocation\StoreOfficeLocationRequest;
use App\Http\Requests\OfficeLocation\UpdateOfficeLocationRequest;
use App\Models\Company;
use App\Models\OfficeLocation;
use Illuminate\Http\JsonResponse;

class OfficeLocationController extends Controller
{
    /**
     * GET /office-locations
     */
    public function index(): JsonResponse
    {
        $locations = OfficeLocation::latest()->get();

        return response()->json(['office_locations' => $locations]);
    }

    /**
     * POST /office-locations
     */
    public function store(StoreOfficeLocationRequest $request): JsonResponse
    {
        $company = Company::first() ?? Company::create(['name' => 'My Company']);

        $location = $company->officeLocations()->create($request->validated());

        return response()->json([
            'message'         => 'Office location created successfully.',
            'office_location' => $location,
        ], 201);
    }

    /**
     * PUT /office-locations/{officeLocation}
     */
    public function update(UpdateOfficeLocationRequest $request, OfficeLocation $officeLocation): JsonResponse
    {
        $officeLocation->update($request->validated());

        return response()->json([
            'message'         => 'Office location updated successfully.',
            'office_location' => $officeLocation,
        ]);
    }

    /**
     * DELETE /office-locations/{officeLocation}
     */
    public function destroy(OfficeLocation $officeLocation): JsonResponse
    {
        $officeLocation->delete();

        return response()->json(['message' => 'Office location deleted successfully.']);
    }
}