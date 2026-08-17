import api from "./api";

export type AttendanceStatus =
  | "present"
  | "absent"
  | "half_day"
  | "on_leave"
  | "holiday";

export interface RosterEmployee {
  id: number;
  first_name: string;
  last_name: string;
  employee_code: string;
  job_title: string | null;
}

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  date: string;
  status: AttendanceStatus;
  check_in: string | null;
  check_out: string | null;
  project_id: number | null;
  remarks: string | null;
  hours_worked: number;
  project?: { id: number; name: string } | null;
}

export interface RosterRow {
  employee: RosterEmployee;
  attendance: AttendanceRecord | null;
}

export interface RosterResponse {
  date: string;
  roster: RosterRow[];
}

export interface MarkEntry {
  employee_id: number;
  status: AttendanceStatus;
  check_in?: string;
  check_out?: string;
  project_id?: number | null;
  remarks?: string;
}

export async function fetchRoster(date?: string): Promise<RosterResponse> {
  const res = await api.get("/attendance/roster", {
    params: { date: date || undefined },
  });
  return res.data;
}

export async function markAttendance(
  date: string,
  entries: MarkEntry[],
): Promise<void> {
  await api.post("/attendance/mark", { date, entries });
}

export async function fetchEmployeeAttendance(
  employeeId: number,
): Promise<{ records: AttendanceRecord[]; summary: Record<string, number> }> {
  const res = await api.get(`/employees/${employeeId}/attendance`);
  return res.data;
}
