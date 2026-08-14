"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/permission-guard";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Plus,
  X,
  Trash2,
  Wallet,
  Building2,
  TrendingUp,
  Receipt,
  ChevronDown,
} from "lucide-react";
import {
  fetchSubcontractorProfile,
  createWorkPackage,
  deleteWorkPackage,
  payWorkPackage,
  deleteSubPayment,
  type WorkPackage,
  type WorkPackageStatus,
  type WorkPackagePayload,
  type PaymentPayload,
} from "@/lib/subcontractors-api";
import { fetchProjects } from "@/lib/projects-api";

function money(v: string | number): string {
  return `Rs. ${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

const WP_STATUS: Record<WorkPackageStatus, { label: string; color: string }> = {
  assigned: { label: "Assigned", color: "bg-slate-100 text-slate-600" },
  in_progress: { label: "In Progress", color: "bg-blue-50 text-blue-600" },
  completed: { label: "Completed", color: "bg-green-50 text-green-600" },
  terminated: { label: "Terminated", color: "bg-red-50 text-red-600" },
};

function ProfileContent() {
  const params = useParams();
  const id = Number(params.id);
  const { can } = useAuth();
  const canManage = can("subcontractors.manage");
  const canPay = can("subcontractors.pay");
  const [showAssign, setShowAssign] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["subcontractor-profile", id],
    queryFn: () => fetchSubcontractorProfile(id),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafaf9]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafaf9]">
        <p className="text-sm text-slate-400">Subcontractor not found.</p>
      </div>
    );
  }

  const { subcontractor, stats } = data;
  const packages = subcontractor.workPackages ?? subcontractor.work_packages ?? [];

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <Link href="/subcontractors" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-slate-600">
            <ArrowLeft className="h-4 w-4" />
            Subcontractors
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* identity */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-xl font-semibold text-slate-600">
            {subcontractor.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[#1a1d23]">{subcontractor.name}</h1>
            <div className="mt-1 flex items-center gap-3">
              {subcontractor.specialty && <span className="text-sm text-slate-400">{subcontractor.specialty}</span>}
              <span className="inline-flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={`h-3.5 w-3.5 ${subcontractor.rating && n <= subcontractor.rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"}`} />
                ))}
              </span>
            </div>
          </div>
        </div>

        {/* stat band — contract / paid / outstanding */}
        <div className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-200/70">
          <Stat icon={<Building2 className="h-4 w-4" />} label="Total Contract" value={money(stats.total_contract)} />
          <Stat icon={<TrendingUp className="h-4 w-4" />} label="Paid" value={money(stats.total_paid)} />
          <Stat icon={<Wallet className="h-4 w-4" />} label="Outstanding" value={money(stats.total_outstanding)} accent />
        </div>

        {/* work packages */}
        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#1a1d23]">Work Packages</h2>
          {canManage && (
            <button onClick={() => setShowAssign(true)} className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#1a1d23]">
              <Plus className="h-4 w-4" />
              Assign work
            </button>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {packages.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No work packages assigned yet.</p>
          ) : (
            packages.map((wp) => (
              <WorkPackageCard key={wp.id} wp={wp} subId={id} canManage={canManage} canPay={canPay} />
            ))
          )}
        </div>
      </div>

      {showAssign && (
        <AssignModal
          subId={id}
          onClose={() => setShowAssign(false)}
          onSaved={() => setShowAssign(false)}
        />
      )}
    </div>
  );
}

function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-white px-5 py-4">
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
        <span className="text-slate-300">{icon}</span>
        {label}
      </p>
      <p className={`mt-1 text-lg font-semibold ${accent ? "text-amber-600" : "text-[#1a1d23]"}`}>{value}</p>
    </div>
  );
}

function WorkPackageCard({ wp, subId, canManage, canPay }: { wp: WorkPackage; subId: number; canManage: boolean; canPay: boolean }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const meta = WP_STATUS[wp.status];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["subcontractor-profile", subId] });

  const delMut = useMutation({ mutationFn: () => deleteWorkPackage(wp.id), onSuccess: invalidate });
  const delPayMut = useMutation({ mutationFn: deleteSubPayment, onSuccess: invalidate });

  const paidPct = Number(wp.contract_amount) > 0
    ? Math.round((wp.total_paid / Number(wp.contract_amount)) * 100)
    : 0;

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">{wp.title}</h3>
            <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${meta.color}`}>{meta.label}</span>
          </div>
          {wp.project && <p className="mt-0.5 text-xs text-slate-400">{wp.project.name} · {wp.project.project_code}</p>}
        </div>
        {canManage && (
          <button onClick={() => confirm(`Delete "${wp.title}"?`) && delMut.mutate()} className="text-slate-300 transition hover:text-red-500">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* payment progress */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-slate-400">{money(wp.total_paid)} paid of {money(wp.contract_amount)}</span>
          <span className="font-semibold text-slate-600">{paidPct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${paidPct}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm">
            <span className="text-slate-400">Balance: </span>
            <span className="font-semibold text-[#1a1d23]">{money(wp.balance)}</span>
          </span>
          <div className="flex items-center gap-2">
            {(wp.payments?.length ?? 0) > 0 && (
              <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600">
                {wp.payments?.length} payments
                <ChevronDown className={`h-3.5 w-3.5 transition ${expanded ? "rotate-180" : ""}`} />
              </button>
            )}
            {canPay && wp.balance > 0 && (
              <button onClick={() => setShowPay(true)} className="rounded-lg bg-[#1a1d23] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#2a2e37]">
                Record Payment
              </button>
            )}
          </div>
        </div>
      </div>

      {/* payment history */}
      {expanded && (wp.payments?.length ?? 0) > 0 && (
        <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
          {wp.payments?.map((p) => (
            <div key={p.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Receipt className="h-3.5 w-3.5 text-slate-300" />
                <span className="text-slate-600">{money(p.amount)}</span>
                <span className="text-xs text-slate-400">{p.payment_date.split("T")[0]} · {p.method.replace("_", " ")}</span>
              </div>
              {canPay && (
                <button onClick={() => delPayMut.mutate(p.id)} className="text-slate-300 transition hover:text-red-500">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showPay && (
        <PaymentModal wp={wp} onClose={() => setShowPay(false)} onSaved={() => { invalidate(); setShowPay(false); }} />
      )}
    </div>
  );
}

function PaymentModal({ wp, onClose, onSaved }: { wp: WorkPackage; onClose: () => void; onSaved: () => void }) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [method, setMethod] = useState<PaymentPayload["method"]>("bank_transfer");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () => payWorkPackage(wp.id, { amount: Number(amount), payment_date: date, method, reference: reference || undefined }),
    onSuccess: onSaved,
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { message?: string; errors?: { amount?: string[] } } } };
      setError(apiError.response?.data?.errors?.amount?.[0] ?? apiError.response?.data?.message ?? "Failed to record payment.");
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1a1d23]">Record Payment</h2>
          <button onClick={onClose} className="text-slate-300 transition hover:text-slate-500"><X className="h-5 w-5" /></button>
        </div>
        <p className="mt-1 text-xs text-slate-400">Balance remaining: {money(wp.balance)}</p>

        <div className="mt-4 space-y-3">
          {error && <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</div>}

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Amount</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Max ${wp.balance}`} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Method</label>
              <select value={method} onChange={(e) => setMethod(e.target.value as PaymentPayload["method"])} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white">
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="cash">Cash</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Reference</label>
            <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Txn / cheque no." className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100">Cancel</button>
          <button onClick={() => amount && mutation.mutate()} disabled={mutation.isPending} className="rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2e37] disabled:opacity-50">
            {mutation.isPending ? "Saving..." : "Record"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AssignModal({ subId, onClose, onSaved }: { subId: number; onClose: () => void; onSaved: () => void }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [contractAmount, setContractAmount] = useState("");
  const [scope, setScope] = useState("");
  const [error, setError] = useState("");

  const { data: projects } = useQuery({ queryKey: ["projects"], queryFn: () => fetchProjects() });

  const mutation = useMutation({
    mutationFn: (payload: WorkPackagePayload) => createWorkPackage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcontractor-profile", subId] });
      onSaved();
    },
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message ?? "Failed to assign work.");
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1a1d23]">Assign Work Package</h2>
          <button onClick={onClose} className="text-slate-300 transition hover:text-slate-500"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-4 space-y-3">
          {error && <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</div>}

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Electrical wiring - Block A" className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Project</label>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white">
                <option value="">Select</option>
                {projects?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Contract Amount</label>
              <input type="number" value={contractAmount} onChange={(e) => setContractAmount(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Scope</label>
            <textarea value={scope} onChange={(e) => setScope(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100">Cancel</button>
          <button
            onClick={() => title && projectId && contractAmount && mutation.mutate({
              subcontractor_id: subId,
              project_id: Number(projectId),
              title,
              scope: scope || undefined,
              contract_amount: Number(contractAmount),
              status: "assigned",
            })}
            disabled={mutation.isPending}
            className="rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2e37] disabled:opacity-50"
          >
            {mutation.isPending ? "Assigning..." : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SubcontractorProfilePage() {
  return (
    <PermissionGuard permission="subcontractors.view">
      <ProfileContent />
    </PermissionGuard>
  );
}