import api from "./api";

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  location: string | null;
  project_id: number | null;
  is_active: boolean;
  project?: { id: number; name: string; project_code: string } | null;
  created_at: string;
}

export interface StockLevel {
  warehouse_id: number;
  material_id: number;
  material_name: string | null;
  material_code: string | null;
  unit: string | null;
  balance: number;
  reorder_level: number;
  low_stock: boolean;
}

export interface StockMovement {
  id: number;
  warehouse_id: number;
  material_id: number;
  type: "in" | "out";
  quantity: string;
  unit_cost: string | null;
  reason:
    | "purchase"
    | "issue_to_project"
    | "return"
    | "adjustment"
    | "transfer";
  reference: string | null;
  remarks: string | null;
  moved_at: string;
  material?: { id: number; name: string; unit: string } | null;
  warehouse?: { id: number; name: string } | null;
  mover?: { id: number; name: string } | null;
  project?: { id: number; name: string } | null;
}

export interface WarehousePayload {
  name: string;
  code: string;
  location?: string;
  project_id?: number | null;
  is_active?: boolean;
}

export interface MovementPayload {
  warehouse_id: number;
  material_id: number;
  type: "in" | "out";
  quantity: number;
  unit_cost?: number;
  reason:
    | "purchase"
    | "issue_to_project"
    | "return"
    | "adjustment"
    | "transfer";
  project_id?: number | null;
  reference?: string;
  remarks?: string;
}

// Warehouses
export async function fetchWarehouses(search?: string): Promise<Warehouse[]> {
  const res = await api.get("/warehouses", {
    params: { search: search || undefined },
  });
  return res.data.warehouses;
}

export async function createWarehouse(
  payload: WarehousePayload,
): Promise<Warehouse> {
  const res = await api.post("/warehouses", payload);
  return res.data.warehouse;
}

export async function updateWarehouse(
  id: number,
  payload: WarehousePayload,
): Promise<Warehouse> {
  const res = await api.put(`/warehouses/${id}`, payload);
  return res.data.warehouse;
}

export async function deleteWarehouse(id: number): Promise<void> {
  await api.delete(`/warehouses/${id}`);
}

// Stock
export async function fetchStockLevels(
  warehouseId?: number,
): Promise<StockLevel[]> {
  const res = await api.get("/stock/levels", {
    params: { warehouse_id: warehouseId || undefined },
  });
  return res.data.levels;
}

export async function fetchStockMovements(
  filters: { warehouse_id?: number; material_id?: number } = {},
): Promise<StockMovement[]> {
  const res = await api.get("/stock/movements", { params: filters });
  return res.data.movements;
}

export async function recordMovement(
  payload: MovementPayload,
): Promise<StockMovement> {
  const res = await api.post("/stock/movements", payload);
  return res.data.movement;
}
