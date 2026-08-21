<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Models\SupplierContact;
use App\Services\FileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierContactController extends Controller
{
    public function __construct(protected FileService $fileService) {}

    public function store(Request $request, Supplier $supplier): JsonResponse
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'designation' => ['nullable', 'string', 'max:255'],
            'phone'       => ['nullable', 'string', 'max:50'],
            'email'       => ['nullable', 'email', 'max:255'],
            'is_primary'  => ['boolean'],
        ]);

        $contact = $supplier->contacts()->create($data);

        return response()->json(['message' => 'Contact added.', 'contact' => $contact], 201);
    }

    public function destroy(SupplierContact $supplierContact): JsonResponse
    {
        $supplierContact->delete();
        return response()->json(['message' => 'Contact removed.']);
    }

    /**
     * Upload a supplier document (agreement, PAN cert) via the file service.
     */
    public function uploadDocument(Request $request, Supplier $supplier): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:10240', 'mimes:pdf,doc,docx,jpg,jpeg,png'],
        ]);

        $attachment = $this->fileService->attach($supplier, $request->file('file'), 'documents');

        return response()->json(['message' => 'Document uploaded.', 'attachment' => $attachment], 201);
    }
}