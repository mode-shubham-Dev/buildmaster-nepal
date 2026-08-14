<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkPackage extends Model
{
    protected $fillable = [
        'subcontractor_id', 'project_id', 'title', 'scope',
        'contract_amount', 'start_date', 'end_date',
        'progress_percentage', 'status',
    ];

    protected function casts(): array
    {
        return [
            'contract_amount'     => 'decimal:2',
            'start_date'          => 'date',
            'end_date'            => 'date',
            'progress_percentage' => 'integer',
        ];
    }

    protected $appends = ['total_paid', 'balance'];

    public function subcontractor(): BelongsTo
    {
        return $this->belongsTo(Subcontractor::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(SubcontractorPayment::class);
    }

    /**
     * DERIVED: total paid so far = sum of payments.
     */
    public function getTotalPaidAttribute(): float
    {
        // use loaded payments if available, else query
        $sum = $this->relationLoaded('payments')
            ? $this->payments->sum('amount')
            : $this->payments()->sum('amount');

        return (float) $sum;
    }

    /**
     * DERIVED: balance owed = contract amount − total paid.
     */
    public function getBalanceAttribute(): float
    {
        return round((float) $this->contract_amount - $this->total_paid, 2);
    }
}