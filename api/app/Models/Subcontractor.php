<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Subcontractor extends Model
{
    use LogsActivity;

    protected $fillable = [
        'name', 'specialty', 'contact_person', 'phone', 'email',
        'pan_vat_no', 'address', 'rating', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'rating'    => 'integer',
        ];
    }

    public function workPackages(): HasMany
    {
        return $this->hasMany(WorkPackage::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'specialty', 'rating', 'is_active'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}