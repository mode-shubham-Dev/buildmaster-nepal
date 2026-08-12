import api from "./api";

export type POStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "received"
  | "rejected"
  | "cancelled";

export interface Supplier {
  id: number;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  pan_vat_no: string | null;
  address: string | null;
  is_active: boolean;
}

export interface POItem {
  id: number;
  material_id: number;
  quantity: string;
  rate: string;
  amount: string;
  material?: { id: number; name: string; unit: string } | null;
}

export interface PurchaseOrder {
  id: number;
  po_number: string;
  status: POStatus;
  subtotal: string;
  vat_percentage: string;
  vat_amount: string;
  total: string;
  order_date: string | null;
  expected_delivery: string | null;
  notes: string | null;
  supplier?: { id: number; name: string } | null;
  warehouse?: { id: number; name: string } | null;
  project?: { id: number; name: string; project_code: string } | null;
  items?: POItem[];
  items_count?: number;
  creator?: { id: number; name: string } | null;
  approver?: { id: number; name: string } | null;
  created_at: string;
}

export interface POItemInput {
  material_id: number;
  quantity: number;
  rate: number;
}

export interface POPayload {
  po_number: string;
  supplier_id?: number | null;
  warehouse_id?: number | null;
  project_id?: number | null;
  vat_percentage?: number;
  order_date?: string;
  expected_delivery?: string;
  notes?: string;
  items: POItemInput[];
}

// Suppliers
export async function fetchSuppliers(search?: string): Promise<Supplier[]> {
  const res = await api.get("/suppliers", {
    params: { search: search || undefined },
  });
  return res.data.suppliers;
}

export async function createSupplier(
  payload: Partial<Supplier>,
): Promise<Supplier> {
  const res = await api.post("/suppliers", payload);
  return res.data.supplier;
}

export async function deleteSupplier(id: number): Promise<void> {
  await api.delete(`/suppliers/${id}`);
}

// Purchase orders
export interface POFilters {
  search?: string;
  status?: string;
}

export async function fetchPurchaseOrders(
  filters: POFilters = {},
): Promise<PurchaseOrder[]> {
  const res = await api.get("/purchase-orders", { params: filters });
  return res.data.orders;
}

export async function fetchPurchaseOrder(id: number): Promise<PurchaseOrder> {
  const res = await api.get(`/purchase-orders/${id}`);
  return res.data.order;
}

export async function createPurchaseOrder(
  payload: POPayload,
): Promise<PurchaseOrder> {
  const res = await api.post("/purchase-orders", payload);
  return res.data.order;
}

export async function deletePurchaseOrder(id: number): Promise<void> {
  await api.delete(`/purchase-orders/${id}`);
}

// Workflow transitions
export async function submitPO(id: number): Promise<void> {
  await api.post(`/purchase-orders/${id}/submit`);
}
export async function approvePO(id: number): Promise<void> {
  await api.post(`/purchase-orders/${id}/approve`);
}
export async function rejectPO(id: number): Promise<void> {
  await api.post(`/purchase-orders/${id}/reject`);
}
export async function cancelPO(id: number): Promise<void> {
  await api.post(`/purchase-orders/${id}/cancel`);
}
export async function receivePO(id: number): Promise<void> {
  await api.post(`/purchase-orders/${id}/receive`);
}
