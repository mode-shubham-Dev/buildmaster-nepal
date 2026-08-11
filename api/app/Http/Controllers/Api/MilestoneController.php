<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Milestone\StoreMilestoneRequest;
use App\Http\Requests\Milestone\UpdateMilestoneRequest;
use App\Models\Milestone;
use App\Models\Project;
use App\Services\FileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MilestoneController extends Controller
{
    public function __construct(
        protected FileService $fileService
    ) {}

    /**
     * GET /projects/{project}/milestones — list with their images.
     */
    public function index(Project $project): JsonResponse
    {
        $milestones = $project->milestones()->with('attachments')->get();

        return response()->json(['milestones' => $milestones]);
    }

    /**
     * POST /projects/{project}/milestones
     */
    public function store(StoreMilestoneRequest $request, Project $project): JsonResponse
    {
        $milestone = $project->milestones()->create($request->validated());

        return response()->json([
            'message'   => 'Milestone created successfully.',
            'milestone' => $milestone->load('attachments'),
        ], 201);
    }

    /**
     * PUT /milestones/{milestone}
     */
    public function update(UpdateMilestoneRequest $request, Milestone $milestone): JsonResponse
    {
        $milestone->update($request->validated());

        return response()->json([
            'message'   => 'Milestone updated successfully.',
            'milestone' => $milestone->load('attachments'),
        ]);
    }

    /**
     * DELETE /milestones/{milestone}
     */
    public function destroy(Milestone $milestone): JsonResponse
    {
        $milestone->delete();

        return response()->json(['message' => 'Milestone deleted successfully.']);
    }

    /**
     * POST /milestones/{milestone}/images — upload a progress photo.
     * This is where the reusable FileService gets used.
     */
    public function uploadImage(Request $request, Milestone $milestone): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'], // 5MB
        ]);

        $attachment = $this->fileService->attach($milestone, $request->file('image'), 'images');

        return response()->json([
            'message'    => 'Image uploaded successfully.',
            'attachment' => $attachment,
        ], 201);
    }

    /**
     * DELETE /attachments/{attachment} — remove a file (any collection).
     */
    public function deleteImage(\App\Models\Attachment $attachment): JsonResponse
    {
        $attachment->delete();   // model's deleting hook removes the physical file too

        return response()->json(['message' => 'Image removed successfully.']);
    }
}