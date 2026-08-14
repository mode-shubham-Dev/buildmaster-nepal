<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Equipment extends Model
{
    use LogsActivity;

    protected $table = 'equipment';   // explicit — Laravel would guess 'equipments'

    protected $fillable = [
        'code', 'name', 'category', 'ownership', 'purchase_cost', 'rental_rate',
        'purchase_date', 'status', 'project_id', 'notes', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'purchase_cost' => 'decimal:2',
            'rental_rate'   => 'decimal:2',
            'purchase_date' => 'date',
            'is_active'     => 'boolean',
        ];
    }

    protected $appends = ['total_maintenance_cost'];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function maintenanceLogs(): HasMany
    {
        return $this->hasMany(EquipmentMaintenance::class)->latest('service_date');
    }

    /**
     * DERIVED: total maintenance cost = sum of all service costs.
     */
    public function getTotalMaintenanceCostAttribute(): float
    {
        $sum = $this->relationLoaded('maintenanceLogs')
            ? $this->maintenanceLogs->sum('cost')
            : $this->maintenanceLogs()->sum('cost');

        return (float) $sum;
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'code', 'status', 'project_id'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}