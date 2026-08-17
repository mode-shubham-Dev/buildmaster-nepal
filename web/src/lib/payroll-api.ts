import api from "./api";

export type RunStatus = "draft" | "finalized";

export interface PayslipLine {
  id: number;
  payslip_id: number;
  type: "allowance" | "deduction";
  label: string;
  amount: string;
}

export interface Payslip {
  id: number;
  payroll_run_id: number;
  employee_id: number;
  basic_salary: string;
  total_allowances: string;
  overtime_amount: string;
  gross_pay: string;
  unpaid_leave_deduction: string;
  tax_amount: string;
  other_deductions: string;
  total_deductions: string;
  net_pay: string;
  unpaid_leave_days: number;
  tax_rate: string;
  employee?: {
    id: number;
    first_name: string;
    last_name: string;
    employee_code: string;
  } | null;
  lines?: PayslipLine[];
}

export interface PayrollRun {
  id: number;
  title: string;
  period_start: string;
  period_end: string;
  working_days: number;
  status: RunStatus;
  finalized_at: string | null;
  payslips_count?: number;
  payslips_sum_net_pay?: string | null;
  payslips?: Payslip[];
  finalizer?: { id: number; name: string } | null;
}

export interface RunPayload {
  title: string;
  period_start: string;
  period_end: string;
  working_days: number;
}

export async function fetchPayrollRuns(): Promise<PayrollRun[]> {
  const res = await api.get("/payroll-runs");
  return res.data.runs;
}

export async function fetchPayrollRun(id: number): Promise<PayrollRun> {
  const res = await api.get(`/payroll-runs/${id}`);
  return res.data.run;
}

export async function createPayrollRun(
  payload: RunPayload,
): Promise<PayrollRun> {
  const res = await api.post("/payroll-runs", payload);
  return res.data.run;
}

export async function generatePayslips(runId: number): Promise<void> {
  await api.post(`/payroll-runs/${runId}/generate`);
}

export async function finalizePayrollRun(runId: number): Promise<void> {
  await api.post(`/payroll-runs/${runId}/finalize`);
}

export async function deletePayrollRun(runId: number): Promise<void> {
  await api.delete(`/payroll-runs/${runId}`);
}

export async function addPayslipLine(
  payslipId: number,
  type: "allowance" | "deduction",
  label: string,
  amount: number,
): Promise<void> {
  await api.post(`/payslips/${payslipId}/lines`, { type, label, amount });
}

export async function removePayslipLine(lineId: number): Promise<void> {
  await api.delete(`/payslip-lines/${lineId}`);
}
