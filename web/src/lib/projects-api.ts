import api from "./api";

export type ProjectStatus =
  | "planning"
  | "approval"
  | "execution"
  | "monitoring"
  | "completion"
  | "archived";

export interface ProjectMember {
  id: number;
  full_name: string;
  employee_code: string;
  role_on_project: string | null;
}

export interface Project {
  id: number;
  project_code: string;
  name: string;
  description: string | null;
  budget: string | null;
  contract_value: string | null;
  start_date: string | null;
  end_date: string | null;
  site_location: string | null;
  latitude: string | null;
  longitude: string | null;
  status: ProjectStatus;
  client?: { id: number; name: string } | null;
  tender?: { id: number; title: string } | null;
  project_manager?: { id: number; full_name: string } | null;
  members?: ProjectMember[];
  members_count?: number;
  created_at: string;
}

export interface ProjectFilters {
  search?: string;
  status?: string;
}

// Projects
export async function fetchProjects(
  filters: ProjectFilters = {},
): Promise<Project[]> {
  const res = await api.get("/projects", { params: filters });
  return res.data.projects;
}

export async function fetchProject(id: number): Promise<Project> {
  const res = await api.get(`/projects/${id}`);
  return res.data.project;
}

export async function createProject(
  payload: Partial<Project>,
): Promise<Project> {
  const res = await api.post("/projects", payload);
  return res.data.project;
}

export async function updateProject(
  id: number,
  payload: Partial<Project>,
): Promise<Project> {
  const res = await api.put(`/projects/${id}`, payload);
  return res.data.project;
}

export async function deleteProject(id: number): Promise<void> {
  await api.delete(`/projects/${id}`);
}

// Team members
export async function assignMember(
  projectId: number,
  payload: { employee_id: number; role_on_project?: string },
): Promise<void> {
  await api.post(`/projects/${projectId}/members`, payload);
}

export async function removeMember(
  projectId: number,
  employeeId: number,
): Promise<void> {
  await api.delete(`/projects/${projectId}/members/${employeeId}`);
}
