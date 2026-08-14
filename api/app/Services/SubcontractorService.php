<?php

namespace App\Services;

use App\Models\SubcontractorPayment;
use App\Models\WorkPackage;
use Illuminate\Validation\ValidationException;

class SubcontractorService
{
    /**
     * Record a payment against a work package.
     * GUARD: cannot pay more than the remaining balance.
     */
    public function pay(WorkPackage $workPackage, array $data, int $userId): SubcontractorPayment
    {
        $balance = $workPackage->balance;   // derived: contract − paid so far

        if ($data['amount'] > $balance) {
            throw ValidationException::withMessages([
                'amount' => "Payment exceeds the remaining balance of Rs. " . number_format($balance, 2) . ".",
            ]);
        }

        return $workPackage->payments()->create([
            'amount'       => $data['amount'],
            'payment_date' => $data['payment_date'],
            'method'       => $data['method'] ?? 'bank_transfer',
            'reference'    => $data['reference'] ?? null,
            'remarks'      => $data['remarks'] ?? null,
            'paid_by'      => $userId,
        ]);
    }
}