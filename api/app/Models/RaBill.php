<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RaBill extends Model
{
    protected $fillable = [
        'project_id', 'bill_no', 'bill_date',
        'gross_amount', 'retention_percentage', 'retention_amount',
        'vat_percentage', 'vat_amount', 'advance_recovery', 'net_payable',
        'status', 'created_by', 'approved_by', 'approved_at', 'remarks',
    ];

    protected function casts(): array
    {
        return [
            'bill_date'            => 'date',
            'gross_amount'         => 'decimal:2',
            'retention_percentage' => 'decimal:2',
            'retention_amount'     => 'decimal:2',
            'vat_percentage'       => 'decimal:2',
            'vat_amount'           => 'decimal:2',
            'advance_recovery'     => 'decimal:2',
            'net_payable'          => 'decimal:2',
            'approved_at'          => 'datetime',
        ];
    }

    protected $appends = ['total_paid', 'balance_due'];

    public function project(): BelongsTo { return $this->belongsTo(Project::class); }
    public function lines(): HasMany { return $this->hasMany(RaBillLine::class); }
    public function payments(): HasMany { return $this->hasMany(RaBillPayment::class); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
    public function approver(): BelongsTo { return $this->belongsTo(User::class, 'approved_by'); }

    /** DERIVED: total received against this bill. */
    public function getTotalPaidAttribute(): float
    {
        return (float) ($this->relationLoaded('payments') ? $this->payments->sum('amount') : $this->payments()->sum('amount'));
    }

    /** DERIVED: outstanding on this bill. */
    public function getBalanceDueAttribute(): float
    {
        return round((float) $this->net_payable - $this->total_paid, 2);
    }

    public function isLocked(): bool
    {
        return in_array($this->status, ['approved', 'paid'], true);
    }
}