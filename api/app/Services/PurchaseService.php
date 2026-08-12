<?php

namespace App\Services;

use App\Models\PurchaseOrder;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PurchaseService
{
    /**
     * Recompute and store a PO's money from its line items.
     * Backend is the source of truth — never trusts client totals.
     */
    public function recalculate(PurchaseOrder $po): void
    {
        $po->loadMissing('items');

        $subtotal = $po->items->sum(fn ($item) => (float) $item->amount);
        $vatAmount = round($subtotal * ((float) $po->vat_percentage / 100), 2);
        $total = round($subtotal + $vatAmount, 2);

        $po->update([
            'subtotal'   => $subtotal,
            'vat_amount' => $vatAmount,
            'total'      => $total,
        ]);
    }

    /**
     * The STATE MACHINE. Defines which transitions are legal.
     * Attempting an illegal transition throws — you can't skip states.
     */
    protected array $allowed = [
        'draft'     => ['submitted', 'cancelled'],
        'submitted' => ['approved', 'rejected', 'cancelled'],
        'approved'  => ['received', 'cancelled'],
        'received'  => [],   // terminal
        'rejected'  => [],   // terminal
        'cancelled' => [],   // terminal
    ];

    public function transition(PurchaseOrder $po, string $to): void
    {
        $from = $po->status;

        if (! in_array($to, $this->allowed[$from] ?? [], true)) {
            throw ValidationException::withMessages([
                'status' => "Cannot move a purchase order from '{$from}' to '{$to}'.",
            ]);
        }

        $po->status = $to;
        $po->save();
    }

    /**
     * RECEIVE a PO — the key integration.
     * Marks it received AND writes each line item into the stock ledger
     * as a stock-in movement. Wrapped in a transaction so it's all-or-nothing.
     */
    public function receive(PurchaseOrder $po, int $userId): void
    {
        if ($po->status !== 'approved') {
            throw ValidationException::withMessages([
                'status' => 'Only an approved purchase order can be received.',
            ]);
        }

        if (! $po->warehouse_id) {
            throw ValidationException::withMessages([
                'warehouse' => 'Assign a warehouse before receiving this order.',
            ]);
        }

        DB::transaction(function () use ($po, $userId) {
            $po->loadMissing('items');

            // Each line item becomes a stock-in movement in the Module 13 ledger.
            foreach ($po->items as $item) {
                StockMovement::create([
                    'warehouse_id' => $po->warehouse_id,
                    'material_id'  => $item->material_id,
                    'type'         => 'in',
                    'quantity'     => $item->quantity,
                    'unit_cost'    => $item->rate,           // capture cost at receipt
                    'reason'       => 'purchase',
                    'project_id'   => $po->project_id,
                    'reference'    => $po->po_number,        // traceable back to the PO
                    'moved_by'     => $userId,
                    'moved_at'     => now(),
                ]);
            }

            $po->update([
                'status'      => 'received',
                'received_at' => now(),
            ]);
        });
    }
}