import api from "./api";
import type { Attachment } from "./milestones-api";

export interface SupplierContact {
  id: number;
  name: string;
  designation: string | null;
  phone: string | null;
  email: string | null;
  is_primary: boolean;
}

export interface Supplier {
  id: number;
  name: string;
  category: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  pan_vat_no: string | null;
  address: string | null;
  is_active: boolean;
  rating: number | null;
  payment_terms: string | null;
  bank_name: string | null;
  bank_account: string | null;
  purchase_orders_count?: number;
  contacts?: SupplierContact[];
  attachments?: Attachment[];
}

export interface PurchaseHistoryItem {
  id: number;
  po_number: string;
  status: string;
  total: string;
  order_date: string | null;
}

export interface SupplierStats {
  total_orders: number;
  received_orders: number;
  total_value: number;
}

export interface SupplierProfile {
  supplier: Supplier;
  purchase_history: PurchaseHistoryItem[];
  stats: SupplierStats;
}

export interface SupplierPayload {
  name: string;
  category?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  pan_vat_no?: string;
  address?: string;
  is_active?: boolean;
  rating?: number | null;
  payment_terms?: string;
  bank_name?: string;
  bank_account?: string;
}

export interface SupplierFilters {
  search?: string;
  category?: string;
}

export async function fetchSuppliers(
  filters: SupplierFilters = {},
): Promise<Supplier[]> {
  const res = await api.get("/suppliers", { params: filters });
  return res.data.suppliers;
}

export async function fetchSupplierProfile(
  id: number,
): Promise<SupplierProfile> {
  const res = await api.get(`/suppliers/${id}`);
  return res.data;
}

export async function createSupplier(
  payload: SupplierPayload,
): Promise<Supplier> {
  const res = await api.post("/suppliers", payload);
  return res.data.supplier;
}

export async function updateSupplier(
  id: number,
  payload: SupplierPayload,
): Promise<Supplier> {
  const res = await api.put(`/suppliers/${id}`, payload);
  return res.data.supplier;
}

export async function deleteSupplier(id: number): Promise<void> {
  await api.delete(`/suppliers/${id}`);
}

export async function addSupplierContact(
  supplierId: number,
  payload: Partial<SupplierContact>,
): Promise<SupplierContact> {
  const res = await api.post(`/suppliers/${supplierId}/contacts`, payload);
  return res.data.contact;
}

export async function deleteSupplierContact(contactId: number): Promise<void> {
  await api.delete(`/supplier-contacts/${contactId}`);
}

export async function uploadSupplierDocument(
  supplierId: number,
  file: File,
): Promise<Attachment> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post(`/suppliers/${supplierId}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.attachment;
}
