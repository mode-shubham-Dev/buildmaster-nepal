"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/permission-guard";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  ShoppingCart,
  ArrowLeft,
  Plus,
  Search,
  X,
  Trash2,
  Building,
  Users2,
} from "lucide-react";
import {
  fetchPurchaseOrders,
  createPurchaseOrder,
  deletePurchaseOrder,
  fetchSuppliers,
  createSupplier,
  deleteSupplier,
  type PurchaseOrder,
  type POStatus,
  type POItemInput,
  type POPayload,
} from "@/lib/purchase-api";
import { fetchMaterials } from "@/lib/materials-api";
import { fetchWarehouses } from "@/lib/warehouse-api";
import { PODetail } from "@/components/purchase/po-details";

const STATUS_META: Record<POStatus, { label: string; color: string; dot: string }> = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  approved: { label: "Approved", color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  received: { label: "Received", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
  cancelled: { label: "Cancelled", color: "bg-slate-100 text-slate-500", dot: "bg-slate-300" },
};

const STATUS_ORDER: POStatus[] = ["draft", "submitted", "approved", "received", "rejected", "cancelled"];

function money(v: string | null): string {
  if (!v) return "Rs. 0";
  return `Rs. ${Number(v).toLocaleString()}`;
}

function PurchasesContent() {
  const queryClient = useQueryClient();
  const { can } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showSuppliers, setShowSuppliers] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["purchase-orders", search, status],
    queryFn: () => fetchPurchaseOrders({ search: search || undefined, status: status || undefined }),
  });

  const deleteMut = useMutation({
    mutationFn: deletePurchaseOrder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["purchase-orders"] }),
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { message?: string } } };
      alert(apiError.response?.data?.message ?? "Failed to delete.");
    },
  });

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
                <ShoppingCart className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="text-base font-semibold tracking-tight text-[#1a1d23]">
                  Purchase Orders
                </h1>
                <p className="text-xs text-slate-500">Order → approve → receive → stock</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {can("purchases.create") && (
              <button
                onClick={() => setShowSuppliers(true)}
                className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Users2 className="h-4 w-4" />
                Suppliers
              </button>
            )}
            {can("purchases.create") && (
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 rounded-md bg-amber-500 px-3.5 py-2 text-sm font-semibold text-[#1a1d23] shadow-sm transition hover:bg-amber-400"
              >
                <Plus className="h-4 w-4" />
                New PO
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search by PO number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="">All statuses</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>{STATUS_META[s].label}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
          </div>
        ) : orders?.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate-500">No purchase orders found.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">PO Number</th>
                  <th className="px-5 py-3">Supplier</th>
                  <th className="px-5 py-3 text-center">Items</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders?.map((po) => {
                  const meta = STATUS_META[po.status];
                  return (
                    <tr key={po.id} className="transition hover:bg-slate-50/60">
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setDetailId(po.id)}
                          className="font-mono text-sm font-medium text-slate-900 hover:text-amber-600"
                        >
                          {po.po_number}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-slate-400" />
                          {po.supplier?.name ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center text-slate-600">{po.items_count ?? 0}</td>
                      <td className="px-5 py-3.5 text-right font-semibold text-slate-900">{money(po.total)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setDetailId(po.id)}
                            className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            View
                          </button>
                          {po.status !== "received" && can("purchases.create") && (
                            <button
                              onClick={() => confirm(`Delete ${po.po_number}?`) && deleteMut.mutate(po.id)}
                              className="rounded-md border border-slate-200 p-1.5 text-red-600 transition hover:border-red-200 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showCreate && (
        <CreatePOModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
            setShowCreate(false);
          }}
        />
      )}
      {showSuppliers && <SuppliersModal onClose={() => setShowSuppliers(false)} />}
      {detailId && <PODetail poId={detailId} onClose={() => setDetailId(null)} />}
    </div>
  );
}

/* ---------- CREATE PO ---------- */
function CreatePOModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [poNumber, setPoNumber] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [vat, setVat] = useState("13");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);
  const [lines, setLines] = useState<POItemInput[]>([{ material_id: 0, quantity: 0, rate: 0 }]);
  const [error, setError] = useState("");

  const { data: suppliers } = useQuery({ queryKey: ["suppliers"], queryFn: () => fetchSuppliers() });
  const { data: materials } = useQuery({ queryKey: ["materials"], queryFn: () => fetchMaterials() });
  const { data: warehouses } = useQuery({ queryKey: ["warehouses"], queryFn: () => fetchWarehouses() });

  const mutation = useMutation({
    mutationFn: (payload: POPayload) => createPurchaseOrder(payload),
    onSuccess: onCreated,
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message ?? "Failed to create purchase order.");
    },
  });

  const setLine = (idx: number, key: keyof POItemInput, v: number) =>
    setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, [key]: v } : l)));

  const addLine = () => setLines((ls) => [...ls, { material_id: 0, quantity: 0, rate: 0 }]);
  const removeLine = (idx: number) => setLines((ls) => ls.filter((_, i) => i !== idx));

  // live preview totals
  const preview = useMemo(() => {
    const subtotal = lines.reduce((sum, l) => sum + (l.quantity || 0) * (l.rate || 0), 0);
    const vatAmount = subtotal * (Number(vat) / 100);
    return { subtotal, vatAmount, total: subtotal + vatAmount };
  }, [lines, vat]);

  const validLines = lines.filter((l) => l.material_id && l.quantity > 0 && l.rate >= 0);
  const canSubmit = poNumber.trim() && validLines.length > 0;

  const handleSubmit = () => {
    setError("");
    mutation.mutate({
      po_number: poNumber,
      supplier_id: supplierId ? Number(supplierId) : null,
      warehouse_id: warehouseId ? Number(warehouseId) : null,
      vat_percentage: Number(vat),
      order_date: orderDate,
      items: validLines,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-[#1a1d23]">New Purchase Order</h2>
          <button onClick={onClose} className="text-slate-400 transition hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-140px)] space-y-4 overflow-y-auto px-6 py-5">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">PO Number *</label>
              <input
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="PO-2081-0001"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Supplier</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="">—</option>
                {suppliers?.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Deliver To</label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="">—</option>
                {warehouses?.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Order Date</label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          {/* line items */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Line Items *</label>
              <button
                onClick={addLine}
                className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Line
              </button>
            </div>
            <div className="space-y-2">
              {lines.map((line, idx) => {
                const amount = (line.quantity || 0) * (line.rate || 0);
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={line.material_id || ""}
                      onChange={(e) => setLine(idx, "material_id", Number(e.target.value))}
                      className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    >
                      <option value="">Select material</option>
                      {materials?.map((m) => (
                        <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Qty"
                      value={line.quantity || ""}
                      onChange={(e) => setLine(idx, "quantity", Number(e.target.value))}
                      className="w-24 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                    <input
                      type="number"
                      placeholder="Rate"
                      value={line.rate || ""}
                      onChange={(e) => setLine(idx, "rate", Number(e.target.value))}
                      className="w-28 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                    <div className="w-32 text-right text-sm font-medium text-slate-700">
                      {amount ? `Rs. ${amount.toLocaleString()}` : "—"}
                    </div>
                    <button
                      onClick={() => removeLine(idx)}
                      disabled={lines.length === 1}
                      className="text-slate-400 transition hover:text-red-600 disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* live preview */}
          <div className="ml-auto w-full max-w-xs space-y-1.5 rounded-lg bg-slate-50 p-4 text-sm">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Preview (backend confirms)</p>
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>Rs. {preview.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1">
                VAT
                <input
                  type="number"
                  value={vat}
                  onChange={(e) => setVat(e.target.value)}
                  className="w-14 rounded border border-slate-300 px-1.5 py-0.5 text-xs"
                />
                %
              </span>
              <span>Rs. {preview.vatAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-[#1a1d23]">
              <span>Total</span>
              <span className="text-amber-600">Rs. {preview.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || mutation.isPending}
            className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-[#1a1d23] transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? "Creating..." : "Create PO (as Draft)"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- SUPPLIERS ---------- */
function SuppliersModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pan, setPan] = useState("");

  const { data: suppliers } = useQuery({ queryKey: ["suppliers"], queryFn: () => fetchSuppliers() });

  const addMut = useMutation({
    mutationFn: () => createSupplier({ name, phone: phone || undefined, pan_vat_no: pan || undefined, is_active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setName(""); setPhone(""); setPan("");
    },
  });

  const delMut = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-[#1a1d23]">Suppliers</h2>
          <button onClick={onClose} className="text-slate-400 transition hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-3 gap-2">
            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
            <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
            <input placeholder="PAN/VAT" value={pan} onChange={(e) => setPan(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
          </div>
          <button
            onClick={() => name && addMut.mutate()}
            disabled={addMut.isPending}
            className="flex items-center gap-1 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-[#1a1d23] transition hover:bg-amber-400 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            Add Supplier
          </button>

          <div className="space-y-2">
            {suppliers?.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">No suppliers yet.</p>
            ) : (
              suppliers?.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-400">
                      {s.phone ?? "—"} {s.pan_vat_no ? `· PAN: ${s.pan_vat_no}` : ""}
                    </p>
                  </div>
                  <button onClick={() => confirm(`Delete ${s.name}?`) && delMut.mutate(s.id)} className="text-slate-400 transition hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PurchasesPage() {
  return (
    <PermissionGuard permission="purchases.view">
      <PurchasesContent />
    </PermissionGuard>
  );
}