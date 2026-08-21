"use client";

import { useState, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/permission-guard";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  ArrowLeft, Plus, Search, X, Upload, FileText, Image as ImageIcon, File,
  AlertTriangle, Clock, Trash2, FolderOpen, Layers, ExternalLink, CalendarClock,
} from "lucide-react";
import {
  fetchDocuments, fetchDocumentCategories, createDocument, deleteDocument,
  type Document, type DocumentCategory,
} from "@/lib/documents-api";
import { fetchProjects } from "@/lib/projects-api";

// map category color name → tailwind classes (dot + tint)
const COLOR: Record<string, { dot: string; tint: string; text: string }> = {
  blue: { dot: "bg-blue-500", tint: "bg-blue-50", text: "text-blue-600" },
  amber: { dot: "bg-amber-500", tint: "bg-amber-50", text: "text-amber-600" },
  violet: { dot: "bg-violet-500", tint: "bg-violet-50", text: "text-violet-600" },
  red: { dot: "bg-red-500", tint: "bg-red-50", text: "text-red-600" },
  green: { dot: "bg-green-500", tint: "bg-green-50", text: "text-green-600" },
  slate: { dot: "bg-slate-400", tint: "bg-slate-100", text: "text-slate-600" },
};
function colorOf(name: string | null | undefined) {
  return COLOR[name ?? "slate"] ?? COLOR.slate;
}

function fileMeta(name: string): { icon: React.ReactNode; ext: string } {
  const ext = name.split(".").pop()?.toUpperCase() ?? "FILE";
  if (/(png|jpg|jpeg|gif|webp|svg)$/i.test(name)) return { icon: <ImageIcon className="h-5 w-5" />, ext };
  if (/pdf$/i.test(name)) return { icon: <FileText className="h-5 w-5" />, ext };
  return { icon: <File className="h-5 w-5" />, ext };
}

function daysUntil(date: string): number {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

function DocumentsContent() {
  const queryClient = useQueryClient();
  const { can } = useAuth();
  const canManage = can("documents.manage");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [expiringOnly, setExpiringOnly] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const { data: categories } = useQuery({ queryKey: ["document-categories"], queryFn: fetchDocumentCategories });
  const { data: documents, isLoading, isError } = useQuery({
    queryKey: ["documents", search, categoryId, expiringOnly],
    queryFn: () => fetchDocuments({
      search: search || undefined,
      category_id: categoryId ?? undefined,
      expiring: expiringOnly ? 1 : undefined,
    }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });

  // count expiring across everything (for the alert strip) — from the unfiltered set
  const { data: allExpiring } = useQuery({
    queryKey: ["documents-expiring"],
    queryFn: () => fetchDocuments({ expiring: 1 }),
  });
  const expiringCount = allExpiring?.length ?? 0;

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-[#1a1d23]">Documents</h1>
                <p className="text-[13px] text-slate-400">Company &amp; project document library</p>
              </div>
            </div>
            {canManage && (
              <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2e37]">
                <Upload className="h-4 w-4" />
                Upload
              </button>
            )}
          </div>

          <div className="relative mt-5 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
            />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-6 py-8">
        {/* category rail */}
        <aside className="hidden w-52 shrink-0 sm:block">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Categories</p>
          <button
            onClick={() => { setCategoryId(null); setExpiringOnly(false); }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${categoryId === null && !expiringOnly ? "bg-slate-100 text-[#1a1d23]" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <Layers className="h-4 w-4" />
            All Documents
          </button>
          {categories?.map((c) => {
            const col = colorOf(c.color);
            const active = categoryId === c.id && !expiringOnly;
            return (
              <button
                key={c.id}
                onClick={() => { setCategoryId(c.id); setExpiringOnly(false); }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${active ? "bg-slate-100 text-[#1a1d23]" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                <span className="truncate">{c.name}</span>
              </button>
            );
          })}

          {expiringCount > 0 && (
            <>
              <div className="my-3 border-t border-slate-100" />
              <button
                onClick={() => { setExpiringOnly(true); setCategoryId(null); }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${expiringOnly ? "bg-amber-50 text-amber-700" : "text-amber-600 hover:bg-amber-50"}`}
              >
                <span className="flex items-center gap-2.5"><CalendarClock className="h-4 w-4" />Expiring Soon</span>
                <span className="rounded-full bg-amber-500 px-1.5 text-[11px] font-semibold text-white">{expiringCount}</span>
              </button>
            </>
          )}
        </aside>

        {/* documents */}
        <main className="min-w-0 flex-1">
          {/* expiring alert strip */}
          {expiringCount > 0 && !expiringOnly && (
            <button
              onClick={() => setExpiringOnly(true)}
              className="mb-5 flex w-full items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-left transition hover:bg-amber-50"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
              </span>
              <span className="text-sm text-amber-800">
                <span className="font-semibold">{expiringCount} document{expiringCount > 1 ? "s" : ""}</span> expiring within 30 days — review before they lapse.
              </span>
            </button>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-24"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" /></div>
          ) : isError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-10 text-center text-sm text-red-600">
              Failed to load documents. Please refresh and try again.
            </div>
          ) : documents?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300"><FolderOpen className="h-7 w-7" /></div>
              <p className="text-sm font-medium text-slate-500">No documents found</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {documents?.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} canManage={canManage} onDelete={() => deleteMut.mutate(doc.id)} />
              ))}
            </div>
          )}
        </main>
      </div>

      {showUpload && (
        <UploadModal
          categories={categories ?? []}
          onClose={() => setShowUpload(false)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["documents"] });
            queryClient.invalidateQueries({ queryKey: ["documents-expiring"] });
            setShowUpload(false);
          }}
        />
      )}
    </div>
  );
}

function DocumentCard({ doc, canManage, onDelete }: { doc: Document; canManage: boolean; onDelete: () => void }) {
  const col = colorOf(doc.category?.color);
  const attachment = doc.attachments?.[0];
  const fm = attachment ? fileMeta(attachment.original_name) : { icon: <File className="h-5 w-5" />, ext: "FILE" };

  const expiry = doc.expiry_date ? daysUntil(doc.expiry_date) : null;
  const expired = expiry !== null && expiry < 0;
  const soon = doc.is_expiring_soon && !expired;

  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 transition hover:border-slate-300 hover:shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${col.tint} ${col.text}`}>
          {fm.icon}
        </div>
        {canManage && (
          <button onClick={onDelete} className="text-slate-300 opacity-0 transition hover:text-red-500 group-hover:opacity-100">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-3 flex-1">
        <p className="font-semibold leading-snug text-[#1a1d23] line-clamp-2">{doc.title}</p>
        {doc.category && (
          <span className={`mt-1.5 inline-flex items-center gap-1.5 text-xs ${col.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${col.dot}`} />
            {doc.category.name}
          </span>
        )}
        {doc.description && <p className="mt-2 text-xs text-slate-400 line-clamp-2">{doc.description}</p>}
      </div>

      {/* expiry signal */}
      {(soon || expired) && (
        <div className={`mt-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${expired ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}>
          {expired ? <AlertTriangle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
          {expired ? `Expired ${Math.abs(expiry!)}d ago` : `Expires in ${expiry}d`}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{fm.ext}</span>
        {attachment && (
          <a href={attachment.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-amber-600">
            Open <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

function UploadModal({ categories, onClose, onSaved }: { categories: DocumentCategory[]; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [description, setDescription] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: projects } = useQuery({ queryKey: ["projects"], queryFn: () => fetchProjects() });

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append("title", title);
      if (categoryId) fd.append("document_category_id", categoryId);
      if (projectId) fd.append("project_id", projectId);
      if (description) fd.append("description", description);
      if (expiryDate) fd.append("expiry_date", expiryDate);
      fd.append("file", file!);
      return createDocument(fd);
    },
    onSuccess: onSaved,
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Upload failed.");
    },
  });

  const pick = (f: File | undefined) => { if (f) setFile(f); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1a1d23]">Upload Document</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-5 space-y-3.5">
          {error && <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</div>}

          {/* drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); pick(e.dataTransfer.files?.[0]); }}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${dragOver ? "border-amber-400 bg-amber-50/50" : file ? "border-green-300 bg-green-50/40" : "border-slate-300 hover:border-slate-400"}`}
          >
            {file ? (
              <>
                <FileText className="h-6 w-6 text-green-600" />
                <p className="mt-1.5 text-sm font-medium text-slate-700">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB · click to replace</p>
              </>
            ) : (
              <>
                <Upload className="h-6 w-6 text-slate-400" />
                <p className="mt-1.5 text-sm text-slate-500">Drop a file or click to browse</p>
                <p className="text-xs text-slate-400">PDF, image, or document up to 20MB</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" onChange={(e) => pick(e.target.files?.[0])} className="hidden" />

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. VAT Registration Certificate" className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white">
                <option value="">None</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Project</label>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white">
                <option value="">Company-wide</option>
                {projects?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Expiry Date <span className="font-normal text-slate-400">(optional — for licenses/permits)</span></label>
            <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white [color-scheme:light]" />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Optional" className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100">Cancel</button>
          <button onClick={() => title && file && mutation.mutate()} disabled={!title || !file || mutation.isPending} className="rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a2e37] disabled:opacity-50">
            {mutation.isPending ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <PermissionGuard permission="documents.view">
      <DocumentsContent />
    </PermissionGuard>
  );
}