import api from "./api";

export interface Company {
  id: number;
  name: string;
  legal_name: string | null;
  registration_no: string | null;
  pan_vat_no: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
}

export interface Branch {
  id: number;
  name: string;
  code: string | null;
  phone: string | null;
  address: string | null;
  is_head_office: boolean;
  departments_count?: number;
}

export interface Department {
  id: number;
  branch_id: number;
  name: string;
  description: string | null;
  teams_count?: number;
  branch?: Branch;
}

export interface Team {
  id: number;
  department_id: number;
  name: string;
  description: string | null;
  department?: Department;
}

export interface OfficeLocation {
  id: number;
  name: string;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
}

// Company
export async function fetchCompany(): Promise<Company> {
  const res = await api.get("/company");
  return res.data.company;
}

export async function updateCompany(
  payload: Partial<Company>,
): Promise<Company> {
  const res = await api.put("/company", payload);
  return res.data.company;
}

// Branches
export async function fetchBranches(): Promise<Branch[]> {
  const res = await api.get("/branches");
  return res.data.branches;
}

export async function createBranch(payload: Partial<Branch>): Promise<Branch> {
  const res = await api.post("/branches", payload);
  return res.data.branch;
}

export async function updateBranch(
  id: number,
  payload: Partial<Branch>,
): Promise<Branch> {
  const res = await api.put(`/branches/${id}`, payload);
  return res.data.branch;
}

export async function deleteBranch(id: number): Promise<void> {
  await api.delete(`/branches/${id}`);
}

// Departments
export async function fetchDepartments(): Promise<Department[]> {
  const res = await api.get("/departments");
  return res.data.departments;
}

export async function createDepartment(
  payload: Partial<Department>,
): Promise<Department> {
  const res = await api.post("/departments", payload);
  return res.data.department;
}

export async function updateDepartment(
  id: number,
  payload: Partial<Department>,
): Promise<Department> {
  const res = await api.put(`/departments/${id}`, payload);
  return res.data.department;
}

export async function deleteDepartment(id: number): Promise<void> {
  await api.delete(`/departments/${id}`);
}

// Teams
export async function fetchTeams(): Promise<Team[]> {
  const res = await api.get("/teams");
  return res.data.teams;
}

export async function createTeam(payload: Partial<Team>): Promise<Team> {
  const res = await api.post("/teams", payload);
  return res.data.team;
}

export async function updateTeam(
  id: number,
  payload: Partial<Team>,
): Promise<Team> {
  const res = await api.put(`/teams/${id}`, payload);
  return res.data.team;
}

export async function deleteTeam(id: number): Promise<void> {
  await api.delete(`/teams/${id}`);
}

// Office Locations
export async function fetchOfficeLocations(): Promise<OfficeLocation[]> {
  const res = await api.get("/office-locations");
  return res.data.office_locations;
}

export async function createOfficeLocation(
  payload: Partial<OfficeLocation>,
): Promise<OfficeLocation> {
  const res = await api.post("/office-locations", payload);
  return res.data.office_location;
}

export async function updateOfficeLocation(
  id: number,
  payload: Partial<OfficeLocation>,
): Promise<OfficeLocation> {
  const res = await api.put(`/office-locations/${id}`, payload);
  return res.data.office_location;
}

export async function deleteOfficeLocation(id: number): Promise<void> {
  await api.delete(`/office-locations/${id}`);
}
