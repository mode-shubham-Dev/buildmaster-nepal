import api from "./api";

export type BillStatus = "draft" | "submitted" | "approved" | "paid";

export interface BillingBasisItem {
  boq_item_id: number;
  category: string | null;
  item_code: string | null;
  description: string;
  unit: string;
  boq_quantity: number;
  rate: number;
  previously_billed: number;
  remaining: number;
}

export interface RaBillLine {
  id: number;
  ra_bill_id: number;
  boq_item_id: number;
  cumulative_qty: string;
  previous_qty: string;
  this_bill_qty: string;
  rate: string;
  amount: string;
  boq_item?: {
    id: number;
    description: string;
    unit: string;
    category: string | null;
    item_code: string | null;
  } | null;
}

export interface RaBillPayment {
  id: number;
  ra_bill_id: number;
  amount: string;
  payment_date: string;
  reference: string | null;
  remarks: string | null;
}

export interface RaBill {
  id: number;
  project_id: number;
  bill_no: number;
  bill_date: string;
  gross_amount: string;
  retention_percentage: string;
  retention_amount: string;
  vat_percentage: string;
  vat_amount: string;
  advance_recovery: string;
  net_payable: string;
  status: BillStatus;
  remarks: string | null;
  approved_at: string | null;
  total_paid: number;
  balance_due: number;
  project?: { id: number; name: string; project_code: string } | null;
  lines?: RaBillLine[];
  payments?: RaBillPayment[];
  creator?: { id: number; name: string } | null;
  approver?: { id: number; name: string } | null;
}

export interface BillLineInput {
  boq_item_id: number;
  cumulative_qty: number;
}

export interface BillPayload {
  project_id: number;
  bill_date: string;
  retention_percentage?: number;
  vat_percentage?: number;
  advance_recovery?: number;
  remarks?: string;
  lines: BillLineInput[];
}

export async function fetchRaBills(
  filters: { project_id?: number; status?: string } = {},
): Promise<RaBill[]> {
  const res = await api.get("/ra-bills", { params: filters });
  return res.data.bills;
}

export async function fetchRaBill(id: number): Promise<RaBill> {
  const res = await api.get(`/ra-bills/${id}`);
  return res.data.bill;
}

export async function fetchBillingBasis(
  projectId: number,
): Promise<BillingBasisItem[]> {
  const res = await api.get(`/projects/${projectId}/billing-basis`);
  return res.data.basis;
}

export async function createRaBill(payload: BillPayload): Promise<RaBill> {
  const res = await api.post("/ra-bills", payload);
  return res.data.bill;
}

export async function transitionRaBill(
  id: number,
  status: BillStatus,
): Promise<void> {
  await api.post(`/ra-bills/${id}/transition`, { status });
}

export async function recordBillPayment(
  id: number,
  amount: number,
  paymentDate: string,
  reference?: string,
): Promise<void> {
  await api.post(`/ra-bills/${id}/payments`, {
    amount,
    payment_date: paymentDate,
    reference,
  });
}

export async function deleteRaBill(id: number): Promise<void> {
  await api.delete(`/ra-bills/${id}`);
}
