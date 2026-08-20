import api from "./api";

export interface ReportKpis {
  active_projects: number;
  total_billed: number;
  total_collected: number;
  outstanding: number;
  purchase_spend: number;
  expense_spend: number;
  total_spend: number;
  pending_bills: number;
  pending_expenses: number;
}

export interface ProjectProfitability {
  id: number;
  name: string;
  project_code: string;
  status: string;
  contract_value: number;
  billed: number;
  purchase_cost: number;
  expense_cost: number;
  total_cost: number;
  margin: number;
  margin_pct: number;
}

export interface ExpenseBreakdownItem {
  name: string;
  total: number;
}

export interface BillingCollectionItem {
  id: number;
  label: string;
  net_payable: number;
  collected: number;
  outstanding: number;
  bill_date: string;
}

export interface PayrollSummaryItem {
  id: number;
  title: string;
  status: string;
  total_net: number;
  total_gross: number;
  headcount: number;
}

export interface ReportOverview {
  kpis: ReportKpis;
  profitability: ProjectProfitability[];
  expense_breakdown: ExpenseBreakdownItem[];
  billing_collection: BillingCollectionItem[];
  payroll_summary: PayrollSummaryItem[];
}

export async function fetchReportOverview(): Promise<ReportOverview> {
  const res = await api.get("/reports/overview");
  return res.data;
}
