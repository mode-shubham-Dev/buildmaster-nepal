import api from "./api";

export interface Attachment {
  id: number;
  collection: string;
  original_name: string;
  url: string;
  mime_type: string | null;
  size: number;
}

export type MilestoneStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "delayed";

export interface Milestone {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  budget: string | null;
  deadline: string | null;
  completion_percentage: number;
  status: MilestoneStatus;
  sort_order: number;
  attachments?: Attachment[];
}

export interface MilestonePayload {
  title: string;
  description?: string;
  budget?: number;
  deadline?: string;
  completion_percentage?: number;
  status: MilestoneStatus;
  sort_order?: number;
}

export async function fetchMilestones(projectId: number): Promise<Milestone[]> {
  const res = await api.get(`/projects/${projectId}/milestones`);
  return res.data.milestones;
}

export async function addMilestone(
  projectId: number,
  payload: MilestonePayload,
): Promise<Milestone> {
  const res = await api.post(`/projects/${projectId}/milestones`, payload);
  return res.data.milestone;
}

export async function updateMilestone(
  milestoneId: number,
  payload: Partial<MilestonePayload>,
): Promise<Milestone> {
  const res = await api.put(`/milestones/${milestoneId}`, payload);
  return res.data.milestone;
}

export async function deleteMilestone(milestoneId: number): Promise<void> {
  await api.delete(`/milestones/${milestoneId}`);
}

/**
 * Upload an image to a milestone. Uses FormData (multipart), not JSON.
 */
export async function uploadMilestoneImage(
  milestoneId: number,
  file: File,
): Promise<Attachment> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await api.post(`/milestones/${milestoneId}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.attachment;
}

export async function deleteAttachment(attachmentId: number): Promise<void> {
  await api.delete(`/attachments/${attachmentId}`);
}
