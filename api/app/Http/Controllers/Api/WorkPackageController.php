<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Subcontractor\StoreWorkPackageRequest;
use App\Models\WorkPackage;
use App\Services\SubcontractorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkPackageController extends Controller
{
    public function __construct(
        protected SubcontractorService $subcontractorService
    ) {}

    /**
     * Work packages for a project (for the project's subcontractors tab).
     */
    public function forProject(\App\Models\Project $project): JsonResponse
    {
        $packages = WorkPackage::with(['subcontractor:id,name,specialty', 'payments'])
            ->where('project_id', $project->id)
            ->latest()
            ->get();

        return response()->json(['work_packages' => $packages]);
    }

    public function store(StoreWorkPackageRequest $request): JsonResponse
    {
        $package = WorkPackage::create($request->validated());

        return response()->json([
            'message'      => 'Work package created successfully.',
            'work_package' => $package->load('subcontractor:id,name', 'project:id,name'),
        ], 201);
    }

    public function show(WorkPackage $workPackage): JsonResponse
    {
        $workPackage->load([
            'subcontractor:id,name,specialty',
            'project:id,name,project_code',
            'payments.payer:id,name',
        ]);

        return response()->json(['work_package' => $workPackage]);
    }

    public function update(StoreWorkPackageRequest $request, WorkPackage $workPackage): JsonResponse
    {
        $workPackage->update($request->validated());

        return response()->json([
            'message'      => 'Work package updated successfully.',
            'work_package' => $workPackage->load('subcontractor:id,name', 'payments'),
        ]);
    }

    public function destroy(WorkPackage $workPackage): JsonResponse
    {
        $workPackage->delete();

        return response()->json(['message' => 'Work package deleted successfully.']);
    }

    /**
     * Record a payment — uses the service's over-payment guard.
     */
    public function pay(Request $request, WorkPackage $workPackage): JsonResponse
    {
        $data = $request->validate([
            'amount'       => ['required', 'numeric', 'gt:0'],
            'payment_date' => ['required', 'date'],
            'method'       => ['nullable', 'in:cash,bank_transfer,cheque'],
            'reference'    => ['nullable', 'string', 'max:255'],
            'remarks'      => ['nullable', 'string'],
        ]);

        $payment = $this->subcontractorService->pay($workPackage, $data, $request->user()->id);

        return response()->json([
            'message'      => 'Payment recorded successfully.',
            'payment'      => $payment,
            'work_package' => $workPackage->fresh()->load('payments'),  // returns updated balance
        ], 201);
    }

    public function deletePayment(\App\Models\SubcontractorPayment $payment): JsonResponse
    {
        $payment->delete();

        return response()->json(['message' => 'Payment deleted successfully.']);
    }
}