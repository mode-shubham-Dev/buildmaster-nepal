"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Calculator } from "lucide-react";
import {
  fetchBoq,
  addBoqItem,
  deleteBoqItem,
  type BoqItem,
} from "@/lib/boq-api";

function money(v: string | number | null): string {
  if (v === null || v === "") return "—";
  return `Rs. ${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function BoqTab({ projectId, canManage }: { projectId: number; canManage: boolean }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["boq", projectId],
    queryFn: () => fetchBoq(projectId),
  });

  // add-item form state
  const [category, setCategory] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("");
  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState("");

  // LIVE PREVIEW — this is just a display convenience; the backend computes the real stored amount
  const previewAmount = useMemo(() => {
    const q = parseFloat(quantity);
    const r = parseFloat(rate);
    if (isNaN(q) || isNaN(r)) return 0;
    return q * r;
  }, [quantity, rate]);

  const addMut = useMutation({
    mutationFn: () =>
      addBoqItem(projectId, {
        category: category || undefined,
        item_code: itemCode || undefined,
        description,
        unit,
        quantity: parseFloat(quantity),
        rate: parseFloat(rate),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boq", projectId] });
      setCategory(""); setItemCode(""); setDescription(""); setUnit(""); setQuantity(""); setRate("");
    },
  });

  const delMut = useMutation({
    mutationFn: deleteBoqItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["boq", projectId] }),
  });

  // group items by category for display
  const grouped = useMemo(() => {
    const items = data?.items ?? [];
    const groups: Record<string, BoqItem[]> = {};
    for (const item of items) {
      const key = item.category || "Uncategorized";
      (groups[key] ??= []).push(item);
    }
    return groups;
  }, [data]);

  const canSubmit = description.trim() && unit.trim() && quantity && rate;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* add-item form */}
      {canManage && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Plus className="h-4 w-4 text-amber-600" />
            Add Line Item
          </h3>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <input
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
            <input
              placeholder="Item code (1.1)"
              value={itemCode}
              onChange={(e) => setItemCode(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
            <input
              placeholder="Unit (cum, sqm)"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
            <input
              placeholder="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
            <input
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="sm:col-span-2 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
            <input
              placeholder="Rate (per unit)"
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
            <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Calculator className="h-3.5 w-3.5" />
                Amount
              </span>
              <span className="text-sm font-semibold text-amber-600">
                {previewAmount ? money(previewAmount) : "—"}
              </span>
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              onClick={() => canSubmit && addMut.mutate()}
              disabled={!canSubmit || addMut.isPending}
              className="flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-[#1a1d23] transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {addMut.isPending ? "Adding..." : "Add Item"}
            </button>
          </div>
        </div>
      )}

      {/* BOQ table grouped by category */}
      {(data?.items.length ?? 0) === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
          No BOQ items yet. Add line items to build the estimate.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-center">Unit</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3 text-right">Amount</th>
                {canManage && <th className="px-4 py-3"></th>}
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([cat, items]) => (
                <CategoryGroup
                  key={cat}
                  category={cat}
                  items={items}
                  canManage={canManage}
                  onDelete={(id) => delMut.mutate(id)}
                />
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-amber-50">
                <td colSpan={canManage ? 5 : 5} className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                  Grand Total
                </td>
                <td className="px-4 py-3 text-right text-base font-bold text-amber-700">
                  {money(data?.total ?? 0)}
                </td>
                {canManage && <td></td>}
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

function CategoryGroup({
  category,
  items,
  canManage,
  onDelete,
}: {
  category: string;
  items: BoqItem[];
  canManage: boolean;
  onDelete: (id: number) => void;
}) {
  const subtotal = items.reduce((sum, i) => sum + Number(i.amount), 0);
  return (
    <>
      <tr className="bg-slate-100/70">
        <td colSpan={canManage ? 7 : 6} className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
          {category}
          <span className="ml-2 font-normal text-slate-400">
            ({money(subtotal)})
          </span>
        </td>
      </tr>
      {items.map((item) => (
        <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/60">
          <td className="px-4 py-3 text-slate-500">{item.item_code ?? "—"}</td>
          <td className="px-4 py-3 text-slate-900">{item.description}</td>
          <td className="px-4 py-3 text-center text-slate-600">{item.unit}</td>
          <td className="px-4 py-3 text-right text-slate-600">
            {Number(item.quantity).toLocaleString()}
          </td>
          <td className="px-4 py-3 text-right text-slate-600">
            {Number(item.rate).toLocaleString()}
          </td>
          <td className="px-4 py-3 text-right font-medium text-slate-900">
            {money(item.amount)}
          </td>
          {canManage && (
            <td className="px-4 py-3 text-right">
              <button
                onClick={() => onDelete(item.id)}
                className="text-slate-400 transition hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </td>
          )}
        </tr>
      ))}
    </>
  );
}