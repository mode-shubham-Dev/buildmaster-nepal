<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use App\Models\Tender;

class Project extends Model
{
    use LogsActivity;

    protected $fillable = [
        'client_id',
        'tender_id',
        'project_manager_id',
        'project_code',
        'name',
        'description',
        'budget',
        'contract_value',
        'start_date',
        'end_date',
        'site_location',
        'latitude',
        'longitude',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'budget'         => 'decimal:2',
            'contract_value' => 'decimal:2',
            'start_date'     => 'date',
            'end_date'       => 'date',
        ];
    }

    // ----- BelongsTo (this project points at one of each) -----

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function tender(): BelongsTo
    {
        return $this->belongsTo(Tender::class);
    }

    public function projectManager(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'project_manager_id');
    }

    // ----- BelongsToMany (the team — many employees, via the pivot) -----

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Employee::class, 'project_members')
            ->withPivot('role_on_project')   // include the pivot's extra column
            ->withTimestamps();               // pivot has created_at/updated_at
    }

    public function boqItems(): HasMany
    {
        return $this->hasMany(BoqItem::class)->orderBy('sort_order');
    }

    public function milestones(): HasMany
    {
        return $this->hasMany(Milestone::class)->orderBy('sort_order');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'status', 'budget', 'contract_value', 'project_code'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}