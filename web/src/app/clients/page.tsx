"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/permission-guard";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  Handshake,
  ArrowLeft,
  Plus,
  Search,
  X,
  Trash2,
  Phone,
  Mail,
  ChevronRight,
  Building2,
  User,
} from "lucide-react";
import {
  fetchClients,
  createClient,
  deleteClient,
  type Client,
} from "@/lib/clients-api";

function ClientsContent() {
  const queryClient = useQueryClient();
  const { can } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const { data: clients, isLoading, isError } = useQuery({
    queryKey: ["clients", search, status],
    queryFn: () =>
      fetchClients({
        search: search || undefined,
        status: status || undefined,
      }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });

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
                <Handshake className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="text-base font-semibold tracking-tight text-[#1a1d23]">
                  Clients
                </h1>
                <p className="text-xs text-slate-500">
                  Manage your clients and contracts
                </p>
              </div>
            </div>
          </div>

          {can("clients.create") && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-md bg-amber-500 px-3.5 py-2 text-sm font-semibold text-[#1a1d23] shadow-sm transition hover:bg-amber-400"
            >
              <Plus className="h-4 w-4" />
              Add Client
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* filters */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search by name, email, or phone..."
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
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-10 text-center text-sm text-red-600">
            Failed to load clients. Please refresh and try again.
          </div>
        ) : clients?.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Handshake className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate-500">No clients found.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Contracts</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients?.map((c) => (
                  <tr key={c.id} className="transition hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <Link href={`/clients/${c.id}`} className="flex items-center gap-3 group">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          {c.type === "company" ? (
                            <Building2 className="h-4 w-4" />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </span>
                        <div>
                          <p className="font-medium text-slate-900 group-hover:text-amber-600">
                            {c.name}
                          </p>
                          <p className="text-xs capitalize text-slate-500">{c.type}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5 text-slate-600">
                        {c.phone && (
                          <p className="flex items-center gap-1 text-xs">
                            <Phone className="h-3 w-3" />
                            {c.phone}
                          </p>
                        )}
                        {c.email && (
                          <p className="flex items-center gap-1 text-xs">
                            <Mail className="h-3 w-3" />
                            {c.email}
                          </p>
                        )}
                        {!c.phone && !c.email && "—"}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {c.contracts_count ?? 0}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                          c.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/clients/${c.id}`}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          View
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                        {can("clients.delete") && (
                          <button
                            onClick={() => {
                              if (confirm(`Delete ${c.name}?`)) deleteMut.mutate(c.id);
                            }}
                            className="inline-flex items-center rounded-md border border-slate-200 p-1.5 text-red-600 transition hover:border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showCreate && (
        <CreateClientModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}

function CreateClientModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<Partial<Client>>({
    type: "company",
    status: "active",
  });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: createClient,
    onSuccess: onCreated,
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message ?? "Failed to create client.");
    },
  });

  const set = (key: keyof Client, v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    mutation.mutate(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-[#1a1d23]">Add New Client</h2>
          <button onClick={onClose} className="text-slate-400 transition hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <ModalField label="Client Name *" value={form.name ?? ""} onChange={(v) => set("name", v)} placeholder="Nepal Infrastructure Ltd." />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Type</label>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="company">Company</option>
                <option value="individual">Individual</option>
              </select>
            </div>
            <ModalField label="Email" value={form.email ?? ""} onChange={(v) => set("email", v)} type="email" />
            <ModalField label="Phone" value={form.phone ?? ""} onChange={(v) => set("phone", v)} />
            <ModalField label="PAN / VAT No." value={form.pan_vat_no ?? ""} onChange={(v) => set("pan_vat_no", v)} />
            <ModalField label="Website" value={form.website ?? ""} onChange={(v) => set("website", v)} />
            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Address</label>
              <textarea
                value={form.address ?? ""}
                onChange={(e) => set("address", e.target.value)}
                rows={2}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
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
              {mutation.isPending ? "Creating..." : "Create Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalField({
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

export default function ClientsPage() {
  return (
    <PermissionGuard permission="clients.view">
      <ClientsContent />
    </PermissionGuard>
  );
}