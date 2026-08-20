"use client";

import { useQuery } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/permission-guard";
import Link from "next/link";
import {
  ArrowLeft, TrendingUp, TrendingDown, Receipt,
  Layers, AlertCircle, ArrowDownRight, ArrowUpRight,
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Legend,
} from "recharts";
import { fetchReportOverview } from "@/lib/reports-api";

function money(v: number, compact = false): string {
  if (compact && Math.abs(v) >= 100000) return `Rs. ${(v / 100000).toFixed(1)}L`;
  if (compact && Math.abs(v) >= 1000) return `Rs. ${(v / 1000).toFixed(0)}k`;
  return `Rs. ${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

const DONUT_COLORS = ["#f59e0b", "#3b82f6", "#8b5cf6", "#ef4444", "#10b981", "#64748b", "#ec4899"];

function ReportsContent() {
  const { data, isLoading } = useQuery({ queryKey: ["report-overview"], queryFn: fetchReportOverview });

  if (isLoading || !data) {
    return <div className="flex min-h-screen items-center justify-center bg-[#fafaf9]"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" /></div>;
  }

  const { kpis, profitability, expense_breakdown, billing_collection, payroll_summary } = data;

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-[#1a1d23]">Reports &amp; Analytics</h1>
              <p className="text-[13px] text-slate-400">Company financial overview</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        {/* KPI ROW */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Kpi label="Total Billed" value={money(kpis.total_billed, true)} icon={<Receipt className="h-4 w-4" />} tone="dark" />
          <Kpi label="Collected" value={money(kpis.total_collected, true)} icon={<TrendingUp className="h-4 w-4" />} tone="green" sub={`${kpis.outstanding > 0 ? money(kpis.outstanding, true) + " outstanding" : "Fully collected"}`} />
          <Kpi label="Total Spend" value={money(kpis.total_spend, true)} icon={<TrendingDown className="h-4 w-4" />} tone="default" sub={`Purchases + expenses`} />
          <Kpi label="Active Projects" value={String(kpis.active_projects)} icon={<Layers className="h-4 w-4" />} tone="default" />
        </div>

        {/* pending actions strip */}
        {(kpis.pending_bills > 0 || kpis.pending_expenses > 0) && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3 text-sm text-amber-800">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Needs attention:</span>
            {kpis.pending_bills > 0 && <span>{kpis.pending_bills} bill{kpis.pending_bills > 1 ? "s" : ""} to approve</span>}
            {kpis.pending_bills > 0 && kpis.pending_expenses > 0 && <span className="text-amber-300">·</span>}
            {kpis.pending_expenses > 0 && <span>{kpis.pending_expenses} expense{kpis.pending_expenses > 1 ? "s" : ""} to review</span>}
          </div>
        )}

        {/* PROFITABILITY + EXPENSE DONUT */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* profitability bar — spans 3 */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-200/70 bg-white p-6">
            <h2 className="text-sm font-semibold text-[#1a1d23]">Project Profitability</h2>
            <p className="mb-4 text-xs text-slate-400">Billed vs cost per project</p>
            {profitability.length === 0 ? (
              <Empty label="No project data" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={profitability} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="project_code" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 100000).toFixed(0)}L`} />
                  <Tooltip
                    formatter={(v) => money(v as number)}
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="billed" name="Billed" fill="#1a1d23" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="total_cost" name="Cost" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* expense donut — spans 2 */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200/70 bg-white p-6">
            <h2 className="text-sm font-semibold text-[#1a1d23]">Expense Breakdown</h2>
            <p className="mb-4 text-xs text-slate-400">By category</p>
            {expense_breakdown.length === 0 ? (
              <Empty label="No expenses yet" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={expense_breakdown.map((e, i) => ({ ...e, fill: DONUT_COLORS[i % DONUT_COLORS.length] }))}
                      dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}
                    />
                    <Tooltip formatter={(v) => money(v as number)} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1.5">
                  {expense_breakdown.map((e, i) => (
                    <div key={e.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-slate-500">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                        {e.name}
                      </span>
                      <span className="font-medium tabular-nums text-slate-700">{money(e.total)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* PROFITABILITY TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-[#1a1d23]">Project Margins</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  <th className="px-6 py-3">Project</th>
                  <th className="px-4 py-3 text-right">Contract</th>
                  <th className="px-4 py-3 text-right">Billed</th>
                  <th className="px-4 py-3 text-right">Cost</th>
                  <th className="px-6 py-3 text-right">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profitability.map((p) => (
                  <tr key={p.id} className="transition hover:bg-slate-50/50">
                    <td className="px-6 py-3.5">
                      <p className="font-medium text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.project_code}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-slate-500">{money(p.contract_value, true)}</td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-slate-700">{money(p.billed, true)}</td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-amber-600">{money(p.total_cost, true)}</td>
                    <td className="px-6 py-3.5 text-right">
                      <span className={`inline-flex items-center gap-1 font-semibold tabular-nums ${p.margin >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {p.margin >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                        {money(p.margin, true)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BILLING + PAYROLL side by side */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* billing vs collection */}
          <div className="rounded-2xl border border-slate-200/70 bg-white p-6">
            <h2 className="text-sm font-semibold text-[#1a1d23]">Billing &amp; Collection</h2>
            <p className="mb-4 text-xs text-slate-400">Recent RA bills</p>
            {billing_collection.length === 0 ? (
              <Empty label="No bills yet" />
            ) : (
              <div className="space-y-3">
                {billing_collection.map((b) => {
                  const pct = b.net_payable > 0 ? (b.collected / b.net_payable) * 100 : 0;
                  return (
                    <div key={b.id}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-600">{b.label}</span>
                        <span className="tabular-nums text-slate-400">{money(b.collected, true)} / {money(b.net_payable, true)}</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${pct >= 100 ? "bg-green-500" : "bg-amber-500"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* payroll summary */}
          <div className="rounded-2xl border border-slate-200/70 bg-white p-6">
            <h2 className="text-sm font-semibold text-[#1a1d23]">Payroll Summary</h2>
            <p className="mb-4 text-xs text-slate-400">Recent runs</p>
            {payroll_summary.length === 0 ? (
              <Empty label="No payroll runs" />
            ) : (
              <div className="space-y-2.5">
                {payroll_summary.map((run) => (
                  <div key={run.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-800">{run.title}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${run.status === "finalized" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>{run.status}</span>
                      </div>
                      <p className="text-xs text-slate-400">{run.headcount} employees</p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums text-[#1a1d23]">{money(run.total_net, true)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Kpi({ label, value, icon, tone, sub }: { label: string; value: string; icon: React.ReactNode; tone: "dark" | "green" | "default"; sub?: string }) {
  const toneCls =
    tone === "dark" ? "bg-[#1a1d23] text-white" :
    tone === "green" ? "bg-white border border-slate-200/70" :
    "bg-white border border-slate-200/70";
  const iconCls =
    tone === "dark" ? "bg-white/10 text-white" :
    tone === "green" ? "bg-green-50 text-green-600" :
    "bg-slate-100 text-slate-500";
  const labelCls = tone === "dark" ? "text-white/60" : "text-slate-400";
  const valueCls = tone === "dark" ? "text-white" : "text-[#1a1d23]";

  return (
    <div className={`rounded-2xl p-5 ${toneCls}`}>
      <div className="flex items-center justify-between">
        <p className={`text-xs font-medium uppercase tracking-wide ${labelCls}`}>{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconCls}`}>{icon}</span>
      </div>
      <p className={`mt-2 text-2xl font-semibold tabular-nums ${valueCls}`}>{value}</p>
      {sub && <p className={`mt-0.5 text-xs ${tone === "dark" ? "text-white/50" : "text-slate-400"}`}>{sub}</p>}
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="flex items-center justify-center py-16 text-sm text-slate-400">{label}</div>;
}

export default function ReportsPage() {
  return (
    <PermissionGuard permission="reports.view">
      <ReportsContent />
    </PermissionGuard>
  );
}