"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/permission-guard";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  User,
  Users,
  FileText,
  MessageSquare,
  Plus,
  Trash2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Hash,
  Star,
} from "lucide-react";
import {
  fetchClient,
  addClientContact,
  deleteClientContact,
  addContract,
  deleteContract,
  addCommunication,
  deleteCommunication,
  type Client,
  type ClientContact,
  type Contract,
  type Communication,
} from "@/lib/clients-api";

type Tab = "details" | "contacts" | "contracts" | "communications";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "details", label: "Details", icon: <FileText className="h-4 w-4" /> },
  { id: "contacts", label: "Contacts", icon: <Users className="h-4 w-4" /> },
  { id: "contracts", label: "Contracts", icon: <FileText className="h-4 w-4" /> },
  { id: "communications", label: "Communications", icon: <MessageSquare className="h-4 w-4" /> },
];

function ProfileContent() {
  const params = useParams();
  const id = Number(params.id);
  const [tab, setTab] = useState<Tab>("details");
  const { can } = useAuth();
  const canManage = can("clients.update");

  const { data: client, isLoading } = useQuery({
    queryKey: ["client", id],
    queryFn: () => fetchClient(id),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7f9]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7f9]">
        <p className="text-sm text-slate-500">Client not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <Link
            href="/clients"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="text-sm text-slate-500">Back to Clients</span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* header card */}
        <div className="mb-6 flex items-center gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-amber-500 text-[#1a1d23]">
            {client.type === "company" ? (
              <Building2 className="h-8 w-8" strokeWidth={2} />
            ) : (
              <User className="h-8 w-8" strokeWidth={2} />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight text-[#1a1d23]">
              {client.name}
            </h1>
            <p className="text-sm capitalize text-slate-500">
              {client.type} · {client.pan_vat_no ? `PAN/VAT: ${client.pan_vat_no}` : "No PAN/VAT"}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
              client.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {client.status}
          </span>
        </div>

        {/* tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition ${
                tab === t.id
                  ? "border-amber-500 text-[#1a1d23]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {tab === "details" && <DetailsTab client={client} />}
        {tab === "contacts" && <ContactsTab clientId={id} contacts={client.contacts ?? []} canManage={canManage} />}
        {tab === "contracts" && <ContractsTab clientId={id} contracts={client.contracts ?? []} canManage={canManage} />}
        {tab === "communications" && <CommunicationsTab clientId={id} comms={client.communications ?? []} canManage={canManage} />}
      </div>
    </div>
  );
}

/* ---------- DETAILS ---------- */
function DetailsTab({ client }: { client: Client }) {
  const rows = [
    { icon: <Mail className="h-4 w-4" />, label: "Email", value: client.email },
    { icon: <Phone className="h-4 w-4" />, label: "Phone", value: client.phone },
    { icon: <Hash className="h-4 w-4" />, label: "PAN / VAT No.", value: client.pan_vat_no },
    { icon: <Globe className="h-4 w-4" />, label: "Website", value: client.website },
    { icon: <MapPin className="h-4 w-4" />, label: "Address", value: client.address },
  ];
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-5 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.label} className="flex items-start gap-3">
              <span className="mt-0.5 text-slate-400">{r.icon}</span>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {r.label}
                </dt>
                <dd className="mt-0.5 text-sm text-slate-900">{r.value || "—"}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
      {client.notes && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Notes</h3>
          <p className="text-sm text-slate-700">{client.notes}</p>
        </div>
      )}
    </div>
  );
}

/* ---------- CONTACTS ---------- */
function ContactsTab({ clientId, contacts, canManage }: { clientId: number; contacts: ClientContact[]; canManage: boolean }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const addMut = useMutation({
    mutationFn: () => addClientContact(clientId, { name, designation, phone, email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      setName(""); setDesignation(""); setPhone(""); setEmail("");
    },
  });

  const delMut = useMutation({
    mutationFn: deleteClientContact,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["client", clientId] }),
  });

  return (
    <div className="space-y-5">
      {canManage && (
        <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 min-w-[140px] rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
          <input placeholder="Designation" value={designation} onChange={(e) => setDesignation(e.target.value)} className="w-40 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
          <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-36 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 min-w-[140px] rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
          <button onClick={() => name && addMut.mutate()} disabled={addMut.isPending} className="flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-[#1a1d23] transition hover:bg-amber-400 disabled:opacity-60">
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      )}

      {contacts.length === 0 ? (
        <EmptyState text="No contacts added yet." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {contacts.map((c) => (
            <div key={c.id} className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div>
                <p className="flex items-center gap-1.5 font-medium text-slate-900">
                  {c.name}
                  {c.is_primary && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                </p>
                <p className="text-xs text-slate-500">{c.designation ?? "—"}</p>
                {c.phone && <p className="mt-1 flex items-center gap-1 text-sm text-slate-600"><Phone className="h-3.5 w-3.5" />{c.phone}</p>}
                {c.email && <p className="flex items-center gap-1 text-sm text-slate-600"><Mail className="h-3.5 w-3.5" />{c.email}</p>}
              </div>
              {canManage && (
                <button onClick={() => delMut.mutate(c.id)} className="text-slate-400 transition hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- CONTRACTS ---------- */
function ContractsTab({ clientId, contracts, canManage }: { clientId: number; contracts: Contract[]; canManage: boolean }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("draft");

  const addMut = useMutation({
    mutationFn: () => addContract(clientId, { title, value, status: status as Contract["status"] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      setTitle(""); setValue("");
    },
  });

  const delMut = useMutation({
    mutationFn: deleteContract,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["client", clientId] }),
  });

  const statusColor: Record<string, string> = {
    draft: "bg-slate-100 text-slate-600",
    active: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    terminated: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-5">
      {canManage && (
        <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <input placeholder="Contract title" value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 min-w-[180px] rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
          <input placeholder="Value (Rs.)" type="number" value={value} onChange={(e) => setValue(e.target.value)} className="w-40 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="terminated">Terminated</option>
          </select>
          <button onClick={() => title && addMut.mutate()} disabled={addMut.isPending} className="flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-[#1a1d23] transition hover:bg-amber-400 disabled:opacity-60">
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      )}

      {contracts.length === 0 ? (
        <EmptyState text="No contracts added yet." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Value</th>
                <th className="px-5 py-3">Status</th>
                {canManage && <th className="px-5 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contracts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-900">{c.title}</p>
                    {c.contract_no && <p className="text-xs text-slate-500">{c.contract_no}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {c.value ? `Rs. ${Number(c.value).toLocaleString()}` : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColor[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => delMut.mutate(c.id)} className="inline-flex items-center rounded-md border border-slate-200 p-1.5 text-red-600 transition hover:border-red-200 hover:bg-red-50">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- COMMUNICATIONS ---------- */
function CommunicationsTab({ clientId, comms, canManage }: { clientId: number; comms: Communication[]; canManage: boolean }) {
  const queryClient = useQueryClient();
  const [type, setType] = useState("note");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const addMut = useMutation({
    mutationFn: () => addCommunication(clientId, { type: type as Communication["type"], subject, body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      setSubject(""); setBody("");
    },
  });

  const delMut = useMutation({
    mutationFn: deleteCommunication,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["client", clientId] }),
  });

  const typeColor: Record<string, string> = {
    call: "bg-blue-100 text-blue-700",
    email: "bg-purple-100 text-purple-700",
    meeting: "bg-amber-100 text-amber-700",
    note: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="space-y-5">
      {canManage && (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20">
              <option value="note">Note</option>
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
            </select>
            <input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="flex-1 min-w-[200px] rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
          </div>
          <textarea placeholder="Details (optional)" value={body} onChange={(e) => setBody(e.target.value)} rows={2} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
          <button onClick={() => subject && addMut.mutate()} disabled={addMut.isPending} className="flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-[#1a1d23] transition hover:bg-amber-400 disabled:opacity-60">
            <Plus className="h-4 w-4" />
            Log Communication
          </button>
        </div>
      )}

      {comms.length === 0 ? (
        <EmptyState text="No communications logged yet." />
      ) : (
        <div className="space-y-3">
          {comms.map((c) => (
            <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${typeColor[c.type]}`}>
                    {c.type}
                  </span>
                  <p className="font-medium text-slate-900">{c.subject}</p>
                </div>
                {canManage && (
                  <button onClick={() => delMut.mutate(c.id)} className="text-slate-400 transition hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              {c.body && <p className="mt-2 text-sm text-slate-600">{c.body}</p>}
              <p className="mt-2 text-xs text-slate-400">
                {c.communicated_at ?? ""} {c.user ? `· by ${c.user.name}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- SHARED ---------- */
function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

export default function ClientProfilePage() {
  return (
    <PermissionGuard permission="clients.view">
      <ProfileContent />
    </PermissionGuard>
  );
}