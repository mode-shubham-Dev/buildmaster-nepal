<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Material extends Model
{
    use LogsActivity;

    protected $fillable = [
        'material_category_id',
        'code',
        'name',
        'description',
        'unit',
        'unit_cost',
        'reorder_level',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'unit_cost'     => 'decimal:2',
            'reorder_level' => 'decimal:3',
            'is_active'     => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(MaterialCategory::class, 'material_category_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'code', 'unit_cost', 'is_active'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}