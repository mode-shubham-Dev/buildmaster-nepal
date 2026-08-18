<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RaBillPayment extends Model
{
    protected $fillable = ['ra_bill_id', 'amount', 'payment_date', 'reference', 'remarks', 'recorded_by'];

    protected function casts(): array
    {
        return ['amount' => 'decimal:2', 'payment_date' => 'date'];
    }

    public function raBill(): BelongsTo { return $this->belongsTo(RaBill::class); }
}