"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/permission-guard";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  ArrowLeft, Lock, Play, X, Plus, Trash2, ChevronDown, ShieldCheck, AlertTriangle,
} from "lucide-react";
import {
  fetchPayrollRun, generatePayslips, finalizePayrollRun,
  addPayslipLine, removePayslipLine,
  type Payslip, type PayslipLine,
} from "@/lib/payroll-api";

function money(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === "") return "0.00";
  return Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ProfileContent() {
  const params = useParams();
  const id = Number(params.id);
  const queryClient = useQueryClient();
  const { can } = useAuth();
  const canProcess = can("payroll.process");
  const canFinalize = can("payroll.finalize");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showFinalize, setShowFinalize] = useState(false);

  const { data: run, isLoading } = useQuery({
    queryKey: ["payroll-run", id],
    queryFn: () => fetchPayrollRun(id),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["payroll-run", id] });

  const generateMut = useMutation({ mutationFn: () => generatePayslips(id), onSuccess: invalidate });
  const finalizeMut = useMutation({
    mutationFn: () => finalizePayrollRun(id),
    onSuccess: () => { invalidate(); setShowFinalize(false); },
  });

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#fafaf9]"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" /></div>;
  }
  if (!run) {
    return <div className="flex min-h-screen items-center justify-center bg-[#fafaf9]"><p className="text-sm text-slate-400">Run not found.</p></div>;
  }

  const locked = run.status === "finalized";
  const payslips = run.payslips ?? [];
  const totalNet = payslips.reduce((s, p) => s + Number(p.net_pay), 0);
  const totalGross = payslips.reduce((s, p) => s + Number(p.gross_pay), 0);
  const totalDeduct = payslips.reduce((s, p) => s + Number(p.total_deductions), 0);

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <Link href="/payroll" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-slate-600">
            <ArrowLeft className="h-4 w-4" /> Payroll
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* run header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-[#1a1d23]">{run.title}</h1>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${locked ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                {locked ? <><Lock className="h-3 w-3" /> Finalized</> : "Draft"}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              {new Date(run.period_start).toLocaleDateString()} – {new Date(run.period_end).toLocaleDateString()} · {run.working_days} working days
              {locked && run.finalizer && <> · locked by {run.finalizer.name}</>}
            </p>
          </div>

          {canProcess && !locked && (
            <div className="flex items-center gap-2">
              <button onClick={() => generateMut.mutate()} disabled={generateMut.isPending} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">
                <Play className="h-4 w-4" />
                {generateMut.isPending ? "Generating..." : payslips.length ? "Regenerate" : "Generate Payslips"}
              </button>
              {payslips.length > 0 && canFinalize && (
                <button onClick={() => setShowFinalize(true)} className="flex items-center gap-2 rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2e37]">
                  <Lock className="h-4 w-4" /> Finalize
                </button>
              )}
            </div>
          )}
        </div>

        {/* totals band */}
        {payslips.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-200/70">
            <Totals label="Gross Payroll" value={money(totalGross)} />
            <Totals label="Total Deductions" value={money(totalDeduct)} />
            <Totals label="Net Payable" value={money(totalNet)} accent />
          </div>
        )}

        {/* locked banner */}
        {locked && (
          <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50/60 px-4 py-3 text-sm text-green-700">
            <ShieldCheck className="h-4 w-4" />
            This payroll is finalized and locked. Figures are permanent and cannot be edited.
          </div>
        )}

        {/* payslips */}
        {payslips.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <p className="text-sm text-slate-500">No payslips yet.</p>
            {canProcess && !locked && <p className="mt-1 text-xs text-slate-400">Click &ldquo;Generate Payslips&rdquo; to compute pay for all active employees.</p>}
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
            <div className="grid grid-cols-12 gap-2 border-b border-slate-100 bg-slate-50/60 px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              <div className="col-span-4">Employee</div>
              <div className="col-span-2 text-right">Gross</div>
              <div className="col-span-3 text-right">Deductions</div>
              <div className="col-span-3 text-right">Net Pay</div>
            </div>
            {payslips.map((p) => (
              <PayslipRow
                key={p.id}
                payslip={p}
                locked={locked}
                canProcess={canProcess}
                expanded={expanded === p.id}
                onToggle={() => setExpanded(expanded === p.id ? null : p.id)}
                onChanged={invalidate}
              />
            ))}
          </div>
        )}
      </div>

      {showFinalize && (
        <FinalizeModal
          title={run.title}
          total={money(totalNet)}
          count={payslips.length}
          pending={finalizeMut.isPending}
          onConfirm={() => finalizeMut.mutate()}
          onClose={() => setShowFinalize(false)}
        />
      )}
    </div>
  );
}

function Totals({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-white px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-lg font-semibold tabular-nums ${accent ? "text-[#1a1d23]" : "text-slate-700"}`}>Rs. {value}</p>
    </div>
  );
}

function PayslipRow({
  payslip, locked, canProcess, expanded, onToggle, onChanged,
}: {
  payslip: Payslip;
  locked: boolean;
  canProcess: boolean;
  expanded: boolean;
  onToggle: () => void;
  onChanged: () => void;
}) {
  const emp = payslip.employee;
  const name = emp ? `${emp.first_name} ${emp.last_name}` : "—";

  return (
    <div className={`border-b border-slate-100 last:border-0 ${expanded ? "bg-slate-50/40" : ""}`}>
      <button onClick={onToggle} className="grid w-full grid-cols-12 items-center gap-2 px-5 py-3.5 text-left transition hover:bg-slate-50/60">
        <div className="col-span-4 flex items-center gap-2">
          <ChevronDown className={`h-4 w-4 text-slate-300 transition ${expanded ? "rotate-180" : ""}`} />
          <div>
            <p className="text-sm font-medium text-slate-900">{name}</p>
            <p className="text-xs text-slate-400">{emp?.employee_code}</p>
          </div>
        </div>
        <div className="col-span-2 text-right text-sm tabular-nums text-slate-600">{money(payslip.gross_pay)}</div>
        <div className="col-span-3 text-right text-sm tabular-nums text-red-500">−{money(payslip.total_deductions)}</div>
        <div className="col-span-3 text-right text-sm font-semibold tabular-nums text-[#1a1d23]">Rs. {money(payslip.net_pay)}</div>
      </button>

      {expanded && (
        <div className="px-5 pb-5">
          <PayslipBreakdown payslip={payslip} locked={locked} canProcess={canProcess} onChanged={onChanged} />
        </div>
      )}
    </div>
  );
}

function BreakdownRow({ label, value, muted, negative }: { label: string; value: string; muted?: boolean; negative?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className={muted ? "text-slate-400" : "text-slate-600"}>{label}</span>
      <span className={`tabular-nums ${negative ? "text-red-500" : "text-slate-700"}`}>{negative ? "−" : ""}Rs. {value}</span>
    </div>
  );
}

function PayslipBreakdown({ payslip, locked, canProcess, onChanged }: { payslip: Payslip; locked: boolean; canProcess: boolean; onChanged: () => void }) {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState<"allowance" | "deduction" | null>(null);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");

  const invalidate = () => { queryClient.invalidateQueries({ queryKey: ["payroll-run"] }); onChanged(); };

  const addMut = useMutation({
    mutationFn: () => addPayslipLine(payslip.id, adding!, label, Number(amount)),
    onSuccess: () => { invalidate(); setAdding(null); setLabel(""); setAmount(""); },
  });
  const delMut = useMutation({ mutationFn: removePayslipLine, onSuccess: invalidate });

  const allowanceLines = payslip.lines?.filter((l) => l.type === "allowance") ?? [];
  const deductionLines = payslip.lines?.filter((l) => l.type === "deduction") ?? [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="grid gap-6 sm:grid-cols-2">
        {/* EARNINGS */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Earnings</p>
          <BreakdownRow label="Basic Salary" value={money(payslip.basic_salary)} />
          {allowanceLines.map((line) => (
            <LineRow key={line.id} line={line} locked={locked} canProcess={canProcess} onDelete={() => delMut.mutate(line.id)} />
          ))}
          {Number(payslip.overtime_amount) > 0 && <BreakdownRow label="Overtime" value={money(payslip.overtime_amount)} />}
          <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-2 text-sm font-semibold">
            <span className="text-slate-700">Gross Pay</span>
            <span className="tabular-nums text-slate-900">Rs. {money(payslip.gross_pay)}</span>
          </div>
          {canProcess && !locked && (
            adding === "allowance" ? (
              <LineForm label={label} amount={amount} setLabel={setLabel} setAmount={setAmount} pending={addMut.isPending} onSave={() => label && amount && addMut.mutate()} onCancel={() => setAdding(null)} />
            ) : (
              <button onClick={() => setAdding("allowance")} className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-[#1a1d23]">
                <Plus className="h-3.5 w-3.5" /> Add allowance
              </button>
            )
          )}
        </div>

        {/* DEDUCTIONS */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Deductions</p>
          {Number(payslip.unpaid_leave_deduction) > 0 && (
            <BreakdownRow label={`Unpaid Leave (${payslip.unpaid_leave_days} ${payslip.unpaid_leave_days === 1 ? "day" : "days"})`} value={money(payslip.unpaid_leave_deduction)} negative />
          )}
          <BreakdownRow label={`Tax (${Number(payslip.tax_rate)}%)`} value={money(payslip.tax_amount)} negative />
          {deductionLines.map((line) => (
            <LineRow key={line.id} line={line} locked={locked} canProcess={canProcess} negative onDelete={() => delMut.mutate(line.id)} />
          ))}
          <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-2 text-sm font-semibold">
            <span className="text-slate-700">Total Deductions</span>
            <span className="tabular-nums text-red-500">−Rs. {money(payslip.total_deductions)}</span>
          </div>
          {canProcess && !locked && (
            adding === "deduction" ? (
              <LineForm label={label} amount={amount} setLabel={setLabel} setAmount={setAmount} pending={addMut.isPending} onSave={() => label && amount && addMut.mutate()} onCancel={() => setAdding(null)} />
            ) : (
              <button onClick={() => setAdding("deduction")} className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-[#1a1d23]">
                <Plus className="h-3.5 w-3.5" /> Add deduction
              </button>
            )
          )}
        </div>
      </div>

      {/* net */}
      <div className="mt-5 flex items-center justify-between rounded-xl bg-[#1a1d23] px-5 py-3.5">
        <span className="text-sm font-medium text-white/80">Net Pay</span>
        <span className="text-lg font-semibold tabular-nums text-white">Rs. {money(payslip.net_pay)}</span>
      </div>
    </div>
  );
}

function LineRow({ line, locked, canProcess, negative, onDelete }: { line: PayslipLine; locked: boolean; canProcess: boolean; negative?: boolean; onDelete: () => void }) {
  return (
    <div className="group flex items-center justify-between py-1 text-sm">
      <span className="flex items-center gap-1.5 text-slate-600">
        {line.label}
        {canProcess && !locked && (
          <button onClick={onDelete} className="text-slate-300 opacity-0 transition hover:text-red-500 group-hover:opacity-100">
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </span>
      <span className={`tabular-nums ${negative ? "text-red-500" : "text-slate-700"}`}>{negative ? "−" : ""}Rs. {money(line.amount)}</span>
    </div>
  );
}

function LineForm({ label, amount, setLabel, setAmount, pending, onSave, onCancel }: { label: string; amount: string; setLabel: (v: string) => void; setAmount: (v: string) => void; pending: boolean; onSave: () => void; onCancel: () => void }) {
  return (
    <div className="mt-2 flex items-center gap-1.5">
      <input autoFocus value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" className="flex-1 rounded-md border border-slate-200 bg-slate-50/50 px-2 py-1 text-xs outline-none focus:border-slate-300 focus:bg-white" />
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" className="w-24 rounded-md border border-slate-200 bg-slate-50/50 px-2 py-1 text-xs outline-none focus:border-slate-300 focus:bg-white" />
      <button onClick={onSave} disabled={pending} className="rounded-md bg-[#1a1d23] px-2 py-1 text-xs font-medium text-white disabled:opacity-50">Add</button>
      <button onClick={onCancel} className="rounded-md px-1.5 py-1 text-slate-400 hover:bg-slate-100"><X className="h-3.5 w-3.5" /></button>
    </div>
  );
}

function FinalizeModal({ title, total, count, pending, onConfirm, onClose }: { title: string; total: string; count: number; pending: boolean; onConfirm: () => void; onClose: () => void }) {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#1a1d23]">Finalize Payroll</h2>
            <p className="mt-1 text-sm text-slate-500">
              You&rsquo;re about to finalize <span className="font-medium text-slate-700">{title}</span> — {count} payslips totalling <span className="font-semibold text-slate-700">Rs. {total}</span> net.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-amber-50/60 border border-amber-100 px-4 py-3 text-sm text-amber-800">
          Once finalized, this payroll is <strong>permanently locked</strong>. No figures, allowances, or deductions can be changed afterward. This is the record of what was paid.
        </div>

        <label className="mt-4 flex items-start gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#1a1d23]" />
          I have reviewed all payslips and confirm these figures are correct.
        </label>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100">Cancel</button>
          <button onClick={onConfirm} disabled={!confirmed || pending} className="flex items-center gap-2 rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2e37] disabled:opacity-40">
            <Lock className="h-4 w-4" />
            {pending ? "Finalizing..." : "Finalize & Lock"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PayrollRunPage() {
  return (
    <PermissionGuard permission="payroll.view">
      <ProfileContent />
    </PermissionGuard>
  );
}