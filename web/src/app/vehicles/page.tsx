"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/permission-guard";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  ArrowLeft, Plus, Search, X, Trash2, Truck, MapPin, Fuel, Wrench,
  Wallet, Settings2, Gauge,
} from "lucide-react";
import {
  fetchVehicles, createVehicle, updateVehicle, deleteVehicle,
  fetchVehicleItem, assignVehicle, logFuel, logVehicleMaintenance,
  deleteFuelLog, deleteVehicleMaintenance,
  type Vehicle, type VehicleStatus, type VehiclePayload,
  type FuelPayload, type VehicleMaintenancePayload,
} from "@/lib/vechicles-api";
import { fetchProjects } from "@/lib/projects-api";

const STATUS: Record<VehicleStatus, { label: string; color: string; dot: string }> = {
  available: { label: "Available", color: "bg-green-50 text-green-600", dot: "bg-green-500" },
  in_use: { label: "In Use", color: "bg-blue-50 text-blue-600", dot: "bg-blue-500" },
  maintenance: { label: "Maintenance", color: "bg-amber-50 text-amber-600", dot: "bg-amber-500" },
  retired: { label: "Retired", color: "bg-slate-100 text-slate-500", dot: "bg-slate-400" },
};

function money(v: string | number | null): string {
  if (v === null || v === "") return "—";
  return `Rs. ${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function VehiclesContent() {
  const queryClient = useQueryClient();
  const { can } = useAuth();
  const canManage = can("vehicles.manage");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const { data: vehicles, isLoading, isError } = useQuery({
    queryKey: ["vehicles", search, status],
    queryFn: () => fetchVehicles({ search: search || undefined, status: status || undefined }),
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
                <h1 className="text-lg font-semibold tracking-tight text-[#1a1d23]">Fleet</h1>
                <p className="text-[13px] text-slate-400">{vehicles?.length ?? 0} vehicles</p>
              </div>
            </div>
            {canManage && (
              <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2e37]">
                <Plus className="h-4 w-4" />
                Add Vehicle
              </button>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-55 max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search by reg no, make, model..."
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
            Failed to load vehicles. Please refresh and try again.
          </div>
        ) : vehicles?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
              <Truck className="h-7 w-7" />
            </div>
            <p className="text-sm font-medium text-slate-500">No vehicles yet</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {vehicles?.map((v) => {
              const meta = STATUS[v.status];
              return (
                <button
                  key={v.id}
                  onClick={() => setDetailId(v.id)}
                  className="group rounded-2xl border border-slate-200/70 bg-white p-5 text-left transition hover:border-slate-300 hover:shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                        <Truck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold leading-tight text-[#1a1d23] group-hover:text-amber-700">{v.registration_no}</p>
                        <p className="text-xs text-slate-400">{[v.make, v.model].filter(Boolean).join(" ") || v.type || "—"}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </span>
                  </div>

                  {/* both running costs */}
                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                      <Fuel className="h-3.5 w-3.5 text-slate-300" />
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-slate-400">Fuel</p>
                        <p className="text-sm font-semibold text-slate-700">{money(v.total_fuel_cost)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wrench className="h-3.5 w-3.5 text-slate-300" />
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-slate-400">Service</p>
                        <p className="text-sm font-semibold text-slate-700">{money(v.total_maintenance_cost)}</p>
                      </div>
                    </div>
                  </div>

                  {v.project && (
                    <p className="mt-3 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3" />{v.project.name}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </main>

      {showCreate && (
        <VehicleModal vehicle={null} onClose={() => setShowCreate(false)} onSaved={() => { queryClient.invalidateQueries({ queryKey: ["vehicles"] }); setShowCreate(false); }} />
      )}
      {detailId && (
        <DetailModal id={detailId} canManage={canManage} onClose={() => setDetailId(null)} onDeleted={() => { queryClient.invalidateQueries({ queryKey: ["vehicles"] }); setDetailId(null); }} />
      )}
    </div>
  );
}

function DetailModal({ id, canManage, onClose, onDeleted }: { id: number; canManage: boolean; onClose: () => void; onDeleted: () => void }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"fuel" | "maintenance">("fuel");
  const [showFuel, setShowFuel] = useState(false);
  const [showMaint, setShowMaint] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const { data: v, isLoading } = useQuery({ queryKey: ["vehicle-item", id], queryFn: () => fetchVehicleItem(id) });
  const { data: projects } = useQuery({ queryKey: ["projects"], queryFn: () => fetchProjects() });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["vehicle-item", id] });
    queryClient.invalidateQueries({ queryKey: ["vehicles"] });
  };

  const assignMut = useMutation({ mutationFn: (pid: number | null) => assignVehicle(id, pid), onSuccess: invalidate });
  const deleteMut = useMutation({ mutationFn: () => deleteVehicle(id), onSuccess: onDeleted });
  const delFuelMut = useMutation({ mutationFn: deleteFuelLog, onSuccess: invalidate });
  const delMaintMut = useMutation({ mutationFn: deleteVehicleMaintenance, onSuccess: invalidate });

  const fuelLogs = v?.fuelLogs ?? v?.fuel_logs ?? [];
  const maintLogs = v?.maintenanceLogs ?? v?.maintenance_logs ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        {isLoading || !v ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-[#1a1d23]">{v.registration_no}</h2>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS[v.status].color}`}>{STATUS[v.status].label}</span>
                </div>
                <p className="text-xs text-slate-400">{[v.make, v.model].filter(Boolean).join(" ")} · {v.type ?? "—"}</p>
              </div>
              <button onClick={onClose} className="text-slate-300 transition hover:text-slate-500"><X className="h-5 w-5" /></button>
            </div>

            <div className="max-h-[calc(90vh-140px)] overflow-y-auto px-6 py-5">
              {/* facts */}
              <div className="grid grid-cols-3 gap-3">
                <Fact icon={<Wallet className="h-4 w-4" />} label={v.ownership === "owned" ? "Cost" : "Rental"} value={money(v.ownership === "owned" ? v.purchase_cost : v.rental_rate)} />
                <Fact icon={<Fuel className="h-4 w-4" />} label="Fuel" value={money(v.total_fuel_cost)} accent />
                <Fact icon={<Wrench className="h-4 w-4" />} label="Service" value={money(v.total_maintenance_cost)} accent />
              </div>

              {/* assign */}
              {canManage && (
                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Assign to project</label>
                  <select
                    value={v.project_id ?? ""}
                    onChange={(e) => assignMut.mutate(e.target.value ? Number(e.target.value) : null)}
                    disabled={assignMut.isPending}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
                  >
                    <option value="">— Unassigned (Available) —</option>
                    {projects?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}

              {/* logs — tabbed fuel / maintenance */}
              <div className="mt-6">
                <div className="flex gap-4 border-b border-slate-200">
                  <button onClick={() => setTab("fuel")} className={`flex items-center gap-1.5 border-b-2 pb-2 text-sm font-medium transition ${tab === "fuel" ? "border-[#1a1d23] text-[#1a1d23]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
                    <Fuel className="h-4 w-4" /> Fuel ({fuelLogs.length})
                  </button>
                  <button onClick={() => setTab("maintenance")} className={`flex items-center gap-1.5 border-b-2 pb-2 text-sm font-medium transition ${tab === "maintenance" ? "border-[#1a1d23] text-[#1a1d23]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
                    <Wrench className="h-4 w-4" /> Service ({maintLogs.length})
                  </button>
                </div>

                {tab === "fuel" ? (
                  <div className="mt-3 space-y-2">
                    {canManage && (
                      <button onClick={() => setShowFuel(true)} className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-[#1a1d23]">
                        <Plus className="h-3.5 w-3.5" /> Log fuel
                      </button>
                    )}
                    {fuelLogs.length === 0 ? (
                      <p className="py-4 text-center text-xs text-slate-400">No fuel logs.</p>
                    ) : fuelLogs.map((f) => (
                      <div key={f.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{Number(f.litres).toLocaleString()} L · {money(f.cost)}</p>
                          <p className="flex items-center gap-2 text-xs text-slate-400">
                            {f.fuel_date.split("T")[0]}
                            {f.odometer && <span className="flex items-center gap-0.5"><Gauge className="h-3 w-3" />{f.odometer.toLocaleString()} km</span>}
                          </p>
                        </div>
                        {canManage && (
                          <button onClick={() => delFuelMut.mutate(f.id)} className="text-slate-300 transition hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    {canManage && (
                      <button onClick={() => setShowMaint(true)} className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-[#1a1d23]">
                        <Plus className="h-3.5 w-3.5" /> Log service
                      </button>
                    )}
                    {maintLogs.length === 0 ? (
                      <p className="py-4 text-center text-xs text-slate-400">No service records.</p>
                    ) : maintLogs.map((m) => (
                      <div key={m.id} className="rounded-xl border border-slate-100 p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              {m.type && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">{m.type}</span>}
                              <span className="text-xs text-slate-400">{m.service_date.split("T")[0]}</span>
                            </div>
                            <p className="mt-1 text-sm text-slate-700">{m.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-700">{money(m.cost)}</span>
                            {canManage && (
                              <button onClick={() => delMaintMut.mutate(m.id)} className="text-slate-300 transition hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {canManage && (
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3">
                <button onClick={() => confirm(`Delete ${v.registration_no}?`) && deleteMut.mutate()} className="text-xs font-medium text-red-500 hover:text-red-600">Delete vehicle</button>
                <button onClick={() => setShowEdit(true)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  <Settings2 className="h-3.5 w-3.5" /> Edit
                </button>
              </div>
            )}

            {showFuel && <FuelModal vehicleId={id} onClose={() => setShowFuel(false)} onSaved={() => { invalidate(); setShowFuel(false); }} />}
            {showMaint && <MaintModal vehicleId={id} onClose={() => setShowMaint(false)} onSaved={() => { invalidate(); setShowMaint(false); }} />}
            {showEdit && <VehicleModal vehicle={v} onClose={() => setShowEdit(false)} onSaved={() => { invalidate(); setShowEdit(false); }} />}
          </>
        )}
      </div>
    </div>
  );
}

function Fact({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
        <span className="text-slate-300">{icon}</span>{label}
      </p>
      <p className={`mt-0.5 text-sm font-semibold ${accent ? "text-amber-600" : "text-slate-800"}`}>{value}</p>
    </div>
  );
}

function FuelModal({ vehicleId, onClose, onSaved }: { vehicleId: number; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<FuelPayload>({ fuel_date: new Date().toISOString().split("T")[0], litres: 0, cost: 0 });
  const mutation = useMutation({ mutationFn: () => logFuel(vehicleId, form), onSuccess: onSaved });
  const set = <K extends keyof FuelPayload>(k: K, val: FuelPayload[K]) => setForm((f) => ({ ...f, [k]: val }));

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1a1d23]">Log Fuel</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Date</label>
              <input type="date" value={form.fuel_date} onChange={(e) => set("fuel_date", e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Litres</label>
              <input type="number" value={form.litres || ""} onChange={(e) => set("litres", Number(e.target.value))} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Cost (Rs.)</label>
              <input type="number" value={form.cost || ""} onChange={(e) => set("cost", Number(e.target.value))} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Odometer (km)</label>
              <input type="number" value={form.odometer ?? ""} onChange={(e) => set("odometer", e.target.value ? Number(e.target.value) : undefined)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Filled by</label>
            <input value={form.filled_by ?? ""} onChange={(e) => set("filled_by", e.target.value)} placeholder="Driver name" className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100">Cancel</button>
          <button onClick={() => form.litres > 0 && mutation.mutate()} disabled={mutation.isPending} className="rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a2e37] disabled:opacity-50">
            {mutation.isPending ? "Saving..." : "Log"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MaintModal({ vehicleId, onClose, onSaved }: { vehicleId: number; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<VehicleMaintenancePayload>({ service_date: new Date().toISOString().split("T")[0], description: "" });
  const mutation = useMutation({ mutationFn: () => logVehicleMaintenance(vehicleId, form), onSuccess: onSaved });
  const set = <K extends keyof VehicleMaintenancePayload>(k: K, val: VehicleMaintenancePayload[K]) => setForm((f) => ({ ...f, [k]: val }));

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1a1d23]">Log Service</h2>
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
            Mark vehicle as under maintenance
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

function VehicleModal({ vehicle, onClose, onSaved }: { vehicle: Vehicle | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!vehicle;
  const [form, setForm] = useState<VehiclePayload>({
    registration_no: vehicle?.registration_no ?? "",
    make: vehicle?.make ?? "",
    model: vehicle?.model ?? "",
    type: vehicle?.type ?? "",
    ownership: vehicle?.ownership ?? "owned",
    purchase_cost: vehicle?.purchase_cost ? Number(vehicle.purchase_cost) : undefined,
    rental_rate: vehicle?.rental_rate ? Number(vehicle.rental_rate) : undefined,
    status: vehicle?.status ?? "available",
    is_active: vehicle?.is_active ?? true,
  });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () => isEdit ? updateVehicle(vehicle!.id, form) : createVehicle(form),
    onSuccess: onSaved,
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message ?? "Failed to save.");
    },
  });
  const set = <K extends keyof VehiclePayload>(k: K, val: VehiclePayload[K]) => setForm((f) => ({ ...f, [k]: val }));

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1a1d23]">{isEdit ? "Edit Vehicle" : "Add Vehicle"}</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-4 space-y-3">
          {error && <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</div>}
          <Inp label="Registration No" value={form.registration_no} onChange={(v) => set("registration_no", v)} placeholder="BA 2 KHA 1234" />
          <div className="grid grid-cols-3 gap-3">
            <Inp label="Make" value={form.make ?? ""} onChange={(v) => set("make", v)} placeholder="Tata" />
            <Inp label="Model" value={form.model ?? ""} onChange={(v) => set("model", v)} placeholder="LPT 1109" />
            <Inp label="Type" value={form.type ?? ""} onChange={(v) => set("type", v)} placeholder="Tipper" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Ownership</label>
              <select value={form.ownership} onChange={(e) => set("ownership", e.target.value as VehiclePayload["ownership"])} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white">
                <option value="owned">Owned</option>
                <option value="rented">Rented</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value as VehiclePayload["status"])} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white">
                {Object.entries(STATUS).map(([k, val]) => <option key={k} value={k}>{val.label}</option>)}
              </select>
            </div>
          </div>
          {form.ownership === "owned" ? (
            <Inp label="Purchase Cost" type="number" value={form.purchase_cost?.toString() ?? ""} onChange={(v) => set("purchase_cost", v ? Number(v) : undefined)} />
          ) : (
            <Inp label="Rental Rate" type="number" value={form.rental_rate?.toString() ?? ""} onChange={(v) => set("rental_rate", v ? Number(v) : undefined)} />
          )}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100">Cancel</button>
          <button onClick={() => form.registration_no && mutation.mutate()} disabled={mutation.isPending} className="rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a2e37] disabled:opacity-50">
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

export default function VehiclesPage() {
  return (
    <PermissionGuard permission="vehicles.view">
      <VehiclesContent />
    </PermissionGuard>
  );
}