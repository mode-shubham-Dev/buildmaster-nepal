import api from "./api";

export interface BoqItem {
  id: number;
  project_id: number;
  category: string | null;
  item_code: string | null;
  description: string;
  unit: string;
  quantity: string;
  rate: string;
  amount: string;
  sort_order: number;
}

export interface BoqResponse {
  items: BoqItem[];
  total: number;
}

export interface BoqItemPayload {
  category?: string;
  item_code?: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
}

export async function fetchBoq(projectId: number): Promise<BoqResponse> {
  const res = await api.get(`/projects/${projectId}/boq`);
  return res.data;
}

export async function addBoqItem(
  projectId: number,
  payload: BoqItemPayload,
): Promise<BoqItem> {
  const res = await api.post(`/projects/${projectId}/boq`, payload);
  return res.data.item;
}

export async function updateBoqItem(
  itemId: number,
  payload: BoqItemPayload,
): Promise<BoqItem> {
  const res = await api.put(`/boq/${itemId}`, payload);
  return res.data.item;
}

export async function deleteBoqItem(itemId: number): Promise<void> {
  await api.delete(`/boq/${itemId}`);
}
