"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { X, Info } from "lucide-react";
import {
  fetchBillingBasis, createRaBill,
  type BillingBasisItem, type BillPayload,
} from "@/lib/billing-api";

function money(v: number): string {
  return `Rs. ${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function CreateBillModal({ projectId, onClose, onSaved }: { projectId: number; onClose: () => void; onSaved: () => void }) {
  const [billDate, setBillDate] = useState(new Date().toISOString().split("T")[0]);
  const [retention, setRetention] = useState("5");
  const [vat, setVat] = useState("13");
  const [advance, setAdvance] = useState("0");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  // cumulative qty entered per boq item id
  const [entries, setEntries] = useState<Record<number, string>>({});

  const { data: basis, isLoading } = useQuery({
    queryKey: ["billing-basis", projectId],
    queryFn: () => fetchBillingBasis(projectId),
  });

  const mutation = useMutation({
    mutationFn: (payload: BillPayload) => createRaBill(payload),
    onSuccess: onSaved,
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string; errors?: { lines?: string[] } } } };
      setError(e.response?.data?.errors?.lines?.[0] ?? e.response?.data?.message ?? "Failed to create bill.");
    },
  });

  const setEntry = (boqItemId: number, value: string) =>
    setEntries((s) => ({ ...s, [boqItemId]: value }));

  // live preview: for each item with a cumulative entered, compute this-bill qty + amount
  const preview = useMemo(() => {
    if (!basis) return { lines: [], gross: 0 };
    const lines = basis
      .map((item) => {
        const cumStr = entries[item.boq_item_id];
        if (cumStr === undefined || cumStr === "") return null;
        const cumulative = Number(cumStr);
        const thisBill = Math.max(cumulative - item.previously_billed, 0);
        const amount = thisBill * item.rate;
        return { item, cumulative, thisBill, amount };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null && x.thisBill > 0);
    const gross = lines.reduce((s, l) => s + l.amount, 0);
    return { lines, gross };
  }, [basis, entries]);

  const retentionAmt = preview.gross * (Number(retention) / 100);
  const vatAmt = preview.gross * (Number(vat) / 100);
  const advanceAmt = Number(advance) || 0;
  const net = preview.gross + vatAmt - retentionAmt - advanceAmt;

  const handleSubmit = () => {
    setError("");
    const lines = Object.entries(entries)
      .filter(([, v]) => v !== "")
      .map(([id, v]) => ({ boq_item_id: Number(id), cumulative_qty: Number(v) }));
    if (lines.length === 0) { setError("Enter a cumulative quantity for at least one item."); return; }
    mutation.mutate({
      project_id: projectId,
      bill_date: billDate,
      retention_percentage: Number(retention),
      vat_percentage: Number(vat),
      advance_recovery: advanceAmt,
      remarks: remarks || undefined,
      lines,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#1a1d23]">New RA Bill</h2>
            <p className="text-xs text-slate-400">Enter cumulative quantity completed to date per item</p>
          </div>
          <button onClick={onClose} className="text-slate-300 transition hover:text-slate-500"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && <div className="mb-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</div>}

          {isLoading ? (
            <div className="flex items-center justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" /></div>
          ) : (basis?.length ?? 0) === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 py-12 text-center text-sm text-slate-500">
              This project has no BOQ items to bill against. Add BOQ items first.
            </div>
          ) : (
            <>
              {/* the billing basis grid */}
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      <th className="px-3 py-2.5">Item</th>
                      <th className="px-3 py-2.5 text-right">BOQ Qty</th>
                      <th className="px-3 py-2.5 text-right">Billed</th>
                      <th className="px-3 py-2.5 text-right">Remaining</th>
                      <th className="px-3 py-2.5 text-right w-32">Cumulative</th>
                      <th className="px-3 py-2.5 text-right">This Bill</th>
                      <th className="px-3 py-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {basis?.map((item) => {
                      const cumStr = entries[item.boq_item_id] ?? "";
                      const cumulative = cumStr === "" ? null : Number(cumStr);
                      const thisBill = cumulative !== null ? Math.max(cumulative - item.previously_billed, 0) : 0;
                      const amount = thisBill * item.rate;
                      const over = cumulative !== null && cumulative > item.boq_quantity;
                      const back = cumulative !== null && cumulative < item.previously_billed;
                      return (
                        <tr key={item.boq_item_id} className="align-top">
                          <td className="px-3 py-2.5">
                            <p className="font-medium text-slate-800">{item.description}</p>
                            <p className="text-xs text-slate-400">{item.item_code ? `${item.item_code} · ` : ""}{item.unit} · {money(item.rate)}/{item.unit}</p>
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-slate-500">{item.boq_quantity.toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-slate-400">{item.previously_billed.toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums font-medium text-slate-600">{item.remaining.toLocaleString()}</td>
                          <td className="px-3 py-2.5">
                            <input
                              type="number"
                              value={cumStr}
                              onChange={(e) => setEntry(item.boq_item_id, e.target.value)}
                              placeholder={String(item.previously_billed)}
                              className={`w-full rounded-md border bg-slate-50/50 px-2 py-1 text-right text-sm tabular-nums outline-none focus:bg-white ${over || back ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-slate-300"}`}
                            />
                            {over && <p className="mt-0.5 text-[10px] text-red-500">exceeds BOQ</p>}
                            {back && <p className="mt-0.5 text-[10px] text-red-500">below billed</p>}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums font-medium text-slate-700">{thisBill > 0 ? thisBill.toLocaleString() : "—"}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-slate-900">{amount > 0 ? money(amount) : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 flex items-start gap-1.5 text-xs text-slate-400">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>Enter the total quantity completed to date (cumulative). This bill charges only the difference from what&rsquo;s already been billed.</span>
              </div>

              {/* bill meta + totals */}
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Bill Date</label>
                    <input type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white [color-scheme:light]" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Retention %</label>
                      <input type="number" value={retention} onChange={(e) => setRetention(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-slate-600">VAT %</label>
                      <input type="number" value={vat} onChange={(e) => setVat(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Advance</label>
                      <input type="number" value={advance} onChange={(e) => setAdvance(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
                    </div>
                  </div>
                </div>

                {/* live totals */}
                <div className="space-y-1.5 rounded-xl bg-slate-50 p-4 text-sm">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">This Bill (backend confirms)</p>
                  <Row label="Gross" value={money(preview.gross)} />
                  <Row label={`Retention (${retention || 0}%)`} value={`− ${money(retentionAmt)}`} muted />
                  <Row label={`VAT (${vat || 0}%)`} value={`+ ${money(vatAmt)}`} muted />
                  {advanceAmt > 0 && <Row label="Advance Recovery" value={`− ${money(advanceAmt)}`} muted />}
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-[#1a1d23]">
                    <span>Net Payable</span>
                    <span className="tabular-nums">{money(net)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100">Cancel</button>
          <button onClick={handleSubmit} disabled={mutation.isPending || preview.lines.length === 0} className="rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2e37] disabled:opacity-50">
            {mutation.isPending ? "Creating..." : "Create RA Bill"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={muted ? "text-slate-400" : "text-slate-600"}>{label}</span>
      <span className={`tabular-nums ${muted ? "text-slate-500" : "text-slate-700"}`}>{value}</span>
    </div>
  );
}