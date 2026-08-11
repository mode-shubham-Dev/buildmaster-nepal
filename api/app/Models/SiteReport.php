<?php

namespace App\Models;

use App\Models\Concerns\HasAttachments;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class SiteReport extends Model
{
    use HasAttachments, LogsActivity;

    protected $fillable = [
        'project_id',
        'reported_by',
        'report_date',
        'work_done',
        'workers_present',
        'weather',
        'progress_percentage',
        'materials_used',
        'issues',
    ];

    protected function casts(): array
    {
        return [
            'report_date'         => 'date',
            'workers_present'     => 'integer',
            'progress_percentage' => 'integer',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['report_date', 'workers_present', 'progress_percentage'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}