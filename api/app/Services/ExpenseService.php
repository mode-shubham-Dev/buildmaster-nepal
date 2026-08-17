<?php

namespace App\Services;

use App\Models\Expense;
use Illuminate\Validation\ValidationException;

class ExpenseService
{
    /**
     * Approve or reject. On approval from a petty cash fund, guard against
     * overdrawing the fund's DERIVED balance.
     */
    public function action(Expense $expense, string $status, ?string $remarks, int $userId): void
    {
        if ($expense->status !== 'pending') {
            throw ValidationException::withMessages(['status' => 'This expense has already been actioned.']);
        }

        // Overdraw guard — only when approving an expense drawn from a fund.
        if ($status === 'approved' && $expense->petty_cash_fund_id) {
            $fund = $expense->fund;
            if ($expense->amount > $fund->balance) {
                throw ValidationException::withMessages([
                    'amount' => "Approving this would overdraw {$fund->name}. Available: Rs. " . number_format($fund->balance, 2) . ".",
                ]);
            }
        }

        $expense->update([
            'status'         => $status,
            'action_remarks' => $remarks,
            'approved_by'    => $userId,
            'actioned_at'    => now(),
        ]);
    }
}