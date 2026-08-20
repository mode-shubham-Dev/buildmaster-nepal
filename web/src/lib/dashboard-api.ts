import api from "./api";
import type { ReportKpis, ProjectProfitability } from "./reports-api";
import type { ActionItem } from "./notifications-api";

export interface DashboardSummary {
  actions: ActionItem[];
  kpis?: ReportKpis;
  profitability?: ProjectProfitability[];
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await api.get("/dashboard/summary");
  return res.data;
}
