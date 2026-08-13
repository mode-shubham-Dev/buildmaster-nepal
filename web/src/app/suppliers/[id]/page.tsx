"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/permission-guard";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Building2,
  Plus,
  Trash2,
  FileText,
  Upload,
  Users,
  Receipt,
  X,
} from "lucide-react";
import {
  fetchSupplierProfile,
  addSupplierContact,
  deleteSupplierContact,
  uploadSupplierDocument,
  type SupplierContact,
  type PurchaseHistoryItem,
} from "@/lib/suppliers-api";
import { deleteAttachment, type Attachment } from "@/lib/milestones-api";

function money(v: string | number): string {
  return `Rs. ${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

type Tab = "overview" | "contacts" | "history" | "documents";

const PO_STATUS_COLOR: Record<string, string> = {
  draft: "text-slate-500 bg-slate-100",
  submitted: "text-blue-600 bg-blue-50",
  approved: "text-purple-600 bg-purple-50",
  received: "text-green-600 bg-green-50",
  rejected: "text-red-600 bg-red-50",
  cancelled: "text-slate-400 bg-slate-100",
};

function ProfileContent() {
  const params = useParams();
  const id = Number(params.id);
  const [tab, setTab] = useState<Tab>("overview");
  const { can } = useAuth();
  const canManage = can("purchases.create");

  const { data, isLoading } = useQuery({
    queryKey: ["supplier-profile", id],
    queryFn: () => fetchSupplierProfile(id),
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
        <p className="text-sm text-slate-400">Supplier not found.</p>
      </div>
    );
  }

  const { supplier, purchase_history, stats } = data;

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <Link
            href="/suppliers"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-slate-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Suppliers
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* identity + performance — the hero */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-xl font-semibold text-slate-600">
              {supplier.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-[#1a1d23]">{supplier.name}</h1>
              <div className="mt-1 flex items-center gap-3">
                {supplier.category && <span className="text-sm text-slate-400">{supplier.category}</span>}
                <span className="inline-flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`h-3.5 w-3.5 ${
                        supplier.rating && n <= supplier.rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-slate-100 text-slate-200"
                      }`}
                    />
                  ))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* performance stats — leads the page */}
        <div className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-200/70">
          <Stat label="Total Orders" value={String(stats.total_orders)} />
          <Stat label="Completed" value={String(stats.received_orders)} />
          <Stat label="Business Value" value={money(stats.total_value)} accent />
        </div>

        {/* tabs */}
        <div className="mt-8 flex gap-6 border-b border-slate-200">
          {[
            { id: "overview" as Tab, label: "Overview", icon: <Building2 className="h-4 w-4" /> },
            { id: "contacts" as Tab, label: "Contacts", icon: <Users className="h-4 w-4" /> },
            { id: "history" as Tab, label: "Purchase History", icon: <Receipt className="h-4 w-4" /> },
            { id: "documents" as Tab, label: "Documents", icon: <FileText className="h-4 w-4" /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition ${
                tab === t.id
                  ? "border-[#1a1d23] text-[#1a1d23]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "overview" && <OverviewTab supplier={supplier} />}
          {tab === "contacts" && <ContactsTab supplierId={id} contacts={supplier.contacts ?? []} canManage={canManage} />}
          {tab === "history" && <HistoryTab history={purchase_history} />}
          {tab === "documents" && <DocumentsTab supplierId={id} documents={supplier.attachments ?? []} canManage={canManage} />}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-white px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${accent ? "text-amber-600" : "text-[#1a1d23]"}`}>
        {value}
      </p>
    </div>
  );
}

/* ---------- OVERVIEW ---------- */
function OverviewTab({ supplier }: { supplier: import("@/lib/suppliers-api").Supplier }) {
  const rows = [
    { icon: <Phone className="h-4 w-4" />, label: "Phone", value: supplier.phone },
    { icon: <Mail className="h-4 w-4" />, label: "Email", value: supplier.email },
    { icon: <CreditCard className="h-4 w-4" />, label: "PAN / VAT", value: supplier.pan_vat_no },
    { icon: <Receipt className="h-4 w-4" />, label: "Payment Terms", value: supplier.payment_terms },
    { icon: <Building2 className="h-4 w-4" />, label: "Bank", value: supplier.bank_name },
    { icon: <CreditCard className="h-4 w-4" />, label: "Account", value: supplier.bank_account },
    { icon: <MapPin className="h-4 w-4" />, label: "Address", value: supplier.address },
  ];
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-6">
      <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start gap-3">
            <span className="mt-0.5 text-slate-300">{r.icon}</span>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{r.label}</dt>
              <dd className="mt-0.5 text-sm text-slate-800">{r.value || "—"}</dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ---------- CONTACTS ---------- */
function ContactsTab({ supplierId, contacts, canManage }: { supplierId: number; contacts: SupplierContact[]; canManage: boolean }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["supplier-profile", supplierId] });

  const addMut = useMutation({
    mutationFn: () => addSupplierContact(supplierId, { name, designation, phone, email }),
    onSuccess: () => {
      invalidate();
      setName(""); setDesignation(""); setPhone(""); setEmail(""); setOpen(false);
    },
  });

  const delMut = useMutation({ mutationFn: deleteSupplierContact, onSuccess: invalidate });

  return (
    <div className="space-y-3">
      {canManage && !open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#1a1d23]"
        >
          <Plus className="h-4 w-4" />
          Add contact
        </button>
      )}

      {open && (
        <div className="rounded-2xl border border-slate-200/70 bg-white p-4">
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
            <input placeholder="Designation" value={designation} onChange={(e) => setDesignation(e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
            <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
            <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100">Cancel</button>
            <button onClick={() => name && addMut.mutate()} disabled={addMut.isPending} className="rounded-lg bg-[#1a1d23] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#2a2e37] disabled:opacity-50">Add</button>
          </div>
        </div>
      )}

      {contacts.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">No contacts added.</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {contacts.map((c) => (
            <div key={c.id} className="group flex items-start justify-between rounded-2xl border border-slate-200/70 bg-white p-4">
              <div>
                <p className="text-sm font-medium text-slate-900">{c.name}</p>
                {c.designation && <p className="text-xs text-slate-400">{c.designation}</p>}
                <div className="mt-2 space-y-0.5">
                  {c.phone && <p className="flex items-center gap-1.5 text-xs text-slate-500"><Phone className="h-3 w-3" />{c.phone}</p>}
                  {c.email && <p className="flex items-center gap-1.5 text-xs text-slate-500"><Mail className="h-3 w-3" />{c.email}</p>}
                </div>
              </div>
              {canManage && (
                <button onClick={() => delMut.mutate(c.id)} className="text-slate-300 opacity-0 transition hover:text-red-500 group-hover:opacity-100">
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

/* ---------- PURCHASE HISTORY (derived) ---------- */
function HistoryTab({ history }: { history: PurchaseHistoryItem[] }) {
  if (history.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">No purchase orders with this supplier yet.</p>;
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
      {history.map((po, i) => (
        <div
          key={po.id}
          className={`flex items-center justify-between px-5 py-3.5 ${i !== 0 ? "border-t border-slate-100" : ""}`}
        >
          <div>
            <p className="font-mono text-sm font-medium text-slate-800">{po.po_number}</p>
            {po.order_date && <p className="text-xs text-slate-400">{po.order_date.split("T")[0]}</p>}
          </div>
          <div className="flex items-center gap-4">
            <span className={`rounded-md px-2 py-0.5 text-xs font-medium capitalize ${PO_STATUS_COLOR[po.status] ?? "bg-slate-100 text-slate-500"}`}>
              {po.status}
            </span>
            <span className="w-28 text-right text-sm font-semibold text-slate-900">{money(po.total)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- DOCUMENTS ---------- */
function DocumentsTab({ supplierId, documents, canManage }: { supplierId: number; documents: Attachment[]; canManage: boolean }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["supplier-profile", supplierId] });

  const delMut = useMutation({ mutationFn: deleteAttachment, onSuccess: invalidate });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadSupplierDocument(supplierId, file);
      invalidate();
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {canManage && (
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white py-6 text-sm text-slate-400 transition hover:border-slate-400 hover:text-slate-600 disabled:opacity-50"
        >
          {uploading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500" />
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload a document (agreement, PAN certificate...)
            </>
          )}
        </button>
      )}
      <input ref={fileRef} type="file" onChange={handleFile} className="hidden" />

      {documents.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">No documents uploaded.</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="group flex items-center justify-between rounded-xl border border-slate-200/70 bg-white px-4 py-3">
              <a href={doc.url} target="_blank" rel="noreferrer" className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                  <FileText className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-slate-700 group-hover:text-amber-700">
                  {doc.original_name}
                </span>
              </a>
              {canManage && (
                <button onClick={() => delMut.mutate(doc.id)} className="text-slate-300 opacity-0 transition hover:text-red-500 group-hover:opacity-100">
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

export default function SupplierProfilePage() {
  return (
    <PermissionGuard permission="purchases.view">
      <ProfileContent />
    </PermissionGuard>
  );
}