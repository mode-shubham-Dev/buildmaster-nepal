"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Calendar,
  Users,
  CloudSun,
  TrendingUp,
  Package,
  AlertTriangle,
  ImagePlus,
  X,
  User,
} from "lucide-react";
import {
  fetchSiteReports,
  addSiteReport,
  deleteSiteReport,
  uploadReportPhoto,
  type SiteReport,
} from "@/lib/site-reports-api";
import { deleteAttachment } from "@/lib/milestones-api";

function fmtDate(v: string): string {
  return v.split("T")[0];
}

export function SiteReportsTab({ projectId, canManage }: { projectId: number; canManage: boolean }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: reports, isLoading } = useQuery({
    queryKey: ["site-reports", projectId],
    queryFn: () => fetchSiteReports(projectId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {canManage && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-md bg-amber-500 px-3.5 py-2 text-sm font-semibold text-[#1a1d23] shadow-sm transition hover:bg-amber-400"
          >
            <Plus className="h-4 w-4" />
            Submit Report
          </button>
        </div>
      )}

      {(reports?.length ?? 0) === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
          No site reports yet. Submit the first daily report.
        </div>
      ) : (
        <div className="space-y-4">
          {reports?.map((r) => (
            <ReportCard key={r.id} report={r} projectId={projectId} canManage={canManage} />
          ))}
        </div>
      )}

      {showForm && (
        <ReportFormModal
          projectId={projectId}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["site-reports", projectId] });
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

function ReportCard({
  report,
  projectId,
  canManage,
}: {
  report: SiteReport;
  projectId: number;
  canManage: boolean;
}) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["site-reports", projectId] });

  const delMut = useMutation({
    mutationFn: () => deleteSiteReport(report.id),
    onSuccess: invalidate,
  });

  const delPhotoMut = useMutation({
    mutationFn: deleteAttachment,
    onSuccess: invalidate,
  });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadReportPhoto(report.id, file);
      invalidate();
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const photos = report.attachments ?? [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* header */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-600" />
            <h3 className="font-semibold text-slate-900">{fmtDate(report.report_date)}</h3>
            {report.progress_percentage !== null && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                {report.progress_percentage}% progress
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            {report.reporter && (
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {report.reporter.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {report.workers_present} workers
            </span>
            {report.weather && (
              <span className="flex items-center gap-1">
                <CloudSun className="h-3.5 w-3.5" />
                {report.weather}
              </span>
            )}
          </div>
        </div>
        {canManage && (
          <button
            onClick={() => confirm("Delete this report?") && delMut.mutate()}
            className="inline-flex items-center rounded-md border border-slate-200 p-1.5 text-red-600 transition hover:border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* body */}
      <div className="mt-3 space-y-3">
        <Section icon={<TrendingUp className="h-4 w-4" />} label="Work Done" text={report.work_done} />
        {report.materials_used && (
          <Section icon={<Package className="h-4 w-4" />} label="Materials Used" text={report.materials_used} />
        )}
        {report.issues && (
          <Section icon={<AlertTriangle className="h-4 w-4" />} label="Issues" text={report.issues} warning />
        )}
      </div>

      {/* photos */}
      <div className="mt-4 border-t border-slate-100 pt-4">
        <div className="flex flex-wrap items-center gap-3">
          {photos.map((p) => (
            <div key={p.id} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.original_name} className="h-full w-full object-cover" />
              {canManage && (
                <button
                  onClick={() => delPhotoMut.mutate(p.id)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
          {canManage && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 text-slate-400 transition hover:border-amber-400 hover:text-amber-500 disabled:opacity-50"
            >
              {uploading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
              ) : (
                <>
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-[10px]">Add</span>
                </>
              )}
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </div>
      </div>
    </div>
  );
}

function Section({
  icon,
  label,
  text,
  warning,
}: {
  icon: React.ReactNode;
  label: string;
  text: string;
  warning?: boolean;
}) {
  return (
    <div>
      <p className={`mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide ${warning ? "text-red-500" : "text-slate-400"}`}>
        {icon}
        {label}
      </p>
      <p className="text-sm text-slate-700">{text}</p>
    </div>
  );
}

function ReportFormModal({
  projectId,
  onClose,
  onSaved,
}: {
  projectId: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [reportDate, setReportDate] = useState(new Date().toISOString().split("T")[0]);
  const [workDone, setWorkDone] = useState("");
  const [workers, setWorkers] = useState("");
  const [weather, setWeather] = useState("");
  const [progress, setProgress] = useState("");
  const [materials, setMaterials] = useState("");
  const [issues, setIssues] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      addSiteReport(projectId, {
        report_date: reportDate,
        work_done: workDone,
        workers_present: workers ? Number(workers) : undefined,
        weather: weather || undefined,
        progress_percentage: progress ? Number(progress) : undefined,
        materials_used: materials || undefined,
        issues: issues || undefined,
      }),
    onSuccess: onSaved,
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message ?? "Failed to submit report.");
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-[#1a1d23]">Submit Daily Report</h2>
          <button onClick={onClose} className="text-slate-400 transition hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[75vh] space-y-4 overflow-y-auto px-6 py-5">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Report Date *</label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Weather</label>
              <input
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                placeholder="Sunny, Rainy..."
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Workers Present</label>
              <input
                type="number"
                value={workers}
                onChange={(e) => setWorkers(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Progress %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Work Done *</label>
            <textarea
              value={workDone}
              onChange={(e) => setWorkDone(e.target.value)}
              rows={3}
              placeholder="Describe the day's work..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Materials Used</label>
            <textarea
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
              rows={2}
              placeholder="Cement: 45 bags, Steel: 1.2 ton..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Issues / Incidents</label>
            <textarea
              value={issues}
              onChange={(e) => setIssues(e.target.value)}
              rows={2}
              placeholder="Any problems or safety incidents..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => workDone && reportDate && mutation.mutate()}
            disabled={mutation.isPending}
            className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-[#1a1d23] transition hover:bg-amber-400 disabled:opacity-60"
          >
            {mutation.isPending ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}