<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Branch\StoreBranchRequest;
use App\Http\Requests\Branch\UpdateBranchRequest;
use App\Models\Branch;
use App\Models\Company;
use Illuminate\Http\JsonResponse;

class BranchController extends Controller
{
    /**
     * GET /branches — list all branches (with their departments count).
     */
    public function index(): JsonResponse
    {
        $branches = Branch::withCount('departments')->latest()->get();

        return response()->json(['branches' => $branches]);
    }

    /**
     * POST /branches — create a branch under the company.
     */
    public function store(StoreBranchRequest $request): JsonResponse
    {
        $company = Company::first() ?? Company::create(['name' => 'My Company']);

        $branch = $company->branches()->create($request->validated());

        return response()->json([
            'message' => 'Branch created successfully.',
            'branch'  => $branch,
        ], 201);
    }

    /**
     * PUT /branches/{branch} — update a branch.
     */
    public function update(UpdateBranchRequest $request, Branch $branch): JsonResponse
    {
        $branch->update($request->validated());

        return response()->json([
            'message' => 'Branch updated successfully.',
            'branch'  => $branch,
        ]);
    }

    /**
     * DELETE /branches/{branch}
     */
    public function destroy(Branch $branch): JsonResponse
    {
        $branch->delete();

        return response()->json(['message' => 'Branch deleted successfully.']);
    }
}