<?php

namespace App\Models\Concerns;

use App\Models\Attachment;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasAttachments
{
    /**
     * All files attached to this model.
     */
    public function attachments(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }

    /**
     * Files in a specific collection (e.g. only "images").
     */
    public function attachmentsIn(string $collection): MorphMany
    {
        return $this->attachments()->where('collection', $collection);
    }
}