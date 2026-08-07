"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/permission-guard";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  Plus,
  Search,
  X,
  Trash2,
  Pencil,
  Trophy,
  TrendingUp,
  Wallet,
  Calendar,
  Building,
} from "lucide-react";
import {
  fetchTenders,
  createTender,
  updateTender,
  deleteTender,
  type Tender,
  type TenderStatus,
} from "@/lib/tenders-api";

const STATUS_META: Record<TenderStatus, { label: string; color: string; dot: string }> = {
  identified: { label: "Identified", color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
  preparing: { label: "Preparing", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  submitted: { label: "Submitted", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  won: { label: "Won", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  lost: { label: "Lost", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
  cancelled: { label: "Cancelled", color: "bg-slate-100 text-slate-500", dot: "bg-slate-300" },
};

const STATUS_ORDER: TenderStatus[] = ["identified", "preparing", "submitted", "won", "lost", "cancelled"];

function money(v: string | null): string {
  if (!v) return "—";
  return `Rs. ${Number(v).toLocaleString()}`;
}

function TendersContent() {
  const queryClient = useQueryClient();
  const { can } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [modal, setModal] = useState<{ open: boolean; tender: Tender | null }>({ open: false, tender: null });

  const { data: tenders, isLoading } = useQuery({
    queryKey: ["tenders", search, status],
    queryFn: () => fetchTenders({ search: search || undefined, status: status || undefined }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteTender,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tenders"] }),
  });

  // stat cards (computed from the full unfiltered set when no filters, else from current)
  const stats = useMemo(() => {
    const list = tenders ?? [];
    const won = list.filter((t) => t.status === "won").length;
    const decided = list.filter((t) => t.status === "won" || t.status === "lost").length;
    const active = list.filter((t) => ["identified", "preparing", "submitted"].includes(t.status)).length;
    const totalBid = list.reduce((sum, t) => sum + (t.bid_amount ? Number(t.bid_amount) : 0), 0);
    const winRate = decided > 0 ? Math.round((won / decided) * 100) : 0;
    return { won, active, totalBid, winRate };
  }, [tenders]);

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
                <FileText className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="text-base font-semibold tracking-tight text-[#1a1d23]">
                  Tenders & Bids
                </h1>
                <p className="text-xs text-slate-500">Track opportunities from bid to award</p>
              </div>
            </div>
          </div>

          {can("tenders.create") && (
            <button
              onClick={() => setModal({ open: true, tender: null })}
              className="flex items-center gap-2 rounded-md bg-amber-500 px-3.5 py-2 text-sm font-semibold text-[#1a1d23] shadow-sm transition hover:bg-amber-400"
            >
              <Plus className="h-4 w-4" />
              New Tender
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* stat cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Active Bids" value={String(stats.active)} />
          <StatCard icon={<Trophy className="h-5 w-5" />} label="Won" value={String(stats.won)} />
          <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Win Rate" value={`${stats.winRate}%`} />
          <StatCard icon={<Wallet className="h-5 w-5" />} label="Total Bid Value" value={money(String(stats.totalBid))} />
        </div>

        {/* filters */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search by title, reference, or authority..."
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
            <option value="">All stages</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
          </div>
        ) : tenders?.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FileText className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate-500">No tenders found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tenders?.map((t) => (
              <TenderCard
                key={t.id}
                tender={t}
                canManage={can("tenders.update")}
                canDelete={can("tenders.delete")}
                onEdit={() => setModal({ open: true, tender: t })}
                onDelete={() => {
                  if (confirm(`Delete "${t.title}"?`)) deleteMut.mutate(t.id);
                }}
              />
            ))}
          </div>
        )}
      </main>

      {modal.open && (
        <TenderModal
          tender={modal.tender}
          onClose={() => setModal({ open: false, tender: null })}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["tenders"] });
            setModal({ open: false, tender: null });
          }}
        />
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
          <p className="text-lg font-bold text-[#1a1d23]">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TenderCard({
  tender,
  canManage,
  canDelete,
  onEdit,
  onDelete,
}: {
  tender: Tender;
  canManage: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const meta = STATUS_META[tender.status];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2.5">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.color}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
              {meta.label}
            </span>
            {tender.reference_no && (
              <span className="text-xs text-slate-400">{tender.reference_no}</span>
            )}
          </div>
          <h3 className="mt-2 font-semibold text-slate-900">{tender.title}</h3>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
            {(tender.client?.name || tender.issuing_authority) && (
              <span className="flex items-center gap-1">
                <Building className="h-3.5 w-3.5" />
                {tender.client?.name ?? tender.issuing_authority}
              </span>
            )}
            {tender.submission_deadline && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Due {tender.submission_deadline}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={onDelete}
              className="inline-flex items-center rounded-md border border-slate-200 p-1.5 text-red-600 transition hover:border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
        <MiniStat label="Estimated Value" value={money(tender.estimated_value)} />
        <MiniStat label="Our Bid" value={money(tender.bid_amount)} highlight />
        <MiniStat label="Bid Security" value={money(tender.bid_security)} />
      </div>
    </div>
  );
}

function MiniStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? "text-amber-600" : "text-slate-700"}`}>{value}</p>
    </div>
  );
}

function TenderModal({
  tender,
  onClose,
  onSaved,
}: {
  tender: Tender | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!tender;
  const [form, setForm] = useState<Partial<Tender>>(
    tender ?? { status: "identified" }
  );
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: (payload: Partial<Tender>) =>
      isEdit ? updateTender(tender!.id, payload) : createTender(payload),
    onSuccess: onSaved,
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message ?? "Failed to save tender.");
    },
  });

  const set = (key: keyof Tender, v: string) => setForm((f) => ({ ...f, [key]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    mutation.mutate(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-[#1a1d23]">
            {isEdit ? "Edit Tender" : "New Tender"}
          </h2>
          <button onClick={onClose} className="text-slate-400 transition hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[75vh] space-y-4 overflow-y-auto px-6 py-5">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <Field label="Tender Title *" value={form.title ?? ""} onChange={(v) => set("title", v)} placeholder="Construction of..." />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Reference No." value={form.reference_no ?? ""} onChange={(v) => set("reference_no", v)} placeholder="DOR/2081/T-045" />
            <Field label="Issuing Authority" value={form.issuing_authority ?? ""} onChange={(v) => set("issuing_authority", v)} placeholder="Department of Roads" />
            <Field label="Estimated Value (Rs.)" type="number" value={form.estimated_value ?? ""} onChange={(v) => set("estimated_value", v)} />
            <Field label="Our Bid Amount (Rs.)" type="number" value={form.bid_amount ?? ""} onChange={(v) => set("bid_amount", v)} />
            <Field label="Bid Security (Rs.)" type="number" value={form.bid_security ?? ""} onChange={(v) => set("bid_security", v)} />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </select>
            </div>

            <Field label="Published Date" type="date" value={form.published_date ?? ""} onChange={(v) => set("published_date", v)} />
            <Field label="Submission Deadline" type="date" value={form.submission_deadline ?? ""} onChange={(v) => set("submission_deadline", v)} />
            <Field label="Submitted Date" type="date" value={form.submitted_date ?? ""} onChange={(v) => set("submitted_date", v)} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Scope</label>
            <textarea
              value={form.scope ?? ""}
              onChange={(e) => set("scope", e.target.value)}
              rows={2}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-[#1a1d23] transition hover:bg-amber-400 disabled:opacity-60"
            >
              {mutation.isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Tender"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
      />
    </div>
  );
}

export default function TendersPage() {
  return (
    <PermissionGuard permission="tenders.view">
      <TendersContent />
    </PermissionGuard>
  );
}