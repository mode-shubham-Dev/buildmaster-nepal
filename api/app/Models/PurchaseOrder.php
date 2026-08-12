<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class PurchaseOrder extends Model
{
    use LogsActivity;

    protected $fillable = [
        'po_number',
        'supplier_id',
        'warehouse_id',
        'project_id',
        'status',
        'subtotal',
        'vat_percentage',
        'vat_amount',
        'total',
        'order_date',
        'expected_delivery',
        'notes',
        'created_by',
        'approved_by',
        'approved_at',
        'received_at',
    ];

    protected function casts(): array
    {
        return [
            'subtotal'          => 'decimal:2',
            'vat_percentage'    => 'decimal:2',
            'vat_amount'        => 'decimal:2',
            'total'             => 'decimal:2',
            'order_date'        => 'date',
            'expected_delivery' => 'date',
            'approved_at'       => 'datetime',
            'received_at'       => 'datetime',
        ];
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['po_number', 'status', 'total'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}