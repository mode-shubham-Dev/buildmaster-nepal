"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/permission-guard";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  Warehouse as WarehouseIcon,
  ArrowLeft,
  Plus,
  X,
  Trash2,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
  Boxes,
  ClipboardList,
  Building2,
} from "lucide-react";
import {
  fetchWarehouses,
  createWarehouse,
  deleteWarehouse,
  fetchStockLevels,
  fetchStockMovements,
  recordMovement,
  type Warehouse,
  type WarehousePayload,
  type MovementPayload,
} from "@/lib/warehouse-api";
import { fetchMaterials } from "@/lib/materials-api";

type View = "levels" | "warehouses" | "ledger";

const REASON_LABELS: Record<string, string> = {
  purchase: "Purchase",
  issue_to_project: "Issue to Project",
  return: "Return",
  adjustment: "Adjustment",
  transfer: "Transfer",
};

function num(v: string | number | null): string {
  if (v === null) return "—";
  return Number(v).toLocaleString();
}

function WarehouseContent() {
  const { can } = useAuth();
  const canManage = can("materials.manage");
  const [view, setView] = useState<View>("levels");
  const [showWarehouse, setShowWarehouse] = useState(false);
  const [showMovement, setShowMovement] = useState(false);

  const { data: warehouses } = useQuery({ queryKey: ["warehouses"], queryFn: () => fetchWarehouses() });

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-[#1a1d23]">
                <WarehouseIcon className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="text-base font-semibold tracking-tight text-[#1a1d23]">
                  Warehouse &amp; Stock
                </h1>
                <p className="text-xs text-slate-500">Inventory tracked as a movement ledger</p>
              </div>
            </div>
          </div>

          {canManage && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowWarehouse(true)}
                className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Plus className="h-4 w-4" />
                Warehouse
              </button>
              <button
                onClick={() => setShowMovement(true)}
                className="flex items-center gap-2 rounded-md bg-amber-500 px-3.5 py-2 text-sm font-semibold text-[#1a1d23] shadow-sm transition hover:bg-amber-400"
              >
                <Plus className="h-4 w-4" />
                Record Movement
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* view tabs */}
        <div className="mb-6 flex gap-1 border-b border-slate-200">
          {[
            { id: "levels" as View, label: "Stock Levels", icon: <Boxes className="h-4 w-4" /> },
            { id: "warehouses" as View, label: "Warehouses", icon: <Building2 className="h-4 w-4" /> },
            { id: "ledger" as View, label: "Movement Ledger", icon: <ClipboardList className="h-4 w-4" /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                view === t.id
                  ? "border-amber-500 text-[#1a1d23]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {view === "levels" && <StockLevelsView warehouses={warehouses ?? []} />}
        {view === "warehouses" && <WarehousesView warehouses={warehouses ?? []} canManage={canManage} />}
        {view === "ledger" && <LedgerView warehouses={warehouses ?? []} />}
      </main>

      {showWarehouse && (
        <WarehouseModal onClose={() => setShowWarehouse(false)} />
      )}
      {showMovement && (
        <MovementModal warehouses={warehouses ?? []} onClose={() => setShowMovement(false)} />
      )}
    </div>
  );
}

/* ---------- STOCK LEVELS (derived balances) ---------- */
function StockLevelsView({ warehouses }: { warehouses: Warehouse[] }) {
  const [warehouseId, setWarehouseId] = useState<string>("");

  const { data: levels, isLoading, isError: levelsError } = useQuery({
    queryKey: ["stock-levels", warehouseId],
    queryFn: () => fetchStockLevels(warehouseId ? Number(warehouseId) : undefined),
  });

  const warehouseName = (id: number) => warehouses.find((w) => w.id === id)?.name ?? `WH-${id}`;

  return (
    <div className="space-y-4">
      <select
        value={warehouseId}
        onChange={(e) => setWarehouseId(e.target.value)}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
      >
        <option value="">All warehouses</option>
        {warehouses.map((w) => (
          <option key={w.id} value={w.id}>{w.name}</option>
        ))}
      </select>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
        </div>
      ) : levelsError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-10 text-center text-sm text-red-600">
          Failed to load stock levels. Please refresh and try again.
        </div>
      ) : (levels?.length ?? 0) === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
          No stock recorded yet. Record a movement to build stock.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Material</th>
                <th className="px-5 py-3">Warehouse</th>
                <th className="px-5 py-3 text-right">Balance</th>
                <th className="px-5 py-3 text-right">Reorder Level</th>
                <th className="px-5 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {levels?.map((l, idx) => (
                <tr key={idx} className={`transition hover:bg-slate-50/60 ${l.low_stock ? "bg-red-50/40" : ""}`}>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-900">{l.material_name}</p>
                    <p className="font-mono text-xs text-slate-400">{l.material_code}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{warehouseName(l.warehouse_id)}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-900">
                    {num(l.balance)} <span className="text-xs font-normal text-slate-400">{l.unit}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-slate-500">
                    {num(l.reorder_level)}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {l.low_stock ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                        <AlertTriangle className="h-3 w-3" />
                        Low Stock
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                        In Stock
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- WAREHOUSES ---------- */
function WarehousesView({ warehouses, canManage }: { warehouses: Warehouse[]; canManage: boolean }) {
  const queryClient = useQueryClient();
  const delMut = useMutation({
    mutationFn: deleteWarehouse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["warehouses"] }),
  });

  if (warehouses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
        No warehouses yet. Add one to start tracking stock.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {warehouses.map((w) => (
        <div key={w.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <WarehouseIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{w.name}</p>
                <p className="font-mono text-xs text-slate-400">{w.code}</p>
              </div>
            </div>
            {canManage && (
              <button
                onClick={() => confirm(`Delete ${w.name}?`) && delMut.mutate(w.id)}
                className="text-slate-400 transition hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          {w.location && <p className="mt-3 text-xs text-slate-500">{w.location}</p>}
          <span
            className={`mt-3 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
              w.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
            }`}
          >
            {w.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------- LEDGER ---------- */
function LedgerView({ warehouses }: { warehouses: Warehouse[] }) {
  const [warehouseId, setWarehouseId] = useState<string>("");

  const { data: movements, isLoading, isError: movementsError } = useQuery({
    queryKey: ["stock-movements", warehouseId],
    queryFn: () => fetchStockMovements(warehouseId ? { warehouse_id: Number(warehouseId) } : {}),
  });

  return (
    <div className="space-y-4">
      <select
        value={warehouseId}
        onChange={(e) => setWarehouseId(e.target.value)}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
      >
        <option value="">All warehouses</option>
        {warehouses.map((w) => (
          <option key={w.id} value={w.id}>{w.name}</option>
        ))}
      </select>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
        </div>
      ) : movementsError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-10 text-center text-sm text-red-600">
          Failed to load stock movements. Please refresh and try again.
        </div>
      ) : (movements?.length ?? 0) === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
          No movements recorded yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Material</th>
                <th className="px-5 py-3">Warehouse</th>
                <th className="px-5 py-3 text-center">Type</th>
                <th className="px-5 py-3 text-right">Qty</th>
                <th className="px-5 py-3">Reason</th>
                <th className="px-5 py-3">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements?.map((m) => (
                <tr key={m.id} className="transition hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 text-xs text-slate-500">{m.moved_at.split("T")[0]}</td>
                  <td className="px-5 py-3.5 text-slate-900">{m.material?.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">{m.warehouse?.name}</td>
                  <td className="px-5 py-3.5 text-center">
                    {m.type === "in" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        <ArrowDownToLine className="h-3 w-3" />
                        In
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                        <ArrowUpFromLine className="h-3 w-3" />
                        Out
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium text-slate-900">
                    {num(m.quantity)} <span className="text-xs font-normal text-slate-400">{m.material?.unit}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">{REASON_LABELS[m.reason]}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">{m.mover?.name ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- WAREHOUSE MODAL ---------- */
function WarehouseModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<WarehousePayload>({ name: "", code: "", is_active: true });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () => createWarehouse(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      onClose();
    },
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message ?? "Failed to create warehouse.");
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-[#1a1d23]">Add Warehouse</h2>
          <button onClick={onClose} className="text-slate-400 transition hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Main Store"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Code *</label>
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="WH-001"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Location</label>
            <input
              value={form.location ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={() => form.name && form.code && mutation.mutate()}
            disabled={mutation.isPending}
            className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-[#1a1d23] transition hover:bg-amber-400 disabled:opacity-60"
          >
            {mutation.isPending ? "Saving..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- MOVEMENT MODAL ---------- */
function MovementModal({ warehouses, onClose }: { warehouses: Warehouse[]; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<MovementPayload>({
    warehouse_id: 0,
    material_id: 0,
    type: "in",
    quantity: 0,
    reason: "purchase",
  });
  const [error, setError] = useState("");

  const { data: materials } = useQuery({ queryKey: ["materials"], queryFn: () => fetchMaterials() });

  const mutation = useMutation({
    mutationFn: () => recordMovement(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-levels"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      onClose();
    },
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message ?? "Failed to record movement.");
    },
  });

  const set = <K extends keyof MovementPayload>(key: K, v: MovementPayload[K]) =>
    setForm((f) => ({ ...f, [key]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-[#1a1d23]">Record Stock Movement</h2>
          <button onClick={onClose} className="text-slate-400 transition hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* in/out toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => set("type", "in")}
              className={`flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition ${
                form.type === "in"
                  ? "border-green-300 bg-green-50 text-green-700"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <ArrowDownToLine className="h-4 w-4" />
              Stock In
            </button>
            <button
              onClick={() => set("type", "out")}
              className={`flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition ${
                form.type === "out"
                  ? "border-orange-300 bg-orange-50 text-orange-700"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <ArrowUpFromLine className="h-4 w-4" />
              Stock Out
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Warehouse *</label>
              <select
                value={form.warehouse_id || ""}
                onChange={(e) => set("warehouse_id", Number(e.target.value))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="">Select</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Material *</label>
              <select
                value={form.material_id || ""}
                onChange={(e) => set("material_id", Number(e.target.value))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="">Select</option>
                {materials?.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Quantity *</label>
              <input
                type="number"
                value={form.quantity || ""}
                onChange={(e) => set("quantity", Number(e.target.value))}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Reason *</label>
              <select
                value={form.reason}
                onChange={(e) => set("reason", e.target.value as MovementPayload["reason"])}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                {form.type === "in" ? (
                  <>
                    <option value="purchase">Purchase</option>
                    <option value="return">Return</option>
                    <option value="adjustment">Adjustment</option>
                    <option value="transfer">Transfer</option>
                  </>
                ) : (
                  <>
                    <option value="issue_to_project">Issue to Project</option>
                    <option value="adjustment">Adjustment</option>
                    <option value="transfer">Transfer</option>
                  </>
                )}
              </select>
            </div>
            {form.type === "in" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Unit Cost</label>
                <input
                  type="number"
                  value={form.unit_cost ?? ""}
                  onChange={(e) => set("unit_cost", e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            )}
            <div className={form.type === "in" ? "" : "col-span-2"}>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Reference</label>
              <input
                value={form.reference ?? ""}
                onChange={(e) => set("reference", e.target.value)}
                placeholder="PO no, note..."
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={() => form.warehouse_id && form.material_id && form.quantity && mutation.mutate()}
            disabled={mutation.isPending}
            className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-[#1a1d23] transition hover:bg-amber-400 disabled:opacity-60"
          >
            {mutation.isPending ? "Recording..." : "Record Movement"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WarehousePage() {
  return (
    <PermissionGuard permission="materials.view">
      <WarehouseContent />
    </PermissionGuard>
  );
}