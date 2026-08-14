<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Subcontractor\StoreSubcontractorRequest;
use App\Models\Subcontractor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubcontractorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $subcontractors = Subcontractor::withCount('workPackages')
            ->when($request->search, fn ($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('specialty', 'like', "%{$request->search}%"))
            ->latest()
            ->get();

        return response()->json(['subcontractors' => $subcontractors]);
    }

    public function store(StoreSubcontractorRequest $request): JsonResponse
    {
        $subcontractor = Subcontractor::create($request->validated());

        return response()->json([
            'message'       => 'Subcontractor created successfully.',
            'subcontractor' => $subcontractor,
        ], 201);
    }

    /**
     * Full profile with work packages (each carrying derived total_paid + balance)
     * and aggregate stats.
     */
    public function show(Subcontractor $subcontractor): JsonResponse
    {
        $subcontractor->load([
            'workPackages.project:id,name,project_code',
            'workPackages.payments',
        ]);

        $packages = $subcontractor->workPackages;

        $stats = [
            'total_packages'    => $packages->count(),
            'total_contract'    => (float) $packages->sum('contract_amount'),
            'total_paid'        => (float) $packages->sum('total_paid'),
            'total_outstanding' => (float) $packages->sum('balance'),
        ];

        return response()->json([
            'subcontractor' => $subcontractor,
            'stats'         => $stats,
        ]);
    }

    public function update(StoreSubcontractorRequest $request, Subcontractor $subcontractor): JsonResponse
    {
        $subcontractor->update($request->validated());

        return response()->json([
            'message'       => 'Subcontractor updated successfully.',
            'subcontractor' => $subcontractor,
        ]);
    }

    public function destroy(Subcontractor $subcontractor): JsonResponse
    {
        $subcontractor->delete();

        return response()->json(['message' => 'Subcontractor deleted successfully.']);
    }
}