<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PettyCashTopup extends Model
{
    protected $fillable = ['petty_cash_fund_id', 'amount', 'topup_date', 'remarks', 'added_by'];
    protected function casts(): array { return ['amount' => 'decimal:2', 'topup_date' => 'date']; }

    public function fund(): BelongsTo { return $this->belongsTo(PettyCashFund::class, 'petty_cash_fund_id'); }
}