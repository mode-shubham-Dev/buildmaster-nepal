<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SiteReport\StoreSiteReportRequest;
use App\Http\Requests\SiteReport\UpdateSiteReportRequest;
use App\Models\Project;
use App\Models\SiteReport;
use App\Services\FileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SiteReportController extends Controller
{
    public function __construct(
        protected FileService $fileService
    ) {}

    /**
     * GET /projects/{project}/site-reports — the report feed.
     */
    public function index(Project $project): JsonResponse
    {
        $reports = $project->siteReports()
            ->with(['reporter:id,name', 'attachments'])
            ->get();

        return response()->json(['reports' => $reports]);
    }

    /**
     * POST /projects/{project}/site-reports
     */
    public function store(StoreSiteReportRequest $request, Project $project): JsonResponse
    {
        $data = $request->validated();
        $data['reported_by'] = $request->user()->id;   // auto-capture the reporter

        $report = $project->siteReports()->create($data);

        return response()->json([
            'message' => 'Site report submitted successfully.',
            'report'  => $report->load(['reporter:id,name', 'attachments']),
        ], 201);
    }

    /**
     * PUT /site-reports/{siteReport}
     */
    public function update(UpdateSiteReportRequest $request, SiteReport $siteReport): JsonResponse
    {
        $siteReport->update($request->validated());

        return response()->json([
            'message' => 'Site report updated successfully.',
            'report'  => $siteReport->load(['reporter:id,name', 'attachments']),
        ]);
    }

    /**
     * DELETE /site-reports/{siteReport}
     */
    public function destroy(SiteReport $siteReport): JsonResponse
    {
        $siteReport->delete();

        return response()->json(['message' => 'Site report deleted successfully.']);
    }

    /**
     * POST /site-reports/{siteReport}/photos — attach a site photo.
     * One line via the reusable FileService.
     */
    public function uploadPhoto(Request $request, SiteReport $siteReport): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $attachment = $this->fileService->attach($siteReport, $request->file('image'), 'photos');

        return response()->json([
            'message'    => 'Photo uploaded successfully.',
            'attachment' => $attachment,
        ], 201);
    }
}