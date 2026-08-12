<?php

namespace App\Services;

use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;

class StockService
{
    /**
     * Current balance of ONE material in ONE warehouse.
     * Derived: sum of 'in' minus sum of 'out'. Never stored.
     */
    public function balance(int $warehouseId, int $materialId): float
    {
        $in = StockMovement::where('warehouse_id', $warehouseId)
            ->where('material_id', $materialId)
            ->where('type', 'in')
            ->sum('quantity');

        $out = StockMovement::where('warehouse_id', $warehouseId)
            ->where('material_id', $materialId)
            ->where('type', 'out')
            ->sum('quantity');

        return (float) ($in - $out);
    }

    /**
     * All current stock balances, grouped by warehouse + material.
     * One efficient query that sums the whole ledger, rather than
     * looping per material.
     */
    public function balances(?int $warehouseId = null): array
    {
        $rows = StockMovement::query()
            ->select(
                'warehouse_id',
                'material_id',
                DB::raw("SUM(CASE WHEN type = 'in' THEN quantity ELSE 0 END) as total_in"),
                DB::raw("SUM(CASE WHEN type = 'out' THEN quantity ELSE 0 END) as total_out")
            )
            ->when($warehouseId, fn ($q) => $q->where('warehouse_id', $warehouseId))
            ->groupBy('warehouse_id', 'material_id')
            ->get();

        return $rows->map(fn ($r) => [
            'warehouse_id' => $r->warehouse_id,
            'material_id'  => $r->material_id,
            'balance'      => (float) ($r->total_in - $r->total_out),
        ])->toArray();
    }
}