<?php

namespace App\Models;

use App\Models\Concerns\HasAttachments;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Supplier extends Model
{
    use HasAttachments, LogsActivity;

    protected $fillable = [
        'name',
        'category',
        'contact_person',
        'phone',
        'email',
        'pan_vat_no',
        'address',
        'is_active',
        'rating',
        'payment_terms',
        'bank_name',
        'bank_account',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'rating'    => 'integer',
        ];
    }

    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(SupplierContact::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'category', 'rating', 'is_active'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}