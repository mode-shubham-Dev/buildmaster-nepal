import api from "./api";
import type { Attachment } from "./milestones-api";

export type ExpenseStatus = "pending" | "approved" | "rejected";

export interface ExpenseCategory {
  id: number;
  name: string;
  is_active: boolean;
}

export interface Expense {
  id: number;
  expense_category_id: number;
  project_id: number | null;
  petty_cash_fund_id: number | null;
  amount: string;
  expense_date: string;
  description: string;
  status: ExpenseStatus;
  action_remarks: string | null;
  category?: { id: number; name: string } | null;
  project?: { id: number; name: string } | null;
  fund?: { id: number; name: string } | null;
  spender?: { id: number; name: string } | null;
  approver?: { id: number; name: string } | null;
  attachments?: Attachment[];
}

export interface PettyCashFund {
  id: number;
  name: string;
  project_id: number | null;
  custodian_id: number | null;
  is_active: boolean;
  balance: number;
  total_topups: number;
  total_spent: number;
  project?: { id: number; name: string } | null;
  custodian?: { id: number; first_name: string; last_name: string } | null;
  topups?: PettyCashTopup[];
  expenses?: Expense[];
}

export interface PettyCashTopup {
  id: number;
  petty_cash_fund_id: number;
  amount: string;
  topup_date: string;
  remarks: string | null;
}

export interface ExpensePayload {
  expense_category_id: number;
  project_id?: number | null;
  petty_cash_fund_id?: number | null;
  amount: number;
  expense_date: string;
  description: string;
}

export interface FundPayload {
  name: string;
  project_id?: number | null;
  custodian_id?: number | null;
}

// Reference
export async function fetchExpenseCategories(): Promise<ExpenseCategory[]> {
  const res = await api.get("/expense-categories");
  return res.data.categories;
}

// Expenses
export async function fetchExpenses(
  filters: { status?: string; project_id?: number } = {},
): Promise<Expense[]> {
  const res = await api.get("/expenses", { params: filters });
  return res.data.expenses;
}

export async function createExpense(payload: ExpensePayload): Promise<Expense> {
  const res = await api.post("/expenses", payload);
  return res.data.expense;
}

export async function actionExpense(
  id: number,
  status: "approved" | "rejected",
  remarks?: string,
): Promise<void> {
  await api.post(`/expenses/${id}/action`, { status, action_remarks: remarks });
}

export async function uploadReceipt(
  expenseId: number,
  file: File,
): Promise<Attachment> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post(`/expenses/${expenseId}/receipt`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.attachment;
}

export async function deleteExpense(id: number): Promise<void> {
  await api.delete(`/expenses/${id}`);
}

// Petty cash
export async function fetchFunds(): Promise<PettyCashFund[]> {
  const res = await api.get("/petty-cash-funds");
  return res.data.funds;
}

export async function fetchFund(id: number): Promise<PettyCashFund> {
  const res = await api.get(`/petty-cash-funds/${id}`);
  return res.data.fund;
}

export async function createFund(payload: FundPayload): Promise<PettyCashFund> {
  const res = await api.post("/petty-cash-funds", payload);
  return res.data.fund;
}

export async function topupFund(
  fundId: number,
  amount: number,
  topupDate: string,
  remarks?: string,
): Promise<void> {
  await api.post(`/petty-cash-funds/${fundId}/topup`, {
    amount,
    topup_date: topupDate,
    remarks,
  });
}
