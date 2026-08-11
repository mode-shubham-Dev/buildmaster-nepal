import api from "./api";

export interface MaterialCategory {
  id: number;
  name: string;
  description: string | null;
  materials_count?: number;
}

export interface Material {
  id: number;
  code: string;
  name: string;
  description: string | null;
  unit: string;
  unit_cost: string;
  reorder_level: string;
  is_active: boolean;
  category?: { id: number; name: string } | null;
  created_at: string;
}

export interface MaterialFilters {
  search?: string;
  category_id?: number;
}

export interface MaterialPayload {
  material_category_id?: number | null;
  code: string;
  name: string;
  description?: string;
  unit: string;
  unit_cost?: number;
  reorder_level?: number;
  is_active?: boolean;
}

// Materials
export async function fetchMaterials(
  filters: MaterialFilters = {},
): Promise<Material[]> {
  const res = await api.get("/materials", { params: filters });
  return res.data.materials;
}

export async function createMaterial(
  payload: MaterialPayload,
): Promise<Material> {
  const res = await api.post("/materials", payload);
  return res.data.material;
}

export async function updateMaterial(
  id: number,
  payload: MaterialPayload,
): Promise<Material> {
  const res = await api.put(`/materials/${id}`, payload);
  return res.data.material;
}

export async function deleteMaterial(id: number): Promise<void> {
  await api.delete(`/materials/${id}`);
}

// Categories
export async function fetchMaterialCategories(): Promise<MaterialCategory[]> {
  const res = await api.get("/material-categories");
  return res.data.categories;
}

export async function createMaterialCategory(payload: {
  name: string;
  description?: string;
}): Promise<MaterialCategory> {
  const res = await api.post("/material-categories", payload);
  return res.data.category;
}

export async function deleteMaterialCategory(id: number): Promise<void> {
  await api.delete(`/material-categories/${id}`);
}
