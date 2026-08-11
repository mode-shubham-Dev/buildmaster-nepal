<?php

namespace App\Services;

use App\Models\Attachment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;

class FileService
{
    /**
     * Store an uploaded file and attach it to any model.
     *
     * @param Model         $model      the thing to attach to (Milestone, SiteReport, etc.)
     * @param UploadedFile  $file       the uploaded file
     * @param string        $collection group name ("images", "documents")
     */
    public function attach(Model $model, UploadedFile $file, string $collection = 'default'): Attachment
    {
        // Store in storage/app/public/{collection}/... with a unique name
        $path = $file->store($collection, 'public');

        return $model->attachments()->create([
            'uploaded_by'   => auth()->id(),
            'collection'    => $collection,
            'original_name' => $file->getClientOriginalName(),
            'path'          => $path,
            'mime_type'     => $file->getMimeType(),
            'size'          => $file->getSize(),
        ]);
    }
}