<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class OfficeLocation extends Model
{
    use LogsActivity;

    protected $fillable = [
        'company_id',
        'name',
        'address',
        'latitude',
        'longitude',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'address'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}