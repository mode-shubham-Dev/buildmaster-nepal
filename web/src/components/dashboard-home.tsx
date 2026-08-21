"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Plane, Wallet, Receipt, FileWarning, ShoppingCart, ArrowRight,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { fetchDashboardSummary } from "@/lib/dashboard-api";
import type { ActionItem } from "@/lib/notifications-api";

function money(v: number): string {
  if (Math.abs(v) >= 10000000) return `Rs. ${(v / 10000000).toFixed(2)} Cr`;
  if (Math.abs(v) >= 100000) return `Rs. ${(v / 100000).toFixed(2)} L`;
  if (Math.abs(v) >= 1000) return `Rs. ${(v / 1000).toFixed(0)}k`;
  return `Rs. ${v.toLocaleString()}`;
}

const ACTION_ICON: Record<string, React.ReactNode> = {
  plane: <Plane className="h-4 w-4" />,
  wallet: <Wallet className="h-4 w-4" />,
  receipt: <Receipt className="h-4 w-4" />,
  "file-warning": <FileWarning className="h-4 w-4" />,
  "shopping-cart": <ShoppingCart className="h-4 w-4" />,
};

export function DashboardHome() {
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({ queryKey: ["dashboard-summary"], queryFn: fetchDashboardSummary });

  if (isLoading) {
    return (
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[88px] animate-pulse rounded-lg border border-slate-200 bg-white" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-8 rounded-lg border border-red-200 bg-red-50 px-5 py-6 text-center text-sm text-red-600">
        Failed to load dashboard summary. Please refresh and try again.
      </div>
    );
  }

  if (!data) return null;

  const { kpis, actions, profitability } = data;
  const hasKpis = !!kpis;
  const hasActions = actions.length > 0;

  if (!hasKpis && !hasActions) return null;

  return (
    <div className="mt-8 space-y-6">
      {/* KPI STRIP — only if they can see reports */}
      {hasKpis && (
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 lg:grid-cols-4">
          <Metric label="Total Billed" value={money(kpis.total_billed)} />
          <Metric
            label="Collected"
            value={money(kpis.total_collected)}
            note={kpis.outstanding > 0 ? `${money(kpis.outstanding)} outstanding` : "Fully collected"}
            noteTone={kpis.outstanding > 0 ? "amber" : "green"}
          />
          <Metric label="Total Spend" value={money(kpis.total_spend)} note="Purchases + expenses" />
          <Metric label="Active Projects" value={String(kpis.active_projects)} />
        </div>
      )}

      {/* TWO-COLUMN: attention + profitability */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Needs attention */}
        {hasActions && (
          <div className={`rounded-lg border border-slate-200 bg-white ${hasKpis && profitability?.length ? "lg:col-span-1" : "lg:col-span-3"}`}>
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-800">Needs your attention</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {actions.map((a) => (
                <ActionRow key={a.key} action={a} onClick={() => router.push(a.link)} />
              ))}
            </div>
          </div>
        )}

        {/* Project margins — compact table, only if reports visible */}
        {hasKpis && profitability && profitability.length > 0 && (
          <div className={`rounded-lg border border-slate-200 bg-white ${hasActions ? "lg:col-span-2" : "lg:col-span-3"}`}>
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-800">Project Margins</h2>
              <button onClick={() => router.push("/reports")} className="flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-slate-600">
                Full report <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-2">Project</th>
                  <th className="px-4 py-2 text-right">Billed</th>
                  <th className="px-4 py-2 text-right">Cost</th>
                  <th className="px-4 py-2 text-right">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profitability.slice(0, 5).map((p) => (
                  <tr key={p.id} className="transition hover:bg-slate-50/50">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-slate-700">{p.name}</p>
                      <p className="text-[11px] text-slate-400">{p.project_code}</p>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">{money(p.billed)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-500">{money(p.total_cost)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`inline-flex items-center gap-0.5 font-medium tabular-nums ${p.margin >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {p.margin >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {money(p.margin)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, note, noteTone }: { label: string; value: string; note?: string; noteTone?: "amber" | "green" }) {
  return (
    <div className="bg-white px-4 py-3.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900">{value}</p>
      {note && (
        <p className={`mt-0.5 text-[11px] ${noteTone === "amber" ? "text-amber-600" : noteTone === "green" ? "text-green-600" : "text-slate-400"}`}>
          {note}
        </p>
      )}
    </div>
  );
}

function ActionRow({ action, onClick }: { action: ActionItem; onClick: () => void }) {
  const warning = action.tone === "warning";
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50">
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${warning ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"}`}>
        {ACTION_ICON[action.icon] ?? <Receipt className="h-4 w-4" />}
      </span>
      <span className="flex-1 text-sm text-slate-600">{action.label}</span>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
    </button>
  );
}