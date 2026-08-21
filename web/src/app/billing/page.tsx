"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/permission-guard";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  ArrowLeft, Plus, X, FileText, Lock, Send, Check, CircleDollarSign,
  ChevronRight, Trash2, Receipt, Banknote,
} from "lucide-react";
import {
  fetchRaBills, fetchRaBill, transitionRaBill, recordBillPayment, deleteRaBill,
  type RaBill, type BillStatus,
} from "@/lib/billing-api";
import { fetchProjects } from "@/lib/projects-api";
import { CreateBillModal } from "@/components/billing/create-bill-modal";

function money(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === "") return "Rs. 0";
  return `Rs. ${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
function money2(v: string | number): string {
  return Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const STATUS_META: Record<BillStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-600" },
  submitted: { label: "Submitted", color: "bg-blue-50 text-blue-600" },
  approved: { label: "Approved", color: "bg-purple-50 text-purple-600" },
  paid: { label: "Paid", color: "bg-green-50 text-green-600" },
};

function BillingContent() {
  const queryClient = useQueryClient();
  const { can } = useAuth();
  const canCreate = can("billing.create");
  const [projectId, setProjectId] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const { data: projects } = useQuery({ queryKey: ["projects"], queryFn: () => fetchProjects() });
  const { data: bills, isLoading, isError } = useQuery({
    queryKey: ["ra-bills", projectId],
    queryFn: () => fetchRaBills(projectId ? { project_id: Number(projectId) } : {}),
  });

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-[#1a1d23]">Client Billing</h1>
                <p className="text-[13px] text-slate-400">RA bills &amp; payments</p>
              </div>
            </div>
            {canCreate && (
              <button
                onClick={() => setShowCreate(true)}
                disabled={!projectId}
                title={!projectId ? "Select a project first" : ""}
                className="flex items-center gap-2 rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2e37] disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
                New RA Bill
              </button>
            )}
          </div>

          <div className="mt-5">
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full max-w-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
            >
              <option value="">All projects</option>
              {projects?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-24"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" /></div>
        ) : isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-10 text-center text-sm text-red-600">
            Failed to load bills. Please refresh and try again.
          </div>
        ) : bills?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300"><FileText className="h-7 w-7" /></div>
            <p className="text-sm font-medium text-slate-500">No RA bills yet</p>
            {canCreate && <p className="mt-1 text-xs text-slate-400">{projectId ? "Create the first bill for this project." : "Select a project to begin billing."}</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {bills?.map((bill) => {
              const meta = STATUS_META[bill.status];
              return (
                <button
                  key={bill.id}
                  onClick={() => setDetailId(bill.id)}
                  className="group flex w-full items-center justify-between rounded-2xl border border-slate-200/70 bg-white p-5 text-left transition hover:border-slate-300 hover:shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bill.status === "paid" ? "bg-green-50 text-green-600" : bill.status === "approved" ? "bg-purple-50 text-purple-600" : "bg-slate-100 text-slate-500"}`}>
                      {bill.status === "paid" || bill.status === "approved" ? <Lock className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#1a1d23]">RA Bill No. {bill.bill_no}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.color}`}>{meta.label}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {bill.project?.name} · {bill.bill_date.split("T")[0]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums text-[#1a1d23]">{money(bill.net_payable)}</p>
                      {Number(bill.balance_due) > 0 && bill.status !== "draft" && bill.status !== "submitted" && (
                        <p className="text-xs text-amber-600">{money(bill.balance_due)} due</p>
                      )}
                      {Number(bill.balance_due) === 0 && bill.status === "paid" && (
                        <p className="text-xs text-green-600">Fully paid</p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-500" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {showCreate && projectId && (
        <CreateBillModal
          projectId={Number(projectId)}
          onClose={() => setShowCreate(false)}
          onSaved={() => { queryClient.invalidateQueries({ queryKey: ["ra-bills"] }); setShowCreate(false); }}
        />
      )}
      {detailId && (
        <BillDetail
          billId={detailId}
          onClose={() => setDetailId(null)}
          onChanged={() => queryClient.invalidateQueries({ queryKey: ["ra-bills"] })}
        />
      )}
    </div>
  );
}

function BillDetail({ billId, onClose, onChanged }: { billId: number; onClose: () => void; onChanged: () => void }) {
  const queryClient = useQueryClient();
  const { can } = useAuth();
  const canApprove = can("billing.approve");
  const [showPay, setShowPay] = useState(false);

  const { data: bill, isLoading, isError } = useQuery({ queryKey: ["ra-bill", billId], queryFn: () => fetchRaBill(billId) });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["ra-bill", billId] });
    queryClient.invalidateQueries({ queryKey: ["ra-bills"] });
    onChanged();
  };

  const transitionMut = useMutation({
    mutationFn: (status: BillStatus) => transitionRaBill(billId, status),
    onSuccess: invalidate,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        {isError ? (
          <div className="flex items-center justify-center py-20 text-sm text-red-600">Failed to load bill. Please close and try again.</div>
        ) : isLoading || !bill ? (
          <div className="flex items-center justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" /></div>
        ) : (
          <>
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-[#1a1d23]">RA Bill No. {bill.bill_no}</h2>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_META[bill.status].color}`}>{STATUS_META[bill.status].label}</span>
                </div>
                <p className="text-xs text-slate-400">{bill.project?.name} · {bill.bill_date.split("T")[0]}</p>
              </div>
              <button onClick={onClose} className="text-slate-300 transition hover:text-slate-500"><X className="h-5 w-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* line items */}
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      <th className="px-3 py-2.5">Item</th>
                      <th className="px-3 py-2.5 text-right">Cumulative</th>
                      <th className="px-3 py-2.5 text-right">Previous</th>
                      <th className="px-3 py-2.5 text-right">This Bill</th>
                      <th className="px-3 py-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bill.lines?.map((line) => (
                      <tr key={line.id}>
                        <td className="px-3 py-2.5">
                          <p className="font-medium text-slate-800">{line.boq_item?.description}</p>
                          <p className="text-xs text-slate-400">{line.boq_item?.unit}</p>
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-slate-500">{Number(line.cumulative_qty).toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-slate-400">{Number(line.previous_qty).toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums font-medium text-slate-700">{Number(line.this_bill_qty).toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-slate-900">Rs. {money2(line.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* money breakdown */}
              <div className="mt-5 ml-auto max-w-xs space-y-1.5 text-sm">
                <Row label="Gross Amount" value={money2(bill.gross_amount)} />
                <Row label={`Retention (${Number(bill.retention_percentage)}%)`} value={`− ${money2(bill.retention_amount)}`} muted />
                <Row label={`VAT (${Number(bill.vat_percentage)}%)`} value={`+ ${money2(bill.vat_amount)}`} muted />
                {Number(bill.advance_recovery) > 0 && <Row label="Advance Recovery" value={`− ${money2(bill.advance_recovery)}`} muted />}
                <div className="flex justify-between border-t border-slate-200 pt-1.5 text-base font-bold text-[#1a1d23]">
                  <span>Net Payable</span>
                  <span className="tabular-nums">Rs. {money2(bill.net_payable)}</span>
                </div>
                {(bill.status === "approved" || bill.status === "paid") && (
                  <>
                    <Row label="Received" value={`Rs. ${money2(bill.total_paid)}`} muted />
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600">Balance Due</span>
                      <span className={`tabular-nums ${bill.balance_due > 0 ? "text-amber-600" : "text-green-600"}`}>Rs. {money2(bill.balance_due)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* payments list */}
              {(bill.payments?.length ?? 0) > 0 && (
                <div className="mt-6">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Payments Received</p>
                  <div className="space-y-1.5">
                    {bill.payments?.map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
                        <span className="flex items-center gap-2 text-slate-600"><Banknote className="h-3.5 w-3.5 text-green-500" />{p.payment_date.split("T")[0]}{p.reference ? ` · ${p.reference}` : ""}</span>
                        <span className="tabular-nums font-medium text-slate-800">Rs. {money2(p.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* workflow actions */}
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
              {bill.status === "draft" && canApprove && (
                <ActionBtn label="Submit" icon={<Send className="h-4 w-4" />} onClick={() => transitionMut.mutate("submitted")} pending={transitionMut.isPending} />
              )}
              {bill.status === "submitted" && canApprove && (
                <>
                  <ActionBtn label="Send back to Draft" onClick={() => transitionMut.mutate("draft")} pending={transitionMut.isPending} subtle />
                  <ActionBtn label="Approve" icon={<Check className="h-4 w-4" />} onClick={() => transitionMut.mutate("approved")} pending={transitionMut.isPending} primary />
                </>
              )}
              {bill.status === "approved" && canApprove && (
                <>
                  <ActionBtn label="Record Payment" icon={<Banknote className="h-4 w-4" />} onClick={() => setShowPay(true)} subtle />
                  {bill.balance_due <= 0 && <ActionBtn label="Mark Paid" icon={<Check className="h-4 w-4" />} onClick={() => transitionMut.mutate("paid")} pending={transitionMut.isPending} primary />}
                </>
              )}
              {bill.status === "paid" && canApprove && bill.balance_due > 0 && (
                <ActionBtn label="Record Payment" icon={<Banknote className="h-4 w-4" />} onClick={() => setShowPay(true)} subtle />
              )}
              {(bill.status === "approved" || bill.status === "paid") && <span className="flex items-center gap-1 text-xs text-slate-400"><Lock className="h-3 w-3" /> Locked</span>}
            </div>

            {showPay && (
              <PaymentModal
                billId={billId}
                balanceDue={bill.balance_due}
                onClose={() => setShowPay(false)}
                onSaved={() => { invalidate(); setShowPay(false); }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PaymentModal({ billId, balanceDue, onClose, onSaved }: { billId: number; balanceDue: number; onClose: () => void; onSaved: () => void }) {
  const [amount, setAmount] = useState(String(balanceDue > 0 ? balanceDue : ""));
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [reference, setReference] = useState("");
  const mutation = useMutation({ mutationFn: () => recordBillPayment(billId, Number(amount), date, reference || undefined), onSuccess: onSaved });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1a1d23]">Record Payment</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500"><X className="h-5 w-5" /></button>
        </div>
        <p className="mt-1 text-xs text-slate-400">Balance due: Rs. {money2(balanceDue)}</p>
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Amount</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white [color-scheme:light]" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Reference</label>
            <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Cheque / txn no." className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100">Cancel</button>
          <button onClick={() => amount && mutation.mutate()} disabled={mutation.isPending} className="rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a2e37] disabled:opacity-50">
            {mutation.isPending ? "Saving..." : "Record"}
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

function ActionBtn({ label, icon, onClick, pending, primary, subtle }: { label: string; icon?: React.ReactNode; onClick: () => void; pending?: boolean; primary?: boolean; subtle?: boolean }) {
  const cls = primary
    ? "bg-[#1a1d23] text-white hover:bg-[#2a2e37]"
    : subtle
    ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
    : "bg-[#1a1d23] text-white hover:bg-[#2a2e37]";
  return (
    <button onClick={onClick} disabled={pending} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${cls}`}>
      {icon}{pending ? "..." : label}
    </button>
  );
}

export default function BillingPage() {
  return (
    <PermissionGuard permission="billing.view">
      <BillingContent />
    </PermissionGuard>
  );
}