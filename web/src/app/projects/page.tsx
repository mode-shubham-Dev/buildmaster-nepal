"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/permission-guard";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  HardHat,
  ArrowLeft,
  Plus,
  Search,
  X,
  ChevronRight,
  Building,
  MapPin,
  Wallet,
  Users,
  Layers,
} from "lucide-react";
import {
  fetchProjects,
  createProject,
  type Project,
  type ProjectStatus,
} from "@/lib/projects-api";
import { fetchClients } from "@/lib/clients-api";
import { fetchEmployees } from "@/lib/employees-api";

/**
 * A dedicated shape for the create form. It uses the *_id foreign-key
 * fields the API expects on write (which the read-only Project type does
 * not expose), so TypeScript is happy with every set() call.
 */
interface ProjectForm {
  project_code?: string;
  name?: string;
  description?: string;
  client_id?: string;
  project_manager_id?: string;
  budget?: string;
  contract_value?: string;
  start_date?: string;
  end_date?: string;
  site_location?: string;
  status?: ProjectStatus;
}

const STATUS_META: Record<ProjectStatus, { label: string; color: string; dot: string }> = {
  planning: { label: "Planning", color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
  approval: { label: "Approval", color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  execution: { label: "Execution", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  monitoring: { label: "Monitoring", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  completion: { label: "Completion", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  archived: { label: "Archived", color: "bg-slate-100 text-slate-500", dot: "bg-slate-300" },
};

const STATUS_ORDER: ProjectStatus[] = [
  "planning", "approval", "execution", "monitoring", "completion", "archived",
];

function money(v: string | null | undefined): string {
  if (!v) return "—";
  return `Rs. ${Number(v).toLocaleString()}`;
}

function ProjectsContent() {
  const queryClient = useQueryClient();
  const { can } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const { data: projects, isLoading, isError } = useQuery({
    queryKey: ["projects", search, status],
    queryFn: () => fetchProjects({ search: search || undefined, status: status || undefined }),
  });

  const stats = useMemo(() => {
    const list = projects ?? [];
    const active = list.filter((p) => ["execution", "monitoring"].includes(p.status)).length;
    const totalContract = list.reduce(
      (sum, p) => sum + (p.contract_value ? Number(p.contract_value) : 0),
      0
    );
    return { total: list.length, active, totalContract };
  }, [projects]);

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
                <HardHat className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="text-base font-semibold tracking-tight text-[#1a1d23]">
                  Projects
                </h1>
                <p className="text-xs text-slate-500">The heart of your operations</p>
              </div>
            </div>
          </div>

          {can("projects.create") && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-md bg-amber-500 px-3.5 py-2 text-sm font-semibold text-[#1a1d23] shadow-sm transition hover:bg-amber-400"
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard icon={<Layers className="h-5 w-5" />} label="Total Projects" value={String(stats.total)} />
          <StatCard icon={<HardHat className="h-5 w-5" />} label="Active" value={String(stats.active)} />
          <StatCard icon={<Wallet className="h-5 w-5" />} label="Total Contract Value" value={money(String(stats.totalContract))} />
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search by name, code, or location..."
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
        ) : isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-10 text-center text-sm text-red-600">
            Failed to load projects. Please refresh and try again.
          </div>
        ) : projects?.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <HardHat className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate-500">No projects found.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects?.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            setShowCreate(false);
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

function ProjectCard({ project }: { project: Project }) {
  const meta = STATUS_META[project.status];
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
          <h3 className="mt-2 font-semibold text-slate-900 group-hover:text-amber-600">
            {project.name}
          </h3>
          <p className="text-xs text-slate-400">{project.project_code}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:text-amber-500" />
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-slate-500">
        {project.client?.name && (
          <p className="flex items-center gap-1.5">
            <Building className="h-3.5 w-3.5" />
            {project.client.name}
          </p>
        )}
        {project.site_location && (
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {project.site_location}
          </p>
        )}
        <p className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {project.members_count ?? 0} team members
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Contract Value</p>
          <p className="text-sm font-semibold text-amber-600">{money(project.contract_value)}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Budget</p>
          <p className="text-sm font-semibold text-slate-700">{money(project.budget)}</p>
        </div>
      </div>
    </Link>
  );
}

function CreateProjectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<ProjectForm>({ status: "planning" });
  const [error, setError] = useState("");

  const { data: clients } = useQuery({ queryKey: ["clients"], queryFn: () => fetchClients() });
  const { data: employees } = useQuery({ queryKey: ["employees"], queryFn: () => fetchEmployees() });

  const mutation = useMutation({
    mutationFn: (payload: ProjectForm) => createProject(payload as Partial<Project>),
    onSuccess: onCreated,
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message ?? "Failed to create project.");
    },
  });

  const set = (key: keyof ProjectForm, v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    mutation.mutate(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-[#1a1d23]">New Project</h2>
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

          <div className="grid grid-cols-2 gap-4">
            <Field label="Project Code *" value={form.project_code ?? ""} onChange={(v) => set("project_code", v)} placeholder="PRJ-0001" />
            <Field label="Project Name *" value={form.name ?? ""} onChange={(v) => set("name", v)} placeholder="Highway Section B" />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Client</label>
              <select
                value={form.client_id ?? ""}
                onChange={(e) => set("client_id", e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="">— None —</option>
                {clients?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Project Manager</label>
              <select
                value={form.project_manager_id ?? ""}
                onChange={(e) => set("project_manager_id", e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="">— None —</option>
                {employees?.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                ))}
              </select>
            </div>

            <Field label="Budget (Rs.)" type="number" value={form.budget ?? ""} onChange={(v) => set("budget", v)} />
            <Field label="Contract Value (Rs.)" type="number" value={form.contract_value ?? ""} onChange={(v) => set("contract_value", v)} />
            <Field label="Start Date" type="date" value={form.start_date ?? ""} onChange={(v) => set("start_date", v)} />
            <Field label="End Date" type="date" value={form.end_date ?? ""} onChange={(v) => set("end_date", v)} />
            <Field label="Site Location" value={form.site_location ?? ""} onChange={(v) => set("site_location", v)} placeholder="Kathmandu" />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>{STATUS_META[s].label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
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
              {mutation.isPending ? "Creating..." : "Create Project"}
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

export default function ProjectsPage() {
  return (
    <PermissionGuard permission="projects.view">
      <ProjectsContent />
    </PermissionGuard>
  );
}