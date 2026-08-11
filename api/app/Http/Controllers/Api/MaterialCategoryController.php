<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MaterialCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MaterialCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = MaterialCategory::withCount('materials')->orderBy('name')->get();

        return response()->json(['categories' => $categories]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255', 'unique:material_categories,name'],
            'description' => ['nullable', 'string'],
        ]);

        $category = MaterialCategory::create($data);

        return response()->json([
            'message'  => 'Category created successfully.',
            'category' => $category,
        ], 201);
    }

    public function destroy(MaterialCategory $materialCategory): JsonResponse
    {
        $materialCategory->delete();

        return response()->json(['message' => 'Category deleted successfully.']);
    }
}