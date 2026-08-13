"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/permission-guard";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Search,
  X,
  Star,
  Phone,
  FileText,
  Truck,
  MoreVertical,
} from "lucide-react";
import {
  fetchSuppliers,
  createSupplier,
  deleteSupplier,
  type Supplier,
  type SupplierPayload,
} from "@/lib/suppliers-api";

function Stars({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-xs text-slate-300">Unrated</span>;
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${n <= rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"}`}
        />
      ))}
    </span>
  );
}

function SuppliersContent() {
  const queryClient = useQueryClient();
  const { can } = useAuth();
  const canManage = can("purchases.create");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [menuId, setMenuId] = useState<number | null>(null);

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ["suppliers-full", search],
    queryFn: () => fetchSuppliers({ search: search || undefined }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suppliers-full"] }),
  });

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* header — lighter, more editorial */}
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-[#1a1d23]">Suppliers</h1>
                <p className="text-[13px] text-slate-400">
                  {suppliers?.length ?? 0} vendors in your network
                </p>
              </div>
            </div>
            {canManage && (
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2e37]"
              >
                <Plus className="h-4 w-4" />
                New Supplier
              </button>
            )}
          </div>

          <div className="relative mt-5 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search suppliers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
          </div>
        ) : suppliers?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
              <Truck className="h-7 w-7" />
            </div>
            <p className="text-sm font-medium text-slate-500">No suppliers yet</p>
            <p className="mt-1 text-xs text-slate-400">Add your first vendor to start tracking.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {suppliers?.map((s) => (
              <Link
                key={s.id}
                href={`/suppliers/${s.id}`}
                className="group relative rounded-2xl border border-slate-200/70 bg-white p-5 transition hover:border-slate-300 hover:shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {/* monogram avatar */}
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-semibold text-slate-600">
                      {s.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold leading-tight text-[#1a1d23] group-hover:text-amber-700">
                        {s.name}
                      </p>
                      {s.category && (
                        <span className="mt-1 inline-block text-xs text-slate-400">{s.category}</span>
                      )}
                    </div>
                  </div>

                  {!s.is_active && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-400">
                      Inactive
                    </span>
                  )}
                </div>

                {/* rating + meta row */}
                <div className="mt-4 flex items-center justify-between">
                  <Stars rating={s.rating} />
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    {s.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {s.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {s.purchase_orders_count ?? 0} orders
                    </span>
                  </div>
                </div>

                {canManage && (
                  <div className="absolute right-3 top-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setMenuId(menuId === s.id ? null : s.id);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 opacity-0 transition hover:bg-slate-100 hover:text-slate-500 group-hover:opacity-100"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {menuId === s.id && (
                      <div
                        className="absolute right-0 top-8 z-10 w-32 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                        onClick={(e) => e.preventDefault()}
                      >
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setMenuId(null);
                            if (confirm(`Delete ${s.name}?`)) deleteMut.mutate(s.id);
                          }}
                          className="w-full px-3 py-1.5 text-left text-xs text-red-600 transition hover:bg-red-50"
                        >
                          Delete supplier
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <SupplierModal
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["suppliers-full"] });
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}

function SupplierModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<SupplierPayload>({ name: "", is_active: true, rating: null });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () => createSupplier(form),
    onSuccess: onSaved,
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message ?? "Failed to create supplier.");
    },
  });

  const set = <K extends keyof SupplierPayload>(k: K, v: SupplierPayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1a1d23]">New Supplier</h2>
          <button onClick={onClose} className="text-slate-300 transition hover:text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-3.5">
          {error && (
            <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</div>
          )}

          <Field label="Company name" value={form.name} onChange={(v) => set("name", v)} placeholder="Himalayan Cement Suppliers" />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category" value={form.category ?? ""} onChange={(v) => set("category", v)} placeholder="Cement" />
            <Field label="Phone" value={form.phone ?? ""} onChange={(v) => set("phone", v)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="PAN / VAT" value={form.pan_vat_no ?? ""} onChange={(v) => set("pan_vat_no", v)} />
            <Field label="Payment terms" value={form.payment_terms ?? ""} onChange={(v) => set("payment_terms", v)} placeholder="Net 30" />
          </div>

          {/* rating picker */}
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set("rating", n)}
                  className="transition hover:scale-110"
                >
                  <Star
                    className={`h-6 w-6 ${
                      form.rating && n <= form.rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-slate-100 text-slate-200"
                    }`}
                  />
                </button>
              ))}
              {form.rating && (
                <button
                  type="button"
                  onClick={() => set("rating", null)}
                  className="ml-2 text-xs text-slate-400 hover:text-slate-600"
                >
                  clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={() => form.name && mutation.mutate()}
            disabled={mutation.isPending}
            className="rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2e37] disabled:opacity-50"
          >
            {mutation.isPending ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-slate-600">{label}</label>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
      />
    </div>
  );
}

export default function SuppliersPage() {
  return (
    <PermissionGuard permission="purchases.view">
      <SuppliersContent />
    </PermissionGuard>
  );
}