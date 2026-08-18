<?php

namespace App\Models;

use App\Models\Concerns\HasAttachments;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    use HasAttachments;

    protected $fillable = [
        'document_category_id', 'project_id', 'title', 'description',
        'document_date', 'expiry_date', 'uploaded_by',
    ];

    protected function casts(): array
    {
        return ['document_date' => 'date', 'expiry_date' => 'date'];
    }

    protected $appends = ['is_expiring_soon'];

    public function category(): BelongsTo { return $this->belongsTo(DocumentCategory::class, 'document_category_id'); }
    public function project(): BelongsTo { return $this->belongsTo(Project::class); }
    public function uploader(): BelongsTo { return $this->belongsTo(User::class, 'uploaded_by'); }

    /** DERIVED: flags documents expiring within 30 days (or already expired). */
    public function getIsExpiringSoonAttribute(): bool
    {
        if (! $this->expiry_date) return false;
        return $this->expiry_date->lte(now()->addDays(30));
    }
}