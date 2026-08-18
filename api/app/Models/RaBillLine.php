<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RaBillLine extends Model
{
    protected $fillable = [
        'ra_bill_id', 'boq_item_id',
        'cumulative_qty', 'previous_qty', 'this_bill_qty', 'rate', 'amount',
    ];

    protected function casts(): array
    {
        return [
            'cumulative_qty' => 'decimal:3',
            'previous_qty'   => 'decimal:3',
            'this_bill_qty'  => 'decimal:3',
            'rate'           => 'decimal:2',
            'amount'         => 'decimal:2',
        ];
    }

    public function raBill(): BelongsTo { return $this->belongsTo(RaBill::class); }
    public function boqItem(): BelongsTo { return $this->belongsTo(BoqItem::class); }
}