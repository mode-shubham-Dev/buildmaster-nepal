"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/permission-guard";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  ArrowLeft, Plus, X, Lock, FileText, Users2, Trash2, ChevronRight, CircleDollarSign,
} from "lucide-react";
import {
  fetchPayrollRuns, createPayrollRun, deletePayrollRun,
  type PayrollRun, type RunPayload,
} from "@/lib/payroll-api";

function money(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === "") return "Rs. 0";
  return `Rs. ${Number(v).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function fmtRange(a: string, b: string): string {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${new Date(a).toLocaleDateString(undefined, opts)} – ${new Date(b).toLocaleDateString(undefined, { ...opts, year: "numeric" })}`;
}

function PayrollContent() {
  const queryClient = useQueryClient();
  const { can } = useAuth();
  const canProcess = can("payroll.process");
  const [showCreate, setShowCreate] = useState(false);

  const { data: runs, isLoading } = useQuery({
    queryKey: ["payroll-runs"],
    queryFn: fetchPayrollRuns,
  });

  const deleteMut = useMutation({
    mutationFn: deletePayrollRun,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payroll-runs"] }),
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message ?? "Failed to delete.");
    },
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
                <h1 className="text-lg font-semibold tracking-tight text-[#1a1d23]">Payroll</h1>
                <p className="text-[13px] text-slate-400">{runs?.length ?? 0} payroll runs</p>
              </div>
            </div>
            {canProcess && (
              <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2e37]">
                <Plus className="h-4 w-4" />
                New Run
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
          </div>
        ) : runs?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
              <CircleDollarSign className="h-7 w-7" />
            </div>
            <p className="text-sm font-medium text-slate-500">No payroll runs yet</p>
            <p className="mt-1 text-xs text-slate-400">Create a run to process a pay period.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {runs?.map((run) => (
              <Link
                key={run.id}
                href={`/payroll/${run.id}`}
                className="group flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white p-5 transition hover:border-slate-300 hover:shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)]"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${run.status === "finalized" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                    {run.status === "finalized" ? <Lock className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[#1a1d23]">{run.title}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${run.status === "finalized" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {run.status === "finalized" ? "Finalized" : "Draft"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {fmtRange(run.period_start, run.period_end)} · {run.working_days} working days
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="flex items-center justify-end gap-1 text-xs text-slate-400">
                      <Users2 className="h-3 w-3" />{run.payslips_count ?? 0}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-[#1a1d23]">{money(run.payslips_sum_net_pay)}</p>
                  </div>
                  {canProcess && run.status === "draft" && (
                    <button
                      onClick={(e) => { e.preventDefault(); if (confirm(`Delete ${run.title}?`)) deleteMut.mutate(run.id); }}
                      className="text-slate-300 opacity-0 transition hover:text-red-500 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-500" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateRunModal
          onClose={() => setShowCreate(false)}
          onSaved={() => { queryClient.invalidateQueries({ queryKey: ["payroll-runs"] }); setShowCreate(false); }}
        />
      )}
    </div>
  );
}

function CreateRunModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<RunPayload>({ title: "", period_start: "", period_end: "", working_days: 30 });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () => createPayrollRun(form),
    onSuccess: onSaved,
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Failed to create run.");
    },
  });

  const set = <K extends keyof RunPayload>(k: K, v: RunPayload[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1a1d23]">New Payroll Run</h2>
          <button onClick={onClose} className="text-slate-300 transition hover:text-slate-500"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-5 space-y-3.5">
          {error && <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</div>}

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Title</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Poush 2081 / December 2024 Payroll" className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Period Start</label>
              <input type="date" value={form.period_start} onChange={(e) => set("period_start", e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white [color-scheme:light]" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Period End</label>
              <input type="date" value={form.period_end} min={form.period_start} onChange={(e) => set("period_end", e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white [color-scheme:light]" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Working Days</label>
            <input type="number" value={form.working_days || ""} onChange={(e) => set("working_days", Number(e.target.value))} min={1} max={31} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
            <p className="mt-1 text-xs text-slate-400">Used to compute the per-day rate for leave deductions.</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100">Cancel</button>
          <button
            onClick={() => form.title && form.period_start && form.period_end && form.working_days && mutation.mutate()}
            disabled={mutation.isPending}
            className="rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2e37] disabled:opacity-50"
          >
            {mutation.isPending ? "Creating..." : "Create Run"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PayrollPage() {
  return (
    <PermissionGuard permission="payroll.view">
      <PayrollContent />
    </PermissionGuard>
  );
}