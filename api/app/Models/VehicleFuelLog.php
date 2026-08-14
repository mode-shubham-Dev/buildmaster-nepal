<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleFuelLog extends Model
{
    protected $fillable = [
        'vehicle_id', 'fuel_date', 'litres', 'cost', 'odometer', 'filled_by', 'logged_by',
    ];

    protected function casts(): array
    {
        return [
            'fuel_date' => 'date',
            'litres'    => 'decimal:2',
            'cost'      => 'decimal:2',
        ];
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }
}