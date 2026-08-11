<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Storage;

class Attachment extends Model
{
    protected $fillable = [
        'attachable_type',
        'attachable_id',
        'uploaded_by',
        'collection',
        'original_name',
        'path',
        'mime_type',
        'size',
    ];

    protected $appends = ['url'];   // include a computed 'url' in JSON output

    /**
     * The parent model this file is attached to (polymorphic).
     */
    public function attachable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Public URL to the file — computed from the stored path.
     */
    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->path);
    }

    /**
     * When an attachment is deleted, remove the physical file too.
     */
    protected static function booted(): void
    {
        static::deleting(function (Attachment $attachment) {
            Storage::disk('public')->delete($attachment->path);
        });
    }
}