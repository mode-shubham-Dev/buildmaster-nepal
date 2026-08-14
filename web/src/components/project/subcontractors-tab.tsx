"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { HardHat, ExternalLink } from "lucide-react";
import { fetchProjectWorkPackages, type WorkPackageStatus } from "@/lib/subcontractors-api";

function money(v: string | number): string {
  return `Rs. ${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

const WP_STATUS: Record<WorkPackageStatus, { label: string; color: string }> = {
  assigned: { label: "Assigned", color: "bg-slate-100 text-slate-600" },
  in_progress: { label: "In Progress", color: "bg-blue-50 text-blue-600" },
  completed: { label: "Completed", color: "bg-green-50 text-green-600" },
  terminated: { label: "Terminated", color: "bg-red-50 text-red-600" },
};

export function SubcontractorsTab({ projectId }: { projectId: number }) {
  const { data: packages, isLoading } = useQuery({
    queryKey: ["project-work-packages", projectId],
    queryFn: () => fetchProjectWorkPackages(projectId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
      </div>
    );
  }

  if ((packages?.length ?? 0) === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
        No subcontractor work packages on this project yet.
        <p className="mt-1 text-xs text-slate-400">
          Assign work from a subcontractor&apos;s profile.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {packages?.map((wp) => {
        const meta = WP_STATUS[wp.status];
        const paidPct = Number(wp.contract_amount) > 0
          ? Math.round((wp.total_paid / Number(wp.contract_amount)) * 100)
          : 0;
        return (
          <div key={wp.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{wp.title}</h3>
                  <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${meta.color}`}>{meta.label}</span>
                </div>
                {wp.subcontractor && (
                  <Link
                    href={`/subcontractors/${wp.subcontractor.id}`}
                    className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-400 transition hover:text-amber-600"
                  >
                    <HardHat className="h-3 w-3" />
                    {wp.subcontractor.name}
                    {wp.subcontractor.specialty && ` · ${wp.subcontractor.specialty}`}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
              <span className="text-sm font-semibold text-slate-900">{money(wp.contract_amount)}</span>
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-slate-400">{money(wp.total_paid)} paid</span>
                <span className="font-semibold text-slate-600">{paidPct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${paidPct}%` }} />
              </div>
              <p className="mt-2 text-sm">
                <span className="text-slate-400">Balance: </span>
                <span className="font-semibold text-[#1a1d23]">{money(wp.balance)}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}