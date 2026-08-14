import api from "./api";

export interface SubPayment {
  id: number;
  work_package_id: number;
  amount: string;
  payment_date: string;
  method: "cash" | "bank_transfer" | "cheque";
  reference: string | null;
  remarks: string | null;
  payer?: { id: number; name: string } | null;
}

export type WorkPackageStatus =
  | "assigned"
  | "in_progress"
  | "completed"
  | "terminated";

export interface WorkPackage {
  id: number;
  subcontractor_id: number;
  project_id: number;
  title: string;
  scope: string | null;
  contract_amount: string;
  start_date: string | null;
  end_date: string | null;
  progress_percentage: number;
  status: WorkPackageStatus;
  total_paid: number;
  balance: number;
  subcontractor?: { id: number; name: string; specialty: string | null } | null;
  project?: { id: number; name: string; project_code: string } | null;
  payments?: SubPayment[];
}

export interface Subcontractor {
  id: number;
  name: string;
  specialty: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  pan_vat_no: string | null;
  address: string | null;
  rating: number | null;
  is_active: boolean;
  work_packages_count?: number;
  work_packages?: WorkPackage[];
  workPackages?: WorkPackage[];
}

export interface SubStats {
  total_packages: number;
  total_contract: number;
  total_paid: number;
  total_outstanding: number;
}

export interface SubProfile {
  subcontractor: Subcontractor;
  stats: SubStats;
}

export interface SubcontractorPayload {
  name: string;
  specialty?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  pan_vat_no?: string;
  address?: string;
  rating?: number | null;
  is_active?: boolean;
}

export interface WorkPackagePayload {
  subcontractor_id: number;
  project_id: number;
  title: string;
  scope?: string;
  contract_amount: number;
  start_date?: string;
  end_date?: string;
  progress_percentage?: number;
  status: WorkPackageStatus;
}

export interface PaymentPayload {
  amount: number;
  payment_date: string;
  method?: "cash" | "bank_transfer" | "cheque";
  reference?: string;
  remarks?: string;
}

// Subcontractors
export async function fetchSubcontractors(
  search?: string,
): Promise<Subcontractor[]> {
  const res = await api.get("/subcontractors", {
    params: { search: search || undefined },
  });
  return res.data.subcontractors;
}

export async function fetchSubcontractorProfile(
  id: number,
): Promise<SubProfile> {
  const res = await api.get(`/subcontractors/${id}`);
  return res.data;
}

export async function createSubcontractor(
  payload: SubcontractorPayload,
): Promise<Subcontractor> {
  const res = await api.post("/subcontractors", payload);
  return res.data.subcontractor;
}

export async function updateSubcontractor(
  id: number,
  payload: SubcontractorPayload,
): Promise<Subcontractor> {
  const res = await api.put(`/subcontractors/${id}`, payload);
  return res.data.subcontractor;
}

export async function deleteSubcontractor(id: number): Promise<void> {
  await api.delete(`/subcontractors/${id}`);
}

// Work packages
export async function fetchProjectWorkPackages(
  projectId: number,
): Promise<WorkPackage[]> {
  const res = await api.get(`/projects/${projectId}/work-packages`);
  return res.data.work_packages;
}

export async function createWorkPackage(
  payload: WorkPackagePayload,
): Promise<WorkPackage> {
  const res = await api.post("/work-packages", payload);
  return res.data.work_package;
}

export async function updateWorkPackage(
  id: number,
  payload: WorkPackagePayload,
): Promise<WorkPackage> {
  const res = await api.put(`/work-packages/${id}`, payload);
  return res.data.work_package;
}

export async function deleteWorkPackage(id: number): Promise<void> {
  await api.delete(`/work-packages/${id}`);
}

// Payments
export async function payWorkPackage(
  workPackageId: number,
  payload: PaymentPayload,
): Promise<void> {
  await api.post(`/work-packages/${workPackageId}/payments`, payload);
}

export async function deleteSubPayment(paymentId: number): Promise<void> {
  await api.delete(`/subcontractor-payments/${paymentId}`);
}
