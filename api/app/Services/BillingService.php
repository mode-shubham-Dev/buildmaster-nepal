<?php

namespace App\Services;

use App\Models\BoqItem;
use App\Models\Project;
use App\Models\RaBill;
use App\Models\RaBillLine;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BillingService
{
    /**
     * The next sequential RA bill number for a project.
     */
    public function nextBillNo(Project $project): int
    {
        return (int) RaBill::where('project_id', $project->id)->max('bill_no') + 1;
    }

    /**
     * How much of a BOQ item has ALREADY been billed across prior bills.
     * Derived: the highest cumulative_qty recorded for that item in this
     * project's existing bills (cumulative is monotonic, so max = latest).
     * Excludes a given bill (when editing a draft).
     */
    public function previouslyBilled(int $projectId, int $boqItemId, ?int $excludeBillId = null): float
    {
        return (float) (RaBillLine::query()
            ->where('boq_item_id', $boqItemId)
            ->whereHas('raBill', function ($q) use ($projectId, $excludeBillId) {
                $q->where('project_id', $projectId);
                if ($excludeBillId) {
                    $q->where('id', '!=', $excludeBillId);
                }
            })
            ->max('cumulative_qty') ?? 0);
    }

    /**
     * Create a draft RA bill with lines. Each line's this_bill_qty and amount
     * are DERIVED and computed here — the client sends only cumulative_qty per item.
     */
    public function createBill(Project $project, array $data): RaBill
    {
        return DB::transaction(function () use ($project, $data) {
            $bill = RaBill::create([
                'project_id'           => $project->id,
                'bill_no'              => $this->nextBillNo($project),
                'bill_date'            => $data['bill_date'],
                'retention_percentage' => $data['retention_percentage'] ?? 5,
                'vat_percentage'       => $data['vat_percentage'] ?? 13,
                'advance_recovery'     => $data['advance_recovery'] ?? 0,
                'status'               => 'draft',
                'created_by'           => $data['user_id'],
                'remarks'              => $data['remarks'] ?? null,
            ]);

            foreach ($data['lines'] as $lineInput) {
                $this->buildLine($bill, $lineInput);
            }

            $this->recalculate($bill);

            return $bill;
        });
    }

    /**
     * Build one bill line. Validates against BOQ + prior billing.
     */
    protected function buildLine(RaBill $bill, array $input): RaBillLine
    {
        /** @var BoqItem $boqItem */
        $boqItem = BoqItem::where('project_id', $bill->project_id)
            ->findOrFail($input['boq_item_id']);

        $cumulative = round((float) $input['cumulative_qty'], 3);

        // GUARD 1: cumulative can't exceed the BOQ total quantity (no over-billing the item).
        if ($cumulative > (float) $boqItem->quantity) {
            throw ValidationException::withMessages([
                'lines' => "Cumulative quantity for \"{$boqItem->description}\" ({$cumulative}) exceeds the BOQ quantity ({$boqItem->quantity}).",
            ]);
        }

        // Previously billed (derived from prior bills).
        $previous = $this->previouslyBilled($bill->project_id, $boqItem->id, $bill->id);

        // GUARD 2: cumulative can't go backwards below what's already billed.
        if ($cumulative < $previous) {
            throw ValidationException::withMessages([
                'lines' => "Cumulative quantity for \"{$boqItem->description}\" ({$cumulative}) is less than already-billed ({$previous}).",
            ]);
        }

        $thisBillQty = round($cumulative - $previous, 3);
        $amount      = round($thisBillQty * (float) $boqItem->rate, 2);

        return $bill->lines()->create([
            'boq_item_id'    => $boqItem->id,
            'cumulative_qty' => $cumulative,
            'previous_qty'   => $previous,
            'this_bill_qty'  => $thisBillQty,
            'rate'           => $boqItem->rate,
            'amount'         => $amount,
        ]);
    }

    /**
     * Recompute the bill's money from its lines. Backend is source of truth.
     * gross → retention → vat → advance → net.
     */
    public function recalculate(RaBill $bill): void
    {
        $bill->load('lines');

        $gross = round($bill->lines->sum(fn ($l) => (float) $l->amount), 2);

        $retention = round($gross * ((float) $bill->retention_percentage / 100), 2);

        // VAT applies to the gross (Nepal practice: VAT on work value).
        $vat = round($gross * ((float) $bill->vat_percentage / 100), 2);

        $advance = (float) $bill->advance_recovery;

        // Net = gross + VAT − retention − advance recovery.
        $net = round($gross + $vat - $retention - $advance, 2);

        $bill->update([
            'gross_amount'     => $gross,
            'retention_amount' => $retention,
            'vat_amount'       => $vat,
            'net_payable'      => $net,
        ]);
    }

    /**
     * Guarded status transitions. approved/paid are locking states.
     */
    public function transition(RaBill $bill, string $to, int $userId): void
    {
        $allowed = [
            'draft'     => ['submitted'],
            'submitted' => ['approved', 'draft'],   // can send back to draft
            'approved'  => ['paid'],
            'paid'      => [],
        ];

        if (! in_array($to, $allowed[$bill->status] ?? [], true)) {
            throw ValidationException::withMessages([
                'status' => "Cannot move bill from '{$bill->status}' to '{$to}'.",
            ]);
        }

        $bill->status = $to;
        if ($to === 'approved') {
            $bill->approved_by = $userId;
            $bill->approved_at = now();
        }
        $bill->save();
    }
}