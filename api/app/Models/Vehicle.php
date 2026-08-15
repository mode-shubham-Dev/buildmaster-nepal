<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Vehicle extends Model
{
    use LogsActivity;

    protected $fillable = [
        'registration_no', 'make', 'model', 'type', 'ownership',
        'purchase_cost', 'rental_rate', 'status', 'project_id', 'notes', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'purchase_cost' => 'decimal:2',
            'rental_rate'   => 'decimal:2',
            'is_active'     => 'boolean',
        ];
    }

    protected $appends = ['total_fuel_cost', 'total_maintenance_cost'];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function fuelLogs(): HasMany
    {
        return $this->hasMany(VehicleFuelLog::class)->latest('fuel_date');
    }

    public function maintenanceLogs(): HasMany
    {
        return $this->hasMany(VehicleMaintenance::class)->latest('service_date');
    }

    /** DERIVED: total fuel cost = sum of fuel logs. */
    public function getTotalFuelCostAttribute(): float
    {
        $sum = $this->relationLoaded('fuelLogs')
            ? $this->fuelLogs->sum('cost')
            : $this->fuelLogs()->sum('cost');
        return (float) $sum;
    }

    /** DERIVED: total maintenance cost = sum of maintenance logs. */
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
            ->logOnly(['registration_no', 'status', 'project_id'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}