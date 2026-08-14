"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/permission-guard";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  ArrowLeft,
  LayoutDashboard,
  Users,
  Building,
  MapPin,
  Calendar,
  Wallet,
  User,
  Plus,
  Trash2,
  HardHat,
  Calculator,
  Flag,
  ClipboardList,
} from "lucide-react";
import {
  fetchProject,
  assignMember,
  removeMember,
  type Project,
  type ProjectStatus,
} from "@/lib/projects-api";
import { fetchEmployees } from "@/lib/employees-api";
import { BoqTab } from "@/components/project/boq-tab";
import { MilestonesTab } from "@/components/project/milestones-tab";
import { SiteReportsTab } from "@/components/project/site-reports-tab";
import { SubcontractorsTab } from "@/components/project/subcontractors-tab";

type Tab = "overview" | "team" | "boq" | "milestones" | "reports" | "subcontractors";

const STATUS_META: Record<ProjectStatus, { label: string; color: string }> = {
  planning: { label: "Planning", color: "bg-slate-100 text-slate-600" },
  approval: { label: "Approval", color: "bg-purple-100 text-purple-700" },
  execution: { label: "Execution", color: "bg-blue-100 text-blue-700" },
  monitoring: { label: "Monitoring", color: "bg-amber-100 text-amber-700" },
  completion: { label: "Completion", color: "bg-green-100 text-green-700" },
  archived: { label: "Archived", color: "bg-slate-100 text-slate-500" },
};

function money(v: string | null): string {
  if (!v) return "—";
  return `Rs. ${Number(v).toLocaleString()}`;
}

function ProfileContent() {
  const params = useParams();
  const id = Number(params.id);
  const [tab, setTab] = useState<Tab>("overview");
  const { can } = useAuth();
  const canManage = can("projects.update");

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => fetchProject(id),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7f9]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7f9]">
        <p className="text-sm text-slate-500">Project not found.</p>
      </div>
    );
  }

  const meta = STATUS_META[project.status];

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <Link
            href="/projects"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="text-sm text-slate-500">Back to Projects</span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* header card */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500 text-[#1a1d23]">
                <HardHat className="h-7 w-7" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[#1a1d23]">
                  {project.name}
                </h1>
                <p className="text-sm text-slate-500">{project.project_code}</p>
              </div>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${meta.color}`}>
              {meta.label}
            </span>
          </div>
        </div>

        {/* tabs */}
        <div className="mb-6 flex gap-1 border-b border-slate-200">
          {[
            { id: "overview" as Tab, label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
            { id: "team" as Tab, label: "Team", icon: <Users className="h-4 w-4" /> },
            { id: "boq" as Tab, label: "BOQ", icon: <Calculator className="h-4 w-4" /> },
            { id: "milestones" as Tab, label: "Milestones", icon: <Flag className="h-4 w-4" /> },
            { id: "reports" as Tab, label: "Site Reports", icon: <ClipboardList className="h-4 w-4" /> },
            { id: "subcontractors" as Tab, label: "Subcontractors", icon: <HardHat className="h-4 w-4" /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
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

        {tab === "overview" && <OverviewTab project={project} />}
        {tab === "team" && (
          <TeamTab projectId={id} members={project.members ?? []} canManage={canManage} />
        )}
        {tab === "boq" && <BoqTab projectId={id} canManage={can("boq.create")} />}
        {tab === "milestones" && <MilestonesTab projectId={id} canManage={can("projects.update")} />}
        {tab === "reports" && <SiteReportsTab projectId={id} canManage={can("reports.create")} />}
        {tab === "subcontractors" && <SubcontractorsTab projectId={id} />}
      </div>
    </div>
  );
}

/* ---------- OVERVIEW ---------- */
function OverviewTab({ project }: { project: Project }) {
  const info = [
    { icon: <Building className="h-4 w-4" />, label: "Client", value: project.client?.name },
    { icon: <User className="h-4 w-4" />, label: "Project Manager", value: project.project_manager?.full_name },
    { icon: <MapPin className="h-4 w-4" />, label: "Site Location", value: project.site_location },
    { icon: <Calendar className="h-4 w-4" />, label: "Start Date", value: project.start_date },
    { icon: <Calendar className="h-4 w-4" />, label: "End Date", value: project.end_date },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <MoneyCard label="Contract Value" value={money(project.contract_value)} highlight />
        <MoneyCard label="Budget" value={money(project.budget)} />
        <MoneyCard
          label="Est. Margin"
          value={
            project.contract_value && project.budget
              ? money(String(Number(project.contract_value) - Number(project.budget)))
              : "—"
          }
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-5 sm:grid-cols-2">
          {info.map((r) => (
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

      {project.description && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Description
          </h3>
          <p className="text-sm text-slate-700">{project.description}</p>
        </div>
      )}

      {project.tender && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
          <p className="text-xs text-amber-700">
            Converted from tender:{" "}
            <span className="font-semibold">{project.tender.title}</span>
          </p>
        </div>
      )}
    </div>
  );
}

function MoneyCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-slate-400">
        <Wallet className="h-4 w-4" />
        <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className={`mt-2 text-lg font-bold ${highlight ? "text-amber-600" : "text-[#1a1d23]"}`}>
        {value}
      </p>
    </div>
  );
}

/* ---------- TEAM ---------- */
function TeamTab({
  projectId,
  members,
  canManage,
}: {
  projectId: number;
  members: Project["members"];
  canManage: boolean;
}) {
  const queryClient = useQueryClient();
  const [employeeId, setEmployeeId] = useState<number | "">("");
  const [role, setRole] = useState("");

  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: () => fetchEmployees(),
  });

  const assignMut = useMutation({
    mutationFn: () =>
      assignMember(projectId, {
        employee_id: Number(employeeId),
        role_on_project: role || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      setEmployeeId("");
      setRole("");
    },
  });

  const removeMut = useMutation({
    mutationFn: (empId: number) => removeMember(projectId, empId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
  });

  const assignedIds = new Set((members ?? []).map((m) => m.id));
  const available = (employees ?? []).filter((e) => !assignedIds.has(e.id));

  return (
    <div className="space-y-5">
      {canManage && (
        <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(Number(e.target.value))}
            className="w-56 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="">Select employee</option>
            {available.map((e) => (
              <option key={e.id} value={e.id}>
                {e.full_name} ({e.employee_code})
              </option>
            ))}
          </select>
          <input
            placeholder="Role on project (e.g. Site Engineer)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="flex-1 min-w-[180px] rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
          <button
            onClick={() => employeeId && assignMut.mutate()}
            disabled={assignMut.isPending}
            className="flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-[#1a1d23] transition hover:bg-amber-400 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            Assign
          </button>
        </div>
      )}

      {(members ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
          No team members assigned yet.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {(members ?? []).map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                  {m.full_name.split(" ").map((n) => n.charAt(0)).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{m.full_name}</p>
                  <p className="text-xs text-slate-500">
                    {m.role_on_project ?? "—"} · {m.employee_code}
                  </p>
                </div>
              </div>
              {canManage && (
                <button
                  onClick={() => removeMut.mutate(m.id)}
                  className="text-slate-400 transition hover:text-red-600"
                >
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

export default function ProjectDetailPage() {
  return (
    <PermissionGuard permission="projects.view">
      <ProfileContent />
    </PermissionGuard>
  );
}
