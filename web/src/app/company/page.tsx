"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/permission-guard";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  Building2,
  GitBranch,
  Users2,
  UsersRound,
  MapPin,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Check,
  Hash,
  Mail,
  Phone,
  Globe,
  FileText,
  Landmark,
  Inbox,
} from "lucide-react";
import {
  fetchCompany,
  updateCompany,
  fetchBranches,
  createBranch,
  deleteBranch,
  fetchDepartments,
  createDepartment,
  deleteDepartment,
  fetchTeams,
  createTeam,
  deleteTeam,
  fetchOfficeLocations,
  createOfficeLocation,
  deleteOfficeLocation,
  type Company,
} from "@/lib/company-api";

type Tab = "company" | "branches" | "departments" | "teams" | "locations";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "company", label: "Company", icon: <Building2 className="h-4 w-4" /> },
  { id: "branches", label: "Branches", icon: <GitBranch className="h-4 w-4" /> },
  { id: "departments", label: "Departments", icon: <Users2 className="h-4 w-4" /> },
  { id: "teams", label: "Teams", icon: <UsersRound className="h-4 w-4" /> },
  { id: "locations", label: "Office Locations", icon: <MapPin className="h-4 w-4" /> },
];

function CompanySettingsContent() {
  const [tab, setTab] = useState<Tab>("company");
  const { can } = useAuth();
  const canManage = can("company.manage");

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-4">
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-[#1a1d23]">
              <Building2 className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-[#1a1d23]">
                Company Settings
              </h1>
              <p className="text-xs text-slate-500">
                Manage your organization structure
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex gap-1 overflow-x-auto">
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
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {tab === "company" && <CompanyTab canManage={canManage} />}
        {tab === "branches" && <BranchesTab canManage={canManage} />}
        {tab === "departments" && <DepartmentsTab canManage={canManage} />}
        {tab === "teams" && <TeamsTab canManage={canManage} />}
        {tab === "locations" && <LocationsTab canManage={canManage} />}
      </main>
    </div>
  );
}

/* ---------------- COMPANY TAB ---------------- */
function CompanyTab({ canManage }: { canManage: boolean }) {
  const queryClient = useQueryClient();
  const { data: company, isLoading, isError } = useQuery({
    queryKey: ["company"],
    queryFn: fetchCompany,
  });

  const [form, setForm] = useState<Partial<Company>>({});
  const [saved, setSaved] = useState(false);

  const mutation = useMutation({
    mutationFn: updateCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  if (isLoading) return <Spinner />;
  if (isError) return <div className="flex min-h-screen items-center justify-center text-sm text-red-600">Failed to load company info. Please refresh and try again.</div>;

  const value = (key: keyof Company) =>
    (form[key] ?? company?.[key] ?? "") as string;
  const set = (key: keyof Company, v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  const identityFields: {
    key: keyof Company;
    label: string;
    icon: React.ReactNode;
    placeholder: string;
  }[] = [
    { key: "name", label: "Company Name", icon: <Building2 className="h-4 w-4" />, placeholder: "e.g. Himalaya Builders Pvt. Ltd." },
    { key: "legal_name", label: "Legal Name", icon: <FileText className="h-4 w-4" />, placeholder: "Registered legal entity name" },
    { key: "registration_no", label: "Registration No.", icon: <Hash className="h-4 w-4" />, placeholder: "Company registration number" },
    { key: "pan_vat_no", label: "PAN / VAT No.", icon: <Landmark className="h-4 w-4" />, placeholder: "e.g. 301234567" },
  ];

  const contactFields: {
    key: keyof Company;
    label: string;
    icon: React.ReactNode;
    placeholder: string;
  }[] = [
    { key: "email", label: "Email", icon: <Mail className="h-4 w-4" />, placeholder: "info@company.com.np" },
    { key: "phone", label: "Phone", icon: <Phone className="h-4 w-4" />, placeholder: "01-4XXXXXX" },
    { key: "website", label: "Website", icon: <Globe className="h-4 w-4" />, placeholder: "https://company.com.np" },
  ];

  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* header band */}
      <div className="flex items-center gap-4 border-b border-slate-100 bg-gradient-to-r from-[#1a1d23] to-[#2d3138] px-6 py-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500 text-[#1a1d23]">
          <Building2 className="h-7 w-7" strokeWidth={2} />
        </div>
        <div>
          <p className="text-base font-semibold text-white">
            {value("name") || "Your Company"}
          </p>
          <p className="text-sm text-slate-400">
            {value("pan_vat_no") ? `PAN/VAT: ${value("pan_vat_no")}` : "Complete your company profile"}
          </p>
        </div>
      </div>

      <div className="space-y-8 p-6">
        {/* Identity section */}
        <section>
          <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <FileText className="h-3.5 w-3.5" />
            Company Identity
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {identityFields.map((f) => (
              <Field
                key={f.key}
                label={f.label}
                icon={f.icon}
                placeholder={f.placeholder}
                value={value(f.key)}
                disabled={!canManage}
                onChange={(v) => set(f.key, v)}
              />
            ))}
          </div>
        </section>

        {/* Contact section */}
        <section>
          <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <Mail className="h-3.5 w-3.5" />
            Contact Details
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {contactFields.map((f) => (
              <Field
                key={f.key}
                label={f.label}
                icon={f.icon}
                placeholder={f.placeholder}
                value={value(f.key)}
                disabled={!canManage}
                onChange={(v) => set(f.key, v)}
              />
            ))}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Address
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <textarea
                  disabled={!canManage}
                  value={value("address")}
                  onChange={(e) => set("address", e.target.value)}
                  rows={2}
                  placeholder="Street, city, district"
                  className="w-full rounded-md border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>
          </div>
        </section>

        {canManage && (
          <div className="flex items-center gap-3 border-t border-slate-100 pt-6">
            <button
              onClick={() => mutation.mutate(form)}
              disabled={mutation.isPending}
              className="flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-semibold text-[#1a1d23] shadow-sm transition hover:bg-amber-400 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                <Check className="h-4 w-4" />
                Saved successfully
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- BRANCHES TAB ---------------- */
function BranchesTab({ canManage }: { canManage: boolean }) {
  const queryClient = useQueryClient();
  const { data: branches, isLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
  });

  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const createMut = useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      setName("");
      setCode("");
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["branches"] }),
  });

  return (
    <div className="space-y-6">
      {canManage && (
        <AddCard title="Add Branch" icon={<GitBranch className="h-4 w-4" />}>
          <input
            placeholder="Branch name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
          <input
            placeholder="Code (KTM)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-32 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
          <AddButton
            onClick={() => name && createMut.mutate({ name, code })}
            pending={createMut.isPending}
          />
        </AddCard>
      )}

      {isLoading ? (
        <Spinner />
      ) : branches?.length === 0 ? (
        <EmptyState icon={<GitBranch className="h-6 w-6" />} text="No branches yet" />
      ) : (
        <Card>
          <Table
            head={
              <>
                <Th>Name</Th>
                <Th>Code</Th>
                <Th>Departments</Th>
                {canManage && <Th align="right">Actions</Th>}
              </>
            }
          >
            {branches?.map((b) => (
              <tr key={b.id} className="transition hover:bg-slate-50/60">
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar text={b.name} />
                    <span className="font-medium text-slate-900">
                      {b.name}
                      {b.is_head_office && <Badge>HQ</Badge>}
                    </span>
                  </div>
                </Td>
                <Td muted>{b.code ?? "—"}</Td>
                <Td muted>{b.departments_count ?? 0}</Td>
                {canManage && (
                  <Td align="right">
                    <DeleteButton
                      onClick={() =>
                        confirm(`Delete ${b.name}?`) && deleteMut.mutate(b.id)
                      }
                    />
                  </Td>
                )}
              </tr>
            ))}
          </Table>
        </Card>
      )}
    </div>
  );
}

/* ---------------- DEPARTMENTS TAB ---------------- */
function DepartmentsTab({ canManage }: { canManage: boolean }) {
  const queryClient = useQueryClient();
  const { data: departments, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });
  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
  });

  const [name, setName] = useState("");
  const [branchId, setBranchId] = useState<number | "">("");

  const createMut = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setName("");
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });

  return (
    <div className="space-y-6">
      {canManage && (
        <AddCard title="Add Department" icon={<Users2 className="h-4 w-4" />}>
          <select
            value={branchId}
            onChange={(e) => setBranchId(Number(e.target.value))}
            className="w-48 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="">Select branch</option>
            {branches?.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <input
            placeholder="Department name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
          <AddButton
            onClick={() =>
              name && branchId && createMut.mutate({ name, branch_id: Number(branchId) })
            }
            pending={createMut.isPending}
          />
        </AddCard>
      )}

      {isLoading ? (
        <Spinner />
      ) : departments?.length === 0 ? (
        <EmptyState icon={<Users2 className="h-6 w-6" />} text="No departments yet" />
      ) : (
        <Card>
          <Table
            head={
              <>
                <Th>Name</Th>
                <Th>Branch</Th>
                <Th>Teams</Th>
                {canManage && <Th align="right">Actions</Th>}
              </>
            }
          >
            {departments?.map((d) => (
              <tr key={d.id} className="transition hover:bg-slate-50/60">
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar text={d.name} />
                    <span className="font-medium text-slate-900">{d.name}</span>
                  </div>
                </Td>
                <Td muted>{d.branch?.name ?? "—"}</Td>
                <Td muted>{d.teams_count ?? 0}</Td>
                {canManage && (
                  <Td align="right">
                    <DeleteButton
                      onClick={() =>
                        confirm(`Delete ${d.name}?`) && deleteMut.mutate(d.id)
                      }
                    />
                  </Td>
                )}
              </tr>
            ))}
          </Table>
        </Card>
      )}
    </div>
  );
}

/* ---------------- TEAMS TAB ---------------- */
function TeamsTab({ canManage }: { canManage: boolean }) {
  const queryClient = useQueryClient();
  const { data: teams, isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: fetchTeams,
  });
  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });

  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState<number | "">("");

  const createMut = useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setName("");
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teams"] }),
  });

  return (
    <div className="space-y-6">
      {canManage && (
        <AddCard title="Add Team" icon={<UsersRound className="h-4 w-4" />}>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(Number(e.target.value))}
            className="w-48 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="">Select department</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <input
            placeholder="Team name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
          <AddButton
            onClick={() =>
              name && departmentId && createMut.mutate({ name, department_id: Number(departmentId) })
            }
            pending={createMut.isPending}
          />
        </AddCard>
      )}

      {isLoading ? (
        <Spinner />
      ) : teams?.length === 0 ? (
        <EmptyState icon={<UsersRound className="h-6 w-6" />} text="No teams yet" />
      ) : (
        <Card>
          <Table
            head={
              <>
                <Th>Name</Th>
                <Th>Department</Th>
                {canManage && <Th align="right">Actions</Th>}
              </>
            }
          >
            {teams?.map((t) => (
              <tr key={t.id} className="transition hover:bg-slate-50/60">
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar text={t.name} />
                    <span className="font-medium text-slate-900">{t.name}</span>
                  </div>
                </Td>
                <Td muted>{t.department?.name ?? "—"}</Td>
                {canManage && (
                  <Td align="right">
                    <DeleteButton
                      onClick={() =>
                        confirm(`Delete ${t.name}?`) && deleteMut.mutate(t.id)
                      }
                    />
                  </Td>
                )}
              </tr>
            ))}
          </Table>
        </Card>
      )}
    </div>
  );
}

/* ---------------- LOCATIONS TAB ---------------- */
function LocationsTab({ canManage }: { canManage: boolean }) {
  const queryClient = useQueryClient();
  const { data: locations, isLoading } = useQuery({
    queryKey: ["office-locations"],
    queryFn: fetchOfficeLocations,
  });

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const createMut = useMutation({
    mutationFn: createOfficeLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-locations"] });
      setName("");
      setAddress("");
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteOfficeLocation,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["office-locations"] }),
  });

  return (
    <div className="space-y-6">
      {canManage && (
        <AddCard title="Add Office Location" icon={<MapPin className="h-4 w-4" />}>
          <input
            placeholder="Location name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-48 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
          <input
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
          <AddButton
            onClick={() => name && createMut.mutate({ name, address })}
            pending={createMut.isPending}
          />
        </AddCard>
      )}

      {isLoading ? (
        <Spinner />
      ) : locations?.length === 0 ? (
        <EmptyState icon={<MapPin className="h-6 w-6" />} text="No office locations yet" />
      ) : (
        <Card>
          <Table
            head={
              <>
                <Th>Name</Th>
                <Th>Address</Th>
                {canManage && <Th align="right">Actions</Th>}
              </>
            }
          >
            {locations?.map((l) => (
              <tr key={l.id} className="transition hover:bg-slate-50/60">
                <Td>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <span className="font-medium text-slate-900">{l.name}</span>
                  </div>
                </Td>
                <Td muted>{l.address ?? "—"}</Td>
                {canManage && (
                  <Td align="right">
                    <DeleteButton
                      onClick={() =>
                        confirm(`Delete ${l.name}?`) && deleteMut.mutate(l.id)
                      }
                    />
                  </Td>
                )}
              </tr>
            ))}
          </Table>
        </Card>
      )}
    </div>
  );
}

/* ---------------- SHARED UI PRIMITIVES ---------------- */
function Field({
  label,
  icon,
  value,
  placeholder,
  disabled,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  placeholder: string;
  disabled: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
        <input
          type="text"
          disabled={disabled}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:bg-slate-50 disabled:text-slate-500"
        />
      </div>
    </div>
  );
}

function AddCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
        <span className="text-amber-600">{icon}</span>
        {title}
      </h3>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
}

function AddButton({ onClick, pending }: { onClick: () => void; pending: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={pending}
      className="flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-[#1a1d23] shadow-sm transition hover:bg-amber-400 disabled:opacity-60"
    >
      <Plus className="h-4 w-4" />
      Add
    </button>
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:border-red-200 hover:bg-red-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Delete
    </button>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {children}
    </div>
  );
}

function Table({
  head,
  children,
}: {
  head: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
          {head}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">{children}</tbody>
    </table>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th className={`px-5 py-3 ${align === "right" ? "text-right" : ""}`}>
      {children}
    </th>
  );
}

function Td({
  children,
  muted,
  align = "left",
}: {
  children: React.ReactNode;
  muted?: boolean;
  align?: "left" | "right";
}) {
  return (
    <td
      className={`px-5 py-3.5 ${muted ? "text-slate-600" : ""} ${
        align === "right" ? "text-right" : ""
      }`}
    >
      {children}
    </td>
  );
}

function Avatar({ text }: { text: string }) {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
      {text.charAt(0).toUpperCase()}
    </span>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
      {children}
    </span>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        {icon}
      </div>
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
    </div>
  );
}

export default function CompanyPage() {
  return (
    <PermissionGuard permission="company.view">
      <CompanySettingsContent />
    </PermissionGuard>
  );
}