<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Models\Tender;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $projects = Project::with(['client', 'projectManager'])
            ->withCount('members')
            ->when($request->search, function ($q) use ($request) {
                $q->where(function ($sub) use ($request) {
                    $sub->where('name', 'like', "%{$request->search}%")
                        ->orWhere('project_code', 'like', "%{$request->search}%")
                        ->orWhere('site_location', 'like', "%{$request->search}%");
                });
            })
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->get();

        return response()->json([
            'projects' => ProjectResource::collection($projects),
        ]);
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = Project::create($request->validated());

        return response()->json([
            'message' => 'Project created successfully.',
            'project' => new ProjectResource($project->load(['client', 'projectManager'])),
        ], 201);
    }

    public function show(Project $project): JsonResponse
    {
        $project->load(['client', 'tender', 'projectManager', 'members']);

        return response()->json([
            'project' => new ProjectResource($project),
        ]);
    }

    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        $project->update($request->validated());

        return response()->json([
            'message' => 'Project updated successfully.',
            'project' => new ProjectResource($project->load(['client', 'projectManager'])),
        ]);
    }

    public function destroy(Project $project): JsonResponse
    {
        $project->delete();

        return response()->json(['message' => 'Project deleted successfully.']);
    }

    /**
     * POST /tenders/{tender}/convert-to-project
     * Creates a project pre-filled from a won tender.
     */
    public function convertFromTender(Request $request, Tender $tender): JsonResponse
    {
        // Generate the next project code
        $count = Project::count() + 1;
        $code = 'PRJ-' . str_pad((string) $count, 4, '0', STR_PAD_LEFT);

        $project = Project::create([
            'client_id'      => $tender->client_id,
            'tender_id'      => $tender->id,
            'project_code'   => $code,
            'name'           => $tender->title,
            'contract_value' => $tender->bid_amount,
            'budget'         => $tender->estimated_value,
            'site_location'  => $tender->issuing_authority,
            'status'         => 'planning',
        ]);

        return response()->json([
            'message' => 'Tender converted to project successfully.',
            'project' => new ProjectResource($project->load(['client', 'tender'])),
        ], 201);
    }
}