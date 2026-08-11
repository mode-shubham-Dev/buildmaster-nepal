<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Material\StoreMaterialRequest;
use App\Http\Requests\Material\UpdateMaterialRequest;
use App\Http\Resources\MaterialResource;
use App\Models\Material;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MaterialController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $materials = Material::with('category')
            ->when($request->search, function ($q) use ($request) {
                $q->where(function ($sub) use ($request) {
                    $sub->where('name', 'like', "%{$request->search}%")
                        ->orWhere('code', 'like', "%{$request->search}%");
                });
            })
            ->when($request->category_id, fn ($q) => $q->where('material_category_id', $request->category_id))
            ->latest()
            ->get();

        return response()->json([
            'materials' => MaterialResource::collection($materials),
        ]);
    }

    public function store(StoreMaterialRequest $request): JsonResponse
    {
        $material = Material::create($request->validated());

        return response()->json([
            'message'  => 'Material created successfully.',
            'material' => new MaterialResource($material->load('category')),
        ], 201);
    }

    public function show(Material $material): JsonResponse
    {
        return response()->json([
            'material' => new MaterialResource($material->load('category')),
        ]);
    }

    public function update(UpdateMaterialRequest $request, Material $material): JsonResponse
    {
        $material->update($request->validated());

        return response()->json([
            'message'  => 'Material updated successfully.',
            'material' => new MaterialResource($material->load('category')),
        ]);
    }

    public function destroy(Material $material): JsonResponse
    {
        $material->delete();

        return response()->json(['message' => 'Material deleted successfully.']);
    }
}