<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubcontractorPayment extends Model
{
    protected $fillable = [
        'work_package_id', 'amount', 'payment_date',
        'method', 'reference', 'remarks', 'paid_by',
    ];

    protected function casts(): array
    {
        return [
            'amount'       => 'decimal:2',
            'payment_date' => 'date',
        ];
    }

    public function workPackage(): BelongsTo
    {
        return $this->belongsTo(WorkPackage::class);
    }

    public function payer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paid_by');
    }
}