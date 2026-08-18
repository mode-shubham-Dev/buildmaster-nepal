import api from "./api";
import type { Attachment } from "./milestones-api";

export interface DocumentCategory {
  id: number;
  name: string;
  color: string | null;
  is_active: boolean;
}

export interface Document {
  id: number;
  document_category_id: number | null;
  project_id: number | null;
  title: string;
  description: string | null;
  document_date: string | null;
  expiry_date: string | null;
  is_expiring_soon: boolean;
  category?: { id: number; name: string; color: string | null } | null;
  project?: { id: number; name: string } | null;
  uploader?: { id: number; name: string } | null;
  attachments?: Attachment[];
}

export interface DocumentFilters {
  search?: string;
  category_id?: number;
  project_id?: number;
  expiring?: number;
}

export async function fetchDocumentCategories(): Promise<DocumentCategory[]> {
  const res = await api.get("/document-categories");
  return res.data.categories;
}

export async function fetchDocuments(
  filters: DocumentFilters = {},
): Promise<Document[]> {
  const res = await api.get("/documents", { params: filters });
  return res.data.documents;
}

export async function createDocument(formData: FormData): Promise<Document> {
  const res = await api.post("/documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.document;
}

export async function updateDocument(
  id: number,
  payload: Partial<Document>,
): Promise<Document> {
  const res = await api.put(`/documents/${id}`, payload);
  return res.data.document;
}

export async function deleteDocument(id: number): Promise<void> {
  await api.delete(`/documents/${id}`);
}
