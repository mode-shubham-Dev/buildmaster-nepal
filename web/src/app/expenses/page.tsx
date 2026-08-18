"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/permission-guard";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  ArrowLeft, Plus, X, Check, Ban, Wallet, Receipt, Clock, CircleCheck, CircleX,
  Trash2, TrendingUp, TrendingDown, Coins, FolderOpen,
} from "lucide-react";
import {
  fetchExpenses, createExpense, actionExpense, deleteExpense, fetchExpenseCategories,
  fetchFunds, createFund, topupFund,
  type Expense, type ExpenseStatus, type ExpensePayload, type PettyCashFund, type FundPayload,
} from "@/lib/expenses-api";
import { fetchProjects } from "@/lib/projects-api";

function money(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === "") return "Rs. 0";
  return `Rs. ${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

const STATUS_META: Record<ExpenseStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "bg-amber-50 text-amber-600", icon: <Clock className="h-3.5 w-3.5" /> },
  approved: { label: "Approved", color: "bg-green-50 text-green-600", icon: <CircleCheck className="h-3.5 w-3.5" /> },
  rejected: { label: "Rejected", color: "bg-red-50 text-red-600", icon: <CircleX className="h-3.5 w-3.5" /> },
};

type Tab = "expenses" | "funds";

function ExpensesContent() {
  const { can } = useAuth();
  const [tab, setTab] = useState<Tab>("expenses");

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-5">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-[#1a1d23]">Expenses &amp; Petty Cash</h1>
              <p className="text-[13px] text-slate-400">Operational spending</p>
            </div>
          </div>

          <div className="mt-5 flex gap-1">
            {[
              { id: "expenses" as Tab, label: "Expenses", icon: <Receipt className="h-4 w-4" /> },
              { id: "funds" as Tab, label: "Petty Cash", icon: <Wallet className="h-4 w-4" /> },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  tab === t.id ? "bg-[#1a1d23] text-white" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {tab === "expenses" ? <ExpensesTab can={can} /> : <FundsTab can={can} />}
      </main>
    </div>
  );
}

/* ---------- EXPENSES TAB ---------- */
function ExpensesTab({ can }: { can: (p: string) => boolean }) {
  const queryClient = useQueryClient();
  const canCreate = can("expenses.create");
  const canApprove = can("expenses.approve");
  const [filter, setFilter] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: expenses, isLoading } = useQuery({
    queryKey: ["expenses", filter],
    queryFn: () => fetchExpenses({ status: filter || undefined }),
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex gap-1">
          {[
            { key: "", label: "All" },
            { key: "pending", label: "Pending" },
            { key: "approved", label: "Approved" },
            { key: "rejected", label: "Rejected" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                filter === f.key ? "bg-slate-200 text-slate-700" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {canCreate && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2e37]">
            <Plus className="h-4 w-4" />
            New Expense
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" /></div>
      ) : expenses?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300"><Receipt className="h-7 w-7" /></div>
          <p className="text-sm font-medium text-slate-500">No expenses</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {expenses?.map((exp) => (
            <ExpenseCard key={exp.id} expense={exp} canApprove={canApprove} canCreate={canCreate} onChanged={() => queryClient.invalidateQueries({ queryKey: ["expenses"] })} />
          ))}
        </div>
      )}

      {showForm && (
        <ExpenseForm onClose={() => setShowForm(false)} onSaved={() => { queryClient.invalidateQueries({ queryKey: ["expenses"] }); setShowForm(false); }} />
      )}
    </div>
  );
}

function ExpenseCard({ expense, canApprove, canCreate, onChanged }: { expense: Expense; canApprove: boolean; canCreate: boolean; onChanged: () => void }) {
  const [rejecting, setRejecting] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const meta = STATUS_META[expense.status];

  const actionMut = useMutation({
    mutationFn: ({ status, note }: { status: "approved" | "rejected"; note?: string }) => actionExpense(expense.id, status, note),
    onSuccess: () => { onChanged(); setRejecting(false); },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string; errors?: { amount?: string[] } } } };
      setError(e.response?.data?.errors?.amount?.[0] ?? e.response?.data?.message ?? "Failed.");
    },
  });
  const delMut = useMutation({ mutationFn: () => deleteExpense(expense.id), onSuccess: onChanged });

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-[#1a1d23]">{expense.description}</p>
            <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.color}`}>{meta.icon}{meta.label}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
            <span>{expense.category?.name}</span>
            {expense.project && <><span>·</span><span className="flex items-center gap-0.5"><FolderOpen className="h-3 w-3" />{expense.project.name}</span></>}
            {expense.fund && <><span>·</span><span className="flex items-center gap-0.5"><Wallet className="h-3 w-3" />{expense.fund.name}</span></>}
            <span>·</span><span>{expense.expense_date.split("T")[0]}</span>
          </div>
        </div>
        <p className="shrink-0 text-base font-semibold tabular-nums text-[#1a1d23]">{money(expense.amount)}</p>
      </div>

      {error && <div className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>}

      {expense.status !== "pending" && expense.action_remarks && (
        <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
          <span className="font-medium">{expense.approver?.name ?? "Manager"}:</span> {expense.action_remarks}
        </p>
      )}

      {expense.status === "pending" && (canApprove || canCreate) && (
        <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          {canCreate && !canApprove && (
            <button onClick={() => confirm("Delete this expense?") && delMut.mutate()} className="text-xs font-medium text-slate-400 hover:text-red-500">Delete</button>
          )}
          {canApprove && !rejecting && (
            <>
              <button onClick={() => setRejecting(true)} className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50">
                <Ban className="h-3.5 w-3.5" />Reject
              </button>
              <button onClick={() => actionMut.mutate({ status: "approved" })} disabled={actionMut.isPending} className="flex items-center gap-1.5 rounded-lg bg-[#1a1d23] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#2a2e37] disabled:opacity-50">
                <Check className="h-3.5 w-3.5" />Approve
              </button>
            </>
          )}
          {canApprove && rejecting && (
            <div className="flex w-full items-center gap-2">
              <input autoFocus value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Reason..." className="flex-1 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-sm outline-none focus:border-slate-300 focus:bg-white" />
              <button onClick={() => setRejecting(false)} className="rounded-lg px-2 py-1.5 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
              <button onClick={() => actionMut.mutate({ status: "rejected", note: remarks || undefined })} disabled={actionMut.isPending} className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50">Confirm</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ExpenseForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<ExpensePayload>({ expense_category_id: 0, amount: 0, expense_date: new Date().toISOString().split("T")[0], description: "" });
  const [error, setError] = useState("");

  const { data: categories } = useQuery({ queryKey: ["expense-categories"], queryFn: fetchExpenseCategories });
  const { data: projects } = useQuery({ queryKey: ["projects"], queryFn: () => fetchProjects() });
  const { data: funds } = useQuery({ queryKey: ["funds"], queryFn: fetchFunds });

  const mutation = useMutation({
    mutationFn: () => createExpense(form),
    onSuccess: onSaved,
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Failed to submit.");
    },
  });
  const set = <K extends keyof ExpensePayload>(k: K, v: ExpensePayload[K]) => setForm((f) => ({ ...f, [k]: v }));

  const canSubmit = form.expense_category_id && form.amount > 0 && form.description && form.expense_date;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1a1d23]">New Expense</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-5 space-y-3.5">
          {error && <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</div>}

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Description</label>
            <input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What was this for?" className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Category</label>
              <select value={form.expense_category_id || ""} onChange={(e) => set("expense_category_id", Number(e.target.value))} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white">
                <option value="">Select</option>
                {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Amount</label>
              <input type="number" value={form.amount || ""} onChange={(e) => set("amount", Number(e.target.value))} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Project (optional)</label>
              <select value={form.project_id ?? ""} onChange={(e) => set("project_id", e.target.value ? Number(e.target.value) : null)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white">
                <option value="">None</option>
                {projects?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Petty Cash (optional)</label>
              <select value={form.petty_cash_fund_id ?? ""} onChange={(e) => set("petty_cash_fund_id", e.target.value ? Number(e.target.value) : null)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white">
                <option value="">Direct / Reimbursable</option>
                {funds?.map((f) => <option key={f.id} value={f.id}>{f.name} ({money(f.balance)})</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Date</label>
            <input type="date" value={form.expense_date} onChange={(e) => set("expense_date", e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white [color-scheme:light]" />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100">Cancel</button>
          <button onClick={() => canSubmit && mutation.mutate()} disabled={!canSubmit || mutation.isPending} className="rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a2e37] disabled:opacity-50">
            {mutation.isPending ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- FUNDS TAB ---------- */
function FundsTab({ can }: { can: (p: string) => boolean }) {
  const queryClient = useQueryClient();
  const canApprove = can("expenses.approve");
  const [showCreate, setShowCreate] = useState(false);
  const [topupFundId, setTopupFundId] = useState<number | null>(null);

  const { data: funds, isLoading } = useQuery({ queryKey: ["funds"], queryFn: fetchFunds });

  return (
    <div>
      {canApprove && (
        <div className="mb-5 flex justify-end">
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2e37]">
            <Plus className="h-4 w-4" />New Fund
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-24"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" /></div>
      ) : funds?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300"><Coins className="h-7 w-7" /></div>
          <p className="text-sm font-medium text-slate-500">No petty cash funds</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {funds?.map((fund) => (
            <div key={fund.id} className="rounded-2xl border border-slate-200/70 bg-white p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1a1d23]">{fund.name}</p>
                    {fund.project && <p className="text-xs text-slate-400">{fund.project.name}</p>}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Available Balance</p>
                <p className={`mt-0.5 text-2xl font-semibold tabular-nums ${fund.balance <= 0 ? "text-red-500" : "text-[#1a1d23]"}`}>{money(fund.balance)}</p>
              </div>

              <div className="mt-3 flex items-center gap-4 border-t border-slate-100 pt-3 text-xs">
                <span className="flex items-center gap-1 text-slate-500"><TrendingUp className="h-3 w-3 text-green-500" />Added {money(fund.total_topups)}</span>
                <span className="flex items-center gap-1 text-slate-500"><TrendingDown className="h-3 w-3 text-red-500" />Spent {money(fund.total_spent)}</span>
              </div>

              {canApprove && (
                <button onClick={() => setTopupFundId(fund.id)} className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  <Plus className="h-4 w-4" />Top Up
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreate && <FundForm onClose={() => setShowCreate(false)} onSaved={() => { queryClient.invalidateQueries({ queryKey: ["funds"] }); setShowCreate(false); }} />}
      {topupFundId && <TopupForm fundId={topupFundId} onClose={() => setTopupFundId(null)} onSaved={() => { queryClient.invalidateQueries({ queryKey: ["funds"] }); setTopupFundId(null); }} />}
    </div>
  );
}

function FundForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<FundPayload>({ name: "" });
  const { data: projects } = useQuery({ queryKey: ["projects"], queryFn: () => fetchProjects() });
  const mutation = useMutation({ mutationFn: () => createFund(form), onSuccess: onSaved });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1a1d23]">New Petty Cash Fund</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-5 space-y-3.5">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Fund Name</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Site A Petty Cash" className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Project (optional)</label>
            <select value={form.project_id ?? ""} onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value ? Number(e.target.value) : null }))} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white">
              <option value="">None</option>
              {projects?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100">Cancel</button>
          <button onClick={() => form.name && mutation.mutate()} disabled={mutation.isPending} className="rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a2e37] disabled:opacity-50">
            {mutation.isPending ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TopupForm({ fundId, onClose, onSaved }: { fundId: number; onClose: () => void; onSaved: () => void }) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [remarks, setRemarks] = useState("");
  const mutation = useMutation({ mutationFn: () => topupFund(fundId, Number(amount), date, remarks || undefined), onSuccess: onSaved });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1a1d23]">Top Up Fund</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-5 space-y-3.5">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Amount</label>
            <input type="number" autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white [color-scheme:light]" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Remarks</label>
            <input value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional" className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100">Cancel</button>
          <button onClick={() => amount && mutation.mutate()} disabled={mutation.isPending} className="rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a2e37] disabled:opacity-50">
            {mutation.isPending ? "Adding..." : "Top Up"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExpensesPage() {
  return (
    <PermissionGuard permission="expenses.view">
      <ExpensesContent />
    </PermissionGuard>
  );
}