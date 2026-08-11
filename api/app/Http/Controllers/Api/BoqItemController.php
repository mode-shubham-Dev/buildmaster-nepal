<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Boq\StoreBoqItemRequest;
use App\Http\Requests\Boq\UpdateBoqItemRequest;
use App\Models\BoqItem;
use App\Models\Project;
use Illuminate\Http\JsonResponse;

class BoqItemController extends Controller
{
    /**
     * GET /projects/{project}/boq — all BOQ items for a project + the grand total.
     */
    public function index(Project $project): JsonResponse
    {
        $items = $project->boqItems;

        return response()->json([
            'items' => $items,
            'total' => (float) $items->sum('amount'),  // grand total, computed from stored amounts
        ]);
    }

    /**
     * POST /projects/{project}/boq — add a line item.
     * The backend computes 'amount' — the client cannot set it.
     */
    public function store(StoreBoqItemRequest $request, Project $project): JsonResponse
    {
        $data = $request->validated();

        // SOURCE OF TRUTH: amount is always quantity × rate, computed here.
        $data['amount'] = round($data['quantity'] * $data['rate'], 2);

        $item = $project->boqItems()->create($data);

        return response()->json([
            'message' => 'BOQ item added successfully.',
            'item'    => $item,
        ], 201);
    }

    /**
     * PUT /boq/{boqItem} — update a line item, recompute amount.
     */
    public function update(UpdateBoqItemRequest $request, BoqItem $boqItem): JsonResponse
    {
        $data = $request->validated();

        // Recompute on every update — the stored amount is always derived, never trusted from input.
        $data['amount'] = round($data['quantity'] * $data['rate'], 2);

        $boqItem->update($data);

        return response()->json([
            'message' => 'BOQ item updated successfully.',
            'item'    => $boqItem,
        ]);
    }

    /**
     * DELETE /boq/{boqItem}
     */
    public function destroy(BoqItem $boqItem): JsonResponse
    {
        $boqItem->delete();

        return response()->json(['message' => 'BOQ item deleted successfully.']);
    }
}