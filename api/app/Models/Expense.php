<?php

namespace App\Models;

use App\Models\Concerns\HasAttachments;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    use HasAttachments;

    protected $fillable = [
        'expense_category_id', 'project_id', 'petty_cash_fund_id',
        'amount', 'expense_date', 'description', 'status',
        'spent_by', 'approved_by', 'actioned_at', 'action_remarks',
    ];

    protected function casts(): array
    {
        return ['amount' => 'decimal:2', 'expense_date' => 'date', 'actioned_at' => 'datetime'];
    }

    public function category(): BelongsTo { return $this->belongsTo(ExpenseCategory::class, 'expense_category_id'); }
    public function project(): BelongsTo { return $this->belongsTo(Project::class); }
    public function fund(): BelongsTo { return $this->belongsTo(PettyCashFund::class, 'petty_cash_fund_id'); }
    public function spender(): BelongsTo { return $this->belongsTo(User::class, 'spent_by'); }
    public function approver(): BelongsTo { return $this->belongsTo(User::class, 'approved_by'); }
}