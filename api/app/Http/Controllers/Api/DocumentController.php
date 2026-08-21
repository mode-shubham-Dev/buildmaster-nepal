<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\DocumentCategory;
use App\Services\FileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    public function __construct(protected FileService $fileService) {}

    public function categories(): JsonResponse
    {
        return response()->json(['categories' => DocumentCategory::where('is_active', true)->get()]);
    }

    public function index(Request $request): JsonResponse
    {
        $documents = Document::with(['category:id,name,color', 'project:id,name', 'uploader:id,name', 'attachments'])
            ->when($request->search, fn ($q) => $q->where('title', 'like', "%{$request->search}%")->orWhere('description', 'like', "%{$request->search}%"))
            ->when($request->category_id, fn ($q) => $q->where('document_category_id', $request->category_id))
            ->when($request->project_id, fn ($q) => $q->where('project_id', $request->project_id))
            ->when($request->expiring, fn ($q) => $q->whereNotNull('expiry_date')->whereDate('expiry_date', '<=', now()->addDays(30)))
            ->latest()
            ->get();

        return response()->json(['documents' => $documents]);
    }

    /**
     * Create a document + attach its file in one call (multipart).
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'                => ['required', 'string', 'max:255'],
            'document_category_id' => ['nullable', 'integer', 'exists:document_categories,id'],
            'project_id'           => ['nullable', 'integer', 'exists:projects,id'],
            'description'          => ['nullable', 'string'],
            'document_date'        => ['nullable', 'date'],
            'expiry_date'          => ['nullable', 'date'],
            'file'                 => ['required', 'file', 'max:20480', 'mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png,gif'],
        ]);

        $document = Document::create([
            'title'                => $data['title'],
            'document_category_id' => $data['document_category_id'] ?? null,
            'project_id'           => $data['project_id'] ?? null,
            'description'          => $data['description'] ?? null,
            'document_date'        => $data['document_date'] ?? null,
            'expiry_date'          => $data['expiry_date'] ?? null,
            'uploaded_by'          => $request->user()->id,
        ]);

        $this->fileService->attach($document, $request->file('file'), 'documents');

        return response()->json([
            'message'  => 'Document uploaded.',
            'document' => $document->load(['category:id,name,color', 'project:id,name', 'attachments']),
        ], 201);
    }

    public function update(Request $request, Document $document): JsonResponse
    {
        $data = $request->validate([
            'title'                => ['required', 'string', 'max:255'],
            'document_category_id' => ['nullable', 'integer', 'exists:document_categories,id'],
            'project_id'           => ['nullable', 'integer', 'exists:projects,id'],
            'description'          => ['nullable', 'string'],
            'document_date'        => ['nullable', 'date'],
            'expiry_date'          => ['nullable', 'date'],
        ]);

        $document->update($data);

        return response()->json(['message' => 'Document updated.', 'document' => $document->load(['category:id,name,color', 'project:id,name', 'attachments'])]);
    }

    public function destroy(Document $document): JsonResponse
    {
        $document->delete();   // attachments cascade-delete via the HasAttachments deleting hook
        return response()->json(['message' => 'Document deleted.']);
    }
}