import api from "./api";

export interface Skill {
  id: number;
  name: string;
  proficiency: "beginner" | "intermediate" | "expert";
}

export interface Certification {
  id: number;
  name: string;
  issuing_authority: string | null;
  issue_date: string | null;
  expiry_date: string | null;
}

export interface EmergencyContact {
  id: number;
  name: string;
  relationship: string | null;
  phone: string;
  address: string | null;
}

export interface Employee {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: "male" | "female" | "other" | null;
  address: string | null;
  job_title: string | null;
  employment_type: "full_time" | "part_time" | "contract" | "daily_wage";
  joining_date: string | null;
  basic_salary: string | null;
  status: "active" | "inactive" | "terminated";
  department?: { id: number; name: string } | null;
  skills?: Skill[];
  certifications?: Certification[];
  emergency_contacts?: EmergencyContact[];
  created_at: string;
}

export interface EmployeeFilters {
  search?: string;
  department_id?: number;
  status?: string;
}

// Employees
export async function fetchEmployees(
  filters: EmployeeFilters = {},
): Promise<Employee[]> {
  const res = await api.get("/employees", { params: filters });
  return res.data.employees;
}

export async function fetchEmployee(id: number): Promise<Employee> {
  const res = await api.get(`/employees/${id}`);
  return res.data.employee;
}

export async function createEmployee(
  payload: Partial<Employee>,
): Promise<Employee> {
  const res = await api.post("/employees", payload);
  return res.data.employee;
}

export async function updateEmployee(
  id: number,
  payload: Partial<Employee>,
): Promise<Employee> {
  const res = await api.put(`/employees/${id}`, payload);
  return res.data.employee;
}

export async function deleteEmployee(id: number): Promise<void> {
  await api.delete(`/employees/${id}`);
}

// Skills
export async function addSkill(
  employeeId: number,
  payload: Partial<Skill>,
): Promise<Skill> {
  const res = await api.post(`/employees/${employeeId}/skills`, payload);
  return res.data.skill;
}

export async function deleteSkill(skillId: number): Promise<void> {
  await api.delete(`/skills/${skillId}`);
}

// Certifications
export async function addCertification(
  employeeId: number,
  payload: Partial<Certification>,
): Promise<Certification> {
  const res = await api.post(
    `/employees/${employeeId}/certifications`,
    payload,
  );
  return res.data.certification;
}

export async function deleteCertification(certId: number): Promise<void> {
  await api.delete(`/certifications/${certId}`);
}

// Emergency Contacts
export async function addEmergencyContact(
  employeeId: number,
  payload: Partial<EmergencyContact>,
): Promise<EmergencyContact> {
  const res = await api.post(
    `/employees/${employeeId}/emergency-contacts`,
    payload,
  );
  return res.data.contact;
}

export async function deleteEmergencyContact(contactId: number): Promise<void> {
  await api.delete(`/emergency-contacts/${contactId}`);
}
