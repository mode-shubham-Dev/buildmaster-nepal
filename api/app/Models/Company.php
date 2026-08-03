<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Company extends Model
{
    use LogsActivity;

    protected $fillable = [
        'name',
        'legal_name',
        'registration_no',
        'pan_vat_no',
        'email',
        'phone',
        'website',
        'address',
        'logo_path',
    ];

    public function branches(): HasMany
    {
        return $this->hasMany(Branch::class);
    }

    public function officeLocations(): HasMany
    {
        return $this->hasMany(OfficeLocation::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'legal_name', 'pan_vat_no', 'email', 'phone'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}