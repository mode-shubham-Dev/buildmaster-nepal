"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/permission-guard";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Briefcase,
  Award,
  ShieldCheck,
  Phone,
  Plus,
  Trash2,
  Mail,
  MapPin,
  Calendar,
  Wallet,
} from "lucide-react";
import {
  fetchEmployee,
  addSkill,
  deleteSkill,
  addCertification,
  deleteCertification,
  addEmergencyContact,
  deleteEmergencyContact,
  type Employee,
  type Skill,
  type Certification,
  type EmergencyContact,
} from "@/lib/employees-api";

type Tab = "personal" | "employment" | "skills" | "certifications" | "contacts";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "personal", label: "Personal", icon: <User className="h-4 w-4" /> },
  { id: "employment", label: "Employment", icon: <Briefcase className="h-4 w-4" /> },
  { id: "skills", label: "Skills", icon: <Award className="h-4 w-4" /> },
  { id: "certifications", label: "Certifications", icon: <ShieldCheck className="h-4 w-4" /> },
  { id: "contacts", label: "Emergency Contacts", icon: <Phone className="h-4 w-4" /> },
];

function ProfileContent() {
  const params = useParams();
  const id = Number(params.id);
  const [tab, setTab] = useState<Tab>("personal");
  const { can } = useAuth();
  const canManage = can("employees.update");

  const { data: employee, isLoading } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => fetchEmployee(id),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7f9]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7f9]">
        <p className="text-sm text-slate-500">Employee not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <Link
            href="/employees"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="text-sm text-slate-500">Back to Employees</span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* profile header card */}
        <div className="mb-6 flex items-center gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500 text-xl font-bold text-[#1a1d23]">
            {employee.first_name.charAt(0)}
            {employee.last_name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight text-[#1a1d23]">
              {employee.full_name}
            </h1>
            <p className="text-sm text-slate-500">
              {employee.job_title ?? "—"} · {employee.employee_code}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
              employee.status === "active"
                ? "bg-green-100 text-green-700"
                : employee.status === "terminated"
                ? "bg-red-100 text-red-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {employee.status}
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

        {/* tab content */}
        {tab === "personal" && <PersonalTab employee={employee} />}
        {tab === "employment" && <EmploymentTab employee={employee} />}
        {tab === "skills" && <SkillsTab employeeId={id} skills={employee.skills ?? []} canManage={canManage} />}
        {tab === "certifications" && <CertificationsTab employeeId={id} certs={employee.certifications ?? []} canManage={canManage} />}
        {tab === "contacts" && <ContactsTab employeeId={id} contacts={employee.emergency_contacts ?? []} canManage={canManage} />}
      </div>
    </div>
  );
}

/* ---------- PERSONAL ---------- */
function PersonalTab({ employee }: { employee: Employee }) {
  const rows = [
    { icon: <Mail className="h-4 w-4" />, label: "Email", value: employee.email },
    { icon: <Phone className="h-4 w-4" />, label: "Phone", value: employee.phone },
    { icon: <Calendar className="h-4 w-4" />, label: "Date of Birth", value: employee.date_of_birth },
    { icon: <User className="h-4 w-4" />, label: "Gender", value: employee.gender },
    { icon: <MapPin className="h-4 w-4" />, label: "Address", value: employee.address },
  ];
  return <InfoCard rows={rows} />;
}

/* ---------- EMPLOYMENT ---------- */
function EmploymentTab({ employee }: { employee: Employee }) {
  const rows = [
    { icon: <Briefcase className="h-4 w-4" />, label: "Job Title", value: employee.job_title },
    { icon: <Briefcase className="h-4 w-4" />, label: "Department", value: employee.department?.name },
    { icon: <User className="h-4 w-4" />, label: "Employment Type", value: formatType(employee.employment_type) },
    { icon: <Calendar className="h-4 w-4" />, label: "Joining Date", value: employee.joining_date },
    { icon: <Wallet className="h-4 w-4" />, label: "Basic Salary", value: employee.basic_salary ? `Rs. ${employee.basic_salary}` : null },
  ];
  return <InfoCard rows={rows} />;
}

/* ---------- SKILLS ---------- */
function SkillsTab({ employeeId, skills, canManage }: { employeeId: number; skills: Skill[]; canManage: boolean }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [proficiency, setProficiency] = useState("intermediate");

  const addMut = useMutation({
    mutationFn: () => addSkill(employeeId, { name, proficiency: proficiency as Skill["proficiency"] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
      setName("");
    },
  });

  const delMut = useMutation({
    mutationFn: deleteSkill,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employee", employeeId] }),
  });

  return (
    <div className="space-y-5">
      {canManage && (
        <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <input
            placeholder="Skill name (e.g. AutoCAD)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
          <select
            value={proficiency}
            onChange={(e) => setProficiency(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>
          <button
            onClick={() => name && addMut.mutate()}
            disabled={addMut.isPending}
            className="flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-[#1a1d23] transition hover:bg-amber-400 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      )}

      {skills.length === 0 ? (
        <EmptyState text="No skills added yet." />
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm"
            >
              {s.name}
              <span className="text-xs capitalize text-amber-600">{s.proficiency}</span>
              {canManage && (
                <button
                  onClick={() => delMut.mutate(s.id)}
                  className="text-slate-400 transition hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- CERTIFICATIONS ---------- */
function CertificationsTab({ employeeId, certs, canManage }: { employeeId: number; certs: Certification[]; canManage: boolean }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [authority, setAuthority] = useState("");
  const [expiry, setExpiry] = useState("");

  const addMut = useMutation({
    mutationFn: () => addCertification(employeeId, { name, issuing_authority: authority, expiry_date: expiry }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
      setName(""); setAuthority(""); setExpiry("");
    },
  });

  const delMut = useMutation({
    mutationFn: deleteCertification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employee", employeeId] }),
  });

  return (
    <div className="space-y-5">
      {canManage && (
        <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <input placeholder="Certification name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 min-w-[180px] rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
          <input placeholder="Issuing authority" value={authority} onChange={(e) => setAuthority(e.target.value)} className="flex-1 min-w-[180px] rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
          <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
          <button onClick={() => name && addMut.mutate()} disabled={addMut.isPending} className="flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-[#1a1d23] transition hover:bg-amber-400 disabled:opacity-60">
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      )}

      {certs.length === 0 ? (
        <EmptyState text="No certifications added yet." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Authority</th>
                <th className="px-5 py-3">Expiry</th>
                {canManage && <th className="px-5 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {certs.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 font-medium text-slate-900">{c.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">{c.issuing_authority ?? "—"}</td>
                  <td className="px-5 py-3.5 text-slate-600">{c.expiry_date ?? "—"}</td>
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

/* ---------- EMERGENCY CONTACTS ---------- */
function ContactsTab({ employeeId, contacts, canManage }: { employeeId: number; contacts: EmergencyContact[]; canManage: boolean }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [phone, setPhone] = useState("");

  const addMut = useMutation({
    mutationFn: () => addEmergencyContact(employeeId, { name, relationship, phone }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
      setName(""); setRelationship(""); setPhone("");
    },
  });

  const delMut = useMutation({
    mutationFn: deleteEmergencyContact,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employee", employeeId] }),
  });

  return (
    <div className="space-y-5">
      {canManage && (
        <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <input placeholder="Contact name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 min-w-[160px] rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
          <input placeholder="Relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)} className="w-40 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
          <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-40 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
          <button onClick={() => name && phone && addMut.mutate()} disabled={addMut.isPending} className="flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-[#1a1d23] transition hover:bg-amber-400 disabled:opacity-60">
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      )}

      {contacts.length === 0 ? (
        <EmptyState text="No emergency contacts added yet." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {contacts.map((c) => (
            <div key={c.id} className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div>
                <p className="font-medium text-slate-900">{c.name}</p>
                <p className="text-xs text-slate-500">{c.relationship ?? "—"}</p>
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                  <Phone className="h-3.5 w-3.5" />
                  {c.phone}
                </p>
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

/* ---------- SHARED ---------- */
function InfoCard({ rows }: { rows: { icon: React.ReactNode; label: string; value: string | null | undefined }[] }) {
  return (
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
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

function formatType(type: string): string {
  const map: Record<string, string> = {
    full_time: "Full Time",
    part_time: "Part Time",
    contract: "Contract",
    daily_wage: "Daily Wage",
  };
  return map[type] ?? type;
}

export default function EmployeeProfilePage() {
  return (
    <PermissionGuard permission="employees.view">
      <ProfileContent />
    </PermissionGuard>
  );
}