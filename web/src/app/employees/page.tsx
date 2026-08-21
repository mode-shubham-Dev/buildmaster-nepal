"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/permission-guard";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  Users,
  ArrowLeft,
  Plus,
  Search,
  X,
  Trash2,
  Phone,
  ChevronRight,
} from "lucide-react";
import {
  fetchEmployees,
  createEmployee,
  deleteEmployee,
  type Employee,
} from "@/lib/employees-api";

function EmployeesContent() {
  const queryClient = useQueryClient();
  const { can } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const { data: employees, isLoading, isError } = useQuery({
    queryKey: ["employees", search, status],
    queryFn: () =>
      fetchEmployees({
        search: search || undefined,
        status: status || undefined,
      }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employees"] }),
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
                <Users className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="text-base font-semibold tracking-tight text-[#1a1d23]">
                  Employees
                </h1>
                <p className="text-xs text-slate-500">
                  Manage your workforce
                </p>
              </div>
            </div>
          </div>

          {can("employees.create") && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-md bg-amber-500 px-3.5 py-2 text-sm font-semibold text-[#1a1d23] shadow-sm transition hover:bg-amber-400"
            >
              <Plus className="h-4 w-4" />
              Add Employee
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
              placeholder="Search by name, code, or job title..."
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
            <option value="terminated">Terminated</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-10 text-center text-sm text-red-600">
            Failed to load employees. Please refresh and try again.
          </div>
        ) : employees?.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Users className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate-500">No employees found.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Job Title</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees?.map((e) => (
                  <tr key={e.id} className="transition hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/employees/${e.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                          {e.first_name.charAt(0)}
                          {e.last_name.charAt(0)}
                        </span>
                        <div>
                          <p className="font-medium text-slate-900 group-hover:text-amber-600">
                            {e.full_name}
                          </p>
                          {e.phone && (
                            <p className="flex items-center gap-1 text-xs text-slate-500">
                              <Phone className="h-3 w-3" />
                              {e.phone}
                            </p>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {e.employee_code}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {e.job_title ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {formatType(e.employment_type)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={e.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/employees/${e.id}`}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          View
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                        {can("employees.delete") && (
                          <button
                            onClick={() => {
                              if (confirm(`Delete ${e.full_name}?`))
                                deleteMut.mutate(e.id);
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
        <CreateEmployeeModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}

function CreateEmployeeModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<Partial<Employee>>({
    employment_type: "full_time",
    status: "active",
  });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: onCreated,
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message ?? "Failed to create employee.");
    },
  });

  const set = (key: keyof Employee, v: string) =>
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
          <h2 className="text-base font-semibold text-[#1a1d23]">
            Add New Employee
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 transition hover:text-slate-600"
          >
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
            <ModalField label="Employee Code *" value={form.employee_code ?? ""} onChange={(v) => set("employee_code", v)} placeholder="EMP-0001" />
            <ModalField label="Job Title" value={form.job_title ?? ""} onChange={(v) => set("job_title", v)} placeholder="Site Engineer" />
            <ModalField label="First Name *" value={form.first_name ?? ""} onChange={(v) => set("first_name", v)} />
            <ModalField label="Last Name *" value={form.last_name ?? ""} onChange={(v) => set("last_name", v)} />
            <ModalField label="Email" value={form.email ?? ""} onChange={(v) => set("email", v)} type="email" />
            <ModalField label="Phone" value={form.phone ?? ""} onChange={(v) => set("phone", v)} />
            <ModalField label="Joining Date" value={form.joining_date ?? ""} onChange={(v) => set("joining_date", v)} type="date" />
            <ModalField label="Basic Salary" value={form.basic_salary ?? ""} onChange={(v) => set("basic_salary", v)} type="number" />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Employment Type
              </label>
              <select
                value={form.employment_type}
                onChange={(e) => set("employment_type", e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="daily_wage">Daily Wage</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
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
              {mutation.isPending ? "Creating..." : "Create Employee"}
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
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-slate-100 text-slate-600",
    terminated: "bg-red-100 text-red-700",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${styles[status] ?? styles.inactive}`}>
      {status}
    </span>
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

export default function EmployeesPage() {
  return (
    <PermissionGuard permission="employees.view">
      <EmployeesContent />
    </PermissionGuard>
  );
}