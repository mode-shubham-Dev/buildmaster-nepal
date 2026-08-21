"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/permission-guard";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  ArrowLeft, Plus, Search, X, Trash2, Wrench, Truck, MapPin,
  Calendar, Wallet, ChevronDown, Settings2,
} from "lucide-react";
import {
  fetchEquipment, createEquipment, updateEquipment, deleteEquipment,
  fetchEquipmentItem, assignEquipment, logMaintenance, deleteMaintenance,
  type Equipment, type EquipmentStatus, type EquipmentPayload, type MaintenancePayload,
} from "@/lib/equipment-api";
import { fetchProjects } from "@/lib/projects-api";

const STATUS: Record<EquipmentStatus, { label: string; color: string; dot: string }> = {
  available: { label: "Available", color: "bg-green-50 text-green-600", dot: "bg-green-500" },
  in_use: { label: "In Use", color: "bg-blue-50 text-blue-600", dot: "bg-blue-500" },
  maintenance: { label: "Maintenance", color: "bg-amber-50 text-amber-600", dot: "bg-amber-500" },
  retired: { label: "Retired", color: "bg-slate-100 text-slate-500", dot: "bg-slate-400" },
};

function money(v: string | number | null): string {
  if (v === null || v === "") return "—";
  return `Rs. ${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function EquipmentContent() {
  const queryClient = useQueryClient();
  const { can } = useAuth();
  const canManage = can("equipment.manage");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const { data: equipment, isLoading, isError } = useQuery({
    queryKey: ["equipment", search, status],
    queryFn: () => fetchEquipment({ search: search || undefined, status: status || undefined }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteEquipment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["equipment"] }),
  });

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-[#1a1d23]">Equipment</h1>
                <p className="text-[13px] text-slate-400">{equipment?.length ?? 0} machines &amp; assets</p>
              </div>
            </div>
            {canManage && (
              <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2e37]">
                <Plus className="h-4 w-4" />
                Add Equipment
              </button>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-slate-300 focus:bg-white"
              />
            </div>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300">
              <option value="">All statuses</option>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-10 text-center text-sm text-red-600">
            Failed to load equipment. Please refresh and try again.
          </div>
        ) : equipment?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
              <Truck className="h-7 w-7" />
            </div>
            <p className="text-sm font-medium text-slate-500">No equipment yet</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {equipment?.map((eq) => {
              const meta = STATUS[eq.status];
              return (
                <button
                  key={eq.id}
                  onClick={() => setDetailId(eq.id)}
                  className="group rounded-2xl border border-slate-200/70 bg-white p-5 text-left transition hover:border-slate-300 hover:shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      <Truck className="h-5 w-5" />
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </span>
                  </div>
                  <p className="mt-3 font-semibold text-[#1a1d23] group-hover:text-amber-700">{eq.name}</p>
                  <p className="font-mono text-xs text-slate-400">{eq.code}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                    <span className="capitalize text-slate-400">{eq.ownership}</span>
                    {eq.project ? (
                      <span className="flex items-center gap-1 text-slate-500"><MapPin className="h-3 w-3" />{eq.project.name}</span>
                    ) : (
                      <span className="text-slate-300">Unassigned</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {showCreate && (
        <EquipmentModal
          equipment={null}
          onClose={() => setShowCreate(false)}
          onSaved={() => { queryClient.invalidateQueries({ queryKey: ["equipment"] }); setShowCreate(false); }}
        />
      )}
      {detailId && (
        <DetailModal
          id={detailId}
          canManage={canManage}
          onClose={() => setDetailId(null)}
          onDeleted={() => { queryClient.invalidateQueries({ queryKey: ["equipment"] }); setDetailId(null); }}
        />
      )}
    </div>
  );
}

function DetailModal({ id, canManage, onClose, onDeleted }: { id: number; canManage: boolean; onClose: () => void; onDeleted: () => void }) {
  const queryClient = useQueryClient();
  const [showMaint, setShowMaint] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const { data: eq, isLoading } = useQuery({ queryKey: ["equipment-item", id], queryFn: () => fetchEquipmentItem(id) });
  const { data: projects } = useQuery({ queryKey: ["projects"], queryFn: () => fetchProjects() });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["equipment-item", id] });
    queryClient.invalidateQueries({ queryKey: ["equipment"] });
  };

  const assignMut = useMutation({
    mutationFn: (projectId: number | null) => assignEquipment(id, projectId),
    onSuccess: invalidate,
  });
  const deleteMut = useMutation({ mutationFn: () => deleteEquipment(id), onSuccess: onDeleted });
  const delMaintMut = useMutation({ mutationFn: deleteMaintenance, onSuccess: invalidate });

  const logs = eq?.maintenanceLogs ?? eq?.maintenance_logs ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        {isLoading || !eq ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-[#1a1d23]">{eq.name}</h2>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS[eq.status].color}`}>{STATUS[eq.status].label}</span>
                </div>
                <p className="font-mono text-xs text-slate-400">{eq.code} · {eq.category ?? "—"}</p>
              </div>
              <button onClick={onClose} className="text-slate-300 transition hover:text-slate-500"><X className="h-5 w-5" /></button>
            </div>

            <div className="max-h-[calc(90vh-140px)] overflow-y-auto px-6 py-5">
              {/* key facts */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Fact icon={<Wallet className="h-4 w-4" />} label={eq.ownership === "owned" ? "Purchase Cost" : "Rental Rate"} value={money(eq.ownership === "owned" ? eq.purchase_cost : eq.rental_rate)} />
                <Fact icon={<Wrench className="h-4 w-4" />} label="Maintenance Cost" value={money(eq.total_maintenance_cost)} accent />
                {eq.purchase_date && <Fact icon={<Calendar className="h-4 w-4" />} label="Purchased" value={eq.purchase_date.split("T")[0]} />}
                <Fact icon={<MapPin className="h-4 w-4" />} label="Deployed To" value={eq.project?.name ?? "Unassigned"} />
              </div>

              {/* assign control */}
              {canManage && (
                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Assign to project</label>
                  <select
                    value={eq.project_id ?? ""}
                    onChange={(e) => assignMut.mutate(e.target.value ? Number(e.target.value) : null)}
                    disabled={assignMut.isPending}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
                  >
                    <option value="">— Unassigned (Available) —</option>
                    {projects?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <p className="mt-1.5 text-xs text-slate-400">Assigning marks it In Use; unassigning frees it.</p>
                </div>
              )}

              {/* maintenance */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#1a1d23]">Maintenance Log</h3>
                  {canManage && (
                    <button onClick={() => setShowMaint(true)} className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-[#1a1d23]">
                      <Plus className="h-3.5 w-3.5" />
                      Log service
                    </button>
                  )}
                </div>
                <div className="mt-3 space-y-2">
                  {logs.length === 0 ? (
                    <p className="py-4 text-center text-xs text-slate-400">No maintenance records.</p>
                  ) : (
                    logs.map((m) => (
                      <div key={m.id} className="rounded-xl border border-slate-100 bg-white p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              {m.type && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">{m.type}</span>}
                              <span className="text-xs text-slate-400">{m.service_date.split("T")[0]}</span>
                            </div>
                            <p className="mt-1 text-sm text-slate-700">{m.description}</p>
                            {m.next_service_date && <p className="mt-1 text-xs text-slate-400">Next: {m.next_service_date.split("T")[0]}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-700">{money(m.cost)}</span>
                            {canManage && (
                              <button onClick={() => delMaintMut.mutate(m.id)} className="text-slate-300 transition hover:text-red-500">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {canManage && (
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3">
                <button onClick={() => confirm(`Delete ${eq.name}?`) && deleteMut.mutate()} className="text-xs font-medium text-red-500 hover:text-red-600">
                  Delete equipment
                </button>
                <button onClick={() => setShowEdit(true)} className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  <Settings2 className="h-3.5 w-3.5" />
                  Edit
                </button>
              </div>
            )}

            {showMaint && <MaintenanceModal equipmentId={id} onClose={() => setShowMaint(false)} onSaved={() => { invalidate(); setShowMaint(false); }} />}
            {showEdit && <EquipmentModal equipment={eq} onClose={() => setShowEdit(false)} onSaved={() => { invalidate(); setShowEdit(false); }} />}
          </>
        )}
      </div>
    </div>
  );
}

function Fact({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-slate-300">{icon}</span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className={`mt-0.5 text-sm font-semibold ${accent ? "text-amber-600" : "text-slate-800"}`}>{value}</p>
      </div>
    </div>
  );
}

function MaintenanceModal({ equipmentId, onClose, onSaved }: { equipmentId: number; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<MaintenancePayload>({ service_date: new Date().toISOString().split("T")[0], description: "" });
  const mutation = useMutation({ mutationFn: () => logMaintenance(equipmentId, form), onSuccess: onSaved });
  const set = <K extends keyof MaintenancePayload>(k: K, v: MaintenancePayload[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1a1d23]">Log Maintenance</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Date</label>
              <input type="date" value={form.service_date} onChange={(e) => set("service_date", e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Type</label>
              <input value={form.type ?? ""} onChange={(e) => set("type", e.target.value)} placeholder="Routine" className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Cost</label>
              <input type="number" value={form.cost ?? ""} onChange={(e) => set("cost", e.target.value ? Number(e.target.value) : undefined)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Next Service</label>
              <input type="date" value={form.next_service_date ?? ""} onChange={(e) => set("next_service_date", e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.set_maintenance ?? false} onChange={(e) => set("set_maintenance", e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-amber-500" />
            Mark equipment as under maintenance
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100">Cancel</button>
          <button onClick={() => form.description && mutation.mutate()} disabled={mutation.isPending} className="rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a2e37] disabled:opacity-50">
            {mutation.isPending ? "Saving..." : "Log"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EquipmentModal({ equipment, onClose, onSaved }: { equipment: Equipment | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!equipment;
  const [form, setForm] = useState<EquipmentPayload>({
    code: equipment?.code ?? "",
    name: equipment?.name ?? "",
    category: equipment?.category ?? "",
    ownership: equipment?.ownership ?? "owned",
    purchase_cost: equipment?.purchase_cost ? Number(equipment.purchase_cost) : undefined,
    rental_rate: equipment?.rental_rate ? Number(equipment.rental_rate) : undefined,
    purchase_date: equipment?.purchase_date?.split("T")[0] ?? undefined,
    status: equipment?.status ?? "available",
    is_active: equipment?.is_active ?? true,
  });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () => isEdit ? updateEquipment(equipment!.id, form) : createEquipment(form),
    onSuccess: onSaved,
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message ?? "Failed to save.");
    },
  });
  const set = <K extends keyof EquipmentPayload>(k: K, v: EquipmentPayload[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1a1d23]">{isEdit ? "Edit Equipment" : "Add Equipment"}</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-4 space-y-3">
          {error && <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <Inp label="Code" value={form.code} onChange={(v) => set("code", v)} placeholder="EQP-0001" />
            <Inp label="Category" value={form.category ?? ""} onChange={(v) => set("category", v)} placeholder="Earthmoving" />
          </div>
          <Inp label="Name" value={form.name} onChange={(v) => set("name", v)} placeholder="CAT 320 Excavator" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Ownership</label>
              <select value={form.ownership} onChange={(e) => set("ownership", e.target.value as EquipmentPayload["ownership"])} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white">
                <option value="owned">Owned</option>
                <option value="rented">Rented</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value as EquipmentPayload["status"])} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white">
                {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          {form.ownership === "owned" ? (
            <div className="grid grid-cols-2 gap-3">
              <Inp label="Purchase Cost" type="number" value={form.purchase_cost?.toString() ?? ""} onChange={(v) => set("purchase_cost", v ? Number(v) : undefined)} />
              <Inp label="Purchase Date" type="date" value={form.purchase_date ?? ""} onChange={(v) => set("purchase_date", v)} />
            </div>
          ) : (
            <Inp label="Rental Rate" type="number" value={form.rental_rate?.toString() ?? ""} onChange={(v) => set("rental_rate", v ? Number(v) : undefined)} />
          )}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100">Cancel</button>
          <button onClick={() => form.code && form.name && mutation.mutate()} disabled={mutation.isPending} className="rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a2e37] disabled:opacity-50">
            {mutation.isPending ? "Saving..." : isEdit ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Inp({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-slate-600">{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
    </div>
  );
}

export default function EquipmentPage() {
  return (
    <PermissionGuard permission="equipment.view">
      <EquipmentContent />
    </PermissionGuard>
  );
}