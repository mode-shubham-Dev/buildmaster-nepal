import api from "./api";

export type VehicleStatus = "available" | "in_use" | "maintenance" | "retired";
export type Ownership = "owned" | "rented";

export interface FuelLog {
  id: number;
  vehicle_id: number;
  fuel_date: string;
  litres: string;
  cost: string;
  odometer: number | null;
  filled_by: string | null;
}

export interface VehicleMaintenanceLog {
  id: number;
  vehicle_id: number;
  service_date: string;
  type: string | null;
  description: string;
  cost: string;
  next_service_date: string | null;
}

export interface Vehicle {
  id: number;
  registration_no: string;
  make: string | null;
  model: string | null;
  type: string | null;
  ownership: Ownership;
  purchase_cost: string | null;
  rental_rate: string | null;
  status: VehicleStatus;
  project_id: number | null;
  notes: string | null;
  is_active: boolean;
  total_fuel_cost: number;
  total_maintenance_cost: number;
  project?: { id: number; name: string; project_code: string } | null;
  fuelLogs?: FuelLog[];
  fuel_logs?: FuelLog[];
  maintenanceLogs?: VehicleMaintenanceLog[];
  maintenance_logs?: VehicleMaintenanceLog[];
}

export interface VehiclePayload {
  registration_no: string;
  make?: string;
  model?: string;
  type?: string;
  ownership: Ownership;
  purchase_cost?: number | null;
  rental_rate?: number | null;
  status: VehicleStatus;
  project_id?: number | null;
  notes?: string;
  is_active?: boolean;
}

export interface FuelPayload {
  fuel_date: string;
  litres: number;
  cost: number;
  odometer?: number;
  filled_by?: string;
}

export interface VehicleMaintenancePayload {
  service_date: string;
  type?: string;
  description: string;
  cost?: number;
  next_service_date?: string;
  set_maintenance?: boolean;
}

export interface VehicleFilters {
  search?: string;
  status?: string;
}

export async function fetchVehicles(
  filters: VehicleFilters = {},
): Promise<Vehicle[]> {
  const res = await api.get("/vehicles", { params: filters });
  return res.data.vehicles;
}

export async function fetchVehicleItem(id: number): Promise<Vehicle> {
  const res = await api.get(`/vehicles/${id}`);
  return res.data.vehicle;
}

export async function createVehicle(payload: VehiclePayload): Promise<Vehicle> {
  const res = await api.post("/vehicles", payload);
  return res.data.vehicle;
}

export async function updateVehicle(
  id: number,
  payload: VehiclePayload,
): Promise<Vehicle> {
  const res = await api.put(`/vehicles/${id}`, payload);
  return res.data.vehicle;
}

export async function deleteVehicle(id: number): Promise<void> {
  await api.delete(`/vehicles/${id}`);
}

export async function assignVehicle(
  id: number,
  projectId: number | null,
): Promise<Vehicle> {
  const res = await api.post(`/vehicles/${id}/assign`, {
    project_id: projectId,
  });
  return res.data.vehicle;
}

export async function logFuel(id: number, payload: FuelPayload): Promise<void> {
  await api.post(`/vehicles/${id}/fuel`, payload);
}

export async function logVehicleMaintenance(
  id: number,
  payload: VehicleMaintenancePayload,
): Promise<void> {
  await api.post(`/vehicles/${id}/maintenance`, payload);
}

export async function deleteFuelLog(fuelLogId: number): Promise<void> {
  await api.delete(`/vehicle-fuel-logs/${fuelLogId}`);
}

export async function deleteVehicleMaintenance(
  maintenanceId: number,
): Promise<void> {
  await api.delete(`/vehicle-maintenance/${maintenanceId}`);
}
