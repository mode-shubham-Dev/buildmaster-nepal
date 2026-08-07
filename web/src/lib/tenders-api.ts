import api from "./api";

export type TenderStatus =
  | "identified"
  | "preparing"
  | "submitted"
  | "won"
  | "lost"
  | "cancelled";

export interface Tender {
  id: number;
  title: string;
  reference_no: string | null;
  issuing_authority: string | null;
  estimated_value: string | null;
  bid_amount: string | null;
  bid_security: string | null;
  published_date: string | null;
  submission_deadline: string | null;
  submitted_date: string | null;
  status: TenderStatus;
  scope: string | null;
  notes: string | null;
  client?: { id: number; name: string } | null;
  created_at: string;
}

export interface TenderFilters {
  search?: string;
  status?: string;
}

export async function fetchTenders(
  filters: TenderFilters = {},
): Promise<Tender[]> {
  const res = await api.get("/tenders", { params: filters });
  return res.data.tenders;
}

export async function fetchTender(id: number): Promise<Tender> {
  const res = await api.get(`/tenders/${id}`);
  return res.data.tender;
}

export async function createTender(payload: Partial<Tender>): Promise<Tender> {
  const res = await api.post("/tenders", payload);
  return res.data.tender;
}

export async function updateTender(
  id: number,
  payload: Partial<Tender>,
): Promise<Tender> {
  const res = await api.put(`/tenders/${id}`, payload);
  return res.data.tender;
}

export async function deleteTender(id: number): Promise<void> {
  await api.delete(`/tenders/${id}`);
}
