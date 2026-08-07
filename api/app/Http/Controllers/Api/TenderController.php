<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tender\StoreTenderRequest;
use App\Http\Requests\Tender\UpdateTenderRequest;
use App\Http\Resources\TenderResource;
use App\Models\Tender;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenderController extends Controller
{
    /**
     * GET /tenders — list with search + status filter.
     */
    public function index(Request $request): JsonResponse
    {
        $tenders = Tender::with('client')
            ->when($request->search, function ($q) use ($request) {
                $q->where(function ($sub) use ($request) {
                    $sub->where('title', 'like', "%{$request->search}%")
                        ->orWhere('reference_no', 'like', "%{$request->search}%")
                        ->orWhere('issuing_authority', 'like', "%{$request->search}%");
                });
            })
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->get();

        return response()->json([
            'tenders' => TenderResource::collection($tenders),
        ]);
    }

    /**
     * POST /tenders
     */
    public function store(StoreTenderRequest $request): JsonResponse
    {
        $tender = Tender::create($request->validated());

        return response()->json([
            'message' => 'Tender created successfully.',
            'tender'  => new TenderResource($tender->load('client')),
        ], 201);
    }

    /**
     * GET /tenders/{tender}
     */
    public function show(Tender $tender): JsonResponse
    {
        $tender->load('client');

        return response()->json([
            'tender' => new TenderResource($tender),
        ]);
    }

    /**
     * PUT /tenders/{tender}
     */
    public function update(UpdateTenderRequest $request, Tender $tender): JsonResponse
    {
        $tender->update($request->validated());

        return response()->json([
            'message' => 'Tender updated successfully.',
            'tender'  => new TenderResource($tender->load('client')),
        ]);
    }

    /**
     * DELETE /tenders/{tender}
     */
    public function destroy(Tender $tender): JsonResponse
    {
        $tender->delete();

        return response()->json(['message' => 'Tender deleted successfully.']);
    }
}