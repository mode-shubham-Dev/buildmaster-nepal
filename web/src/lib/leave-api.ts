import api from "./api";

export type LeaveStatus = "pending" | "approved" | "rejected";

export interface LeaveType {
  id: number;
  name: string;
  is_paid: boolean;
  annual_quota: number | null;
  is_active: boolean;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type_id: number;
  from_date: string;
  to_date: string;
  reason: string | null;
  status: LeaveStatus;
  days: number;
  action_remarks: string | null;
  actioned_at: string | null;
  employee?: {
    id: number;
    first_name: string;
    last_name: string;
    employee_code: string;
  } | null;
  leave_type?: { id: number; name: string; is_paid: boolean } | null;
  approver?: { id: number; name: string } | null;
}

export interface LeavePayload {
  employee_id: number;
  leave_type_id: number;
  from_date: string;
  to_date: string;
  reason?: string;
}

export async function fetchLeaveTypes(): Promise<LeaveType[]> {
  const res = await api.get("/leave-types");
  return res.data.types;
}

export async function fetchLeaveRequests(
  status?: string,
): Promise<LeaveRequest[]> {
  const res = await api.get("/leave-requests", {
    params: { status: status || undefined },
  });
  return res.data.requests;
}

export async function createLeaveRequest(
  payload: LeavePayload,
): Promise<LeaveRequest> {
  const res = await api.post("/leave-requests", payload);
  return res.data.request;
}

export async function actionLeaveRequest(
  id: number,
  status: "approved" | "rejected",
  remarks?: string,
): Promise<void> {
  await api.post(`/leave-requests/${id}/action`, {
    status,
    action_remarks: remarks,
  });
}

export async function deleteLeaveRequest(id: number): Promise<void> {
  await api.delete(`/leave-requests/${id}`);
}
