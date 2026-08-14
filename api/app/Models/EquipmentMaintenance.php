<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EquipmentMaintenance extends Model
{
    protected $table = 'equipment_maintenances';   // explicit

    protected $fillable = [
        'equipment_id', 'service_date', 'type', 'description',
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

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }
}