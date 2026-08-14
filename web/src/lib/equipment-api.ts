import api from "./api";

export type EquipmentStatus =
  | "available"
  | "in_use"
  | "maintenance"
  | "retired";
export type Ownership = "owned" | "rented";

export interface MaintenanceLog {
  id: number;
  equipment_id: number;
  service_date: string;
  type: string | null;
  description: string;
  cost: string;
  next_service_date: string | null;
}

export interface Equipment {
  id: number;
  code: string;
  name: string;
  category: string | null;
  ownership: Ownership;
  purchase_cost: string | null;
  rental_rate: string | null;
  purchase_date: string | null;
  status: EquipmentStatus;
  project_id: number | null;
  notes: string | null;
  is_active: boolean;
  total_maintenance_cost: number;
  project?: { id: number; name: string; project_code: string } | null;
  maintenanceLogs?: MaintenanceLog[];
  maintenance_logs?: MaintenanceLog[];
}

export interface EquipmentPayload {
  code: string;
  name: string;
  category?: string;
  ownership: Ownership;
  purchase_cost?: number | null;
  rental_rate?: number | null;
  purchase_date?: string;
  status: EquipmentStatus;
  project_id?: number | null;
  notes?: string;
  is_active?: boolean;
}

export interface MaintenancePayload {
  service_date: string;
  type?: string;
  description: string;
  cost?: number;
  next_service_date?: string;
  set_maintenance?: boolean;
}

export interface EquipmentFilters {
  search?: string;
  status?: string;
  category?: string;
}

export async function fetchEquipment(
  filters: EquipmentFilters = {},
): Promise<Equipment[]> {
  const res = await api.get("/equipment", { params: filters });
  return res.data.equipment;
}

export async function fetchEquipmentItem(id: number): Promise<Equipment> {
  const res = await api.get(`/equipment/${id}`);
  return res.data.equipment;
}

export async function createEquipment(
  payload: EquipmentPayload,
): Promise<Equipment> {
  const res = await api.post("/equipment", payload);
  return res.data.equipment;
}

export async function updateEquipment(
  id: number,
  payload: EquipmentPayload,
): Promise<Equipment> {
  const res = await api.put(`/equipment/${id}`, payload);
  return res.data.equipment;
}

export async function deleteEquipment(id: number): Promise<void> {
  await api.delete(`/equipment/${id}`);
}

export async function assignEquipment(
  id: number,
  projectId: number | null,
): Promise<Equipment> {
  const res = await api.post(`/equipment/${id}/assign`, {
    project_id: projectId,
  });
  return res.data.equipment;
}

export async function logMaintenance(
  id: number,
  payload: MaintenancePayload,
): Promise<void> {
  await api.post(`/equipment/${id}/maintenance`, payload);
}

export async function deleteMaintenance(maintenanceId: number): Promise<void> {
  await api.delete(`/equipment-maintenance/${maintenanceId}`);
}
