<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleMaintenance extends Model
{
    // ⚠️ Set this to match the ACTUAL table name from your migration.
    // If TablePlus shows 'vehicle_maintenances', use that instead.
    protected $table = 'vehicle_maintenances';

    protected $fillable = [
        'vehicle_id', 'service_date', 'type', 'description',
        'cost', 'next_service_date', 'logged_by',
    ];

    protected function casts(): array
    {
        return [
            'service_date'      => 'date',
            'next_service_date' => 'date',
            'cost'              => 'decimal:2',
        ];
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }
}