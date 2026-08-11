<?php

namespace App\Models;

use App\Models\Concerns\HasAttachments;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Milestone extends Model
{
    use HasAttachments, LogsActivity;

    protected $fillable = [
        'project_id',
        'title',
        'description',
        'budget',
        'deadline',
        'completion_percentage',
        'status',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'budget'                => 'decimal:2',
            'deadline'              => 'date',
            'completion_percentage' => 'integer',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title', 'status', 'completion_percentage', 'budget'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}