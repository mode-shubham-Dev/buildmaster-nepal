import api from "./api";
import type { Attachment } from "./milestones-api";

export interface SiteReport {
  id: number;
  project_id: number;
  reported_by: number | null;
  report_date: string;
  work_done: string;
  workers_present: number;
  weather: string | null;
  progress_percentage: number | null;
  materials_used: string | null;
  issues: string | null;
  reporter?: { id: number; name: string } | null;
  attachments?: Attachment[];
  created_at: string;
}

export interface SiteReportPayload {
  report_date: string;
  work_done: string;
  workers_present?: number;
  weather?: string;
  progress_percentage?: number;
  materials_used?: string;
  issues?: string;
}

export async function fetchSiteReports(
  projectId: number,
): Promise<SiteReport[]> {
  const res = await api.get(`/projects/${projectId}/site-reports`);
  return res.data.reports;
}

export async function addSiteReport(
  projectId: number,
  payload: SiteReportPayload,
): Promise<SiteReport> {
  const res = await api.post(`/projects/${projectId}/site-reports`, payload);
  return res.data.report;
}

export async function updateSiteReport(
  reportId: number,
  payload: Partial<SiteReportPayload>,
): Promise<SiteReport> {
  const res = await api.put(`/site-reports/${reportId}`, payload);
  return res.data.report;
}

export async function deleteSiteReport(reportId: number): Promise<void> {
  await api.delete(`/site-reports/${reportId}`);
}

export async function uploadReportPhoto(
  reportId: number,
  file: File,
): Promise<Attachment> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await api.post(`/site-reports/${reportId}/photos`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.attachment;
}
