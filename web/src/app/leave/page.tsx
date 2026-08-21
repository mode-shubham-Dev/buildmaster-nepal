"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/permission-guard";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  ArrowLeft, Plus, X, Check, Ban, Plane, Calendar, Clock,
  CircleCheck, CircleX, Wallet, WalletMinimal,
} from "lucide-react";
import {
  fetchLeaveTypes, fetchLeaveRequests, createLeaveRequest, actionLeaveRequest, deleteLeaveRequest,
  type LeaveRequest, type LeaveStatus, type LeavePayload,
} from "@/lib/leave-api";
import { fetchEmployees } from "@/lib/employees-api";

const STATUS_META: Record<LeaveStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "bg-amber-50 text-amber-600", icon: <Clock className="h-3.5 w-3.5" /> },
  approved: { label: "Approved", color: "bg-green-50 text-green-600", icon: <CircleCheck className="h-3.5 w-3.5" /> },
  rejected: { label: "Rejected", color: "bg-red-50 text-red-600", icon: <CircleX className="h-3.5 w-3.5" /> },
};

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function LeaveContent() {
  const queryClient = useQueryClient();
  const { can } = useAuth();
  const canRequest = can("leave.request");
  const canApprove = can("leave.approve");
  const [filter, setFilter] = useState<string>("");
  const [showForm, setShowForm] = useState(false);

  const { data: requests, isLoading, isError } = useQuery({
    queryKey: ["leave-requests", filter],
    queryFn: () => fetchLeaveRequests(filter || undefined),
  });

  const pendingCount = useMemo(
    () => requests?.filter((r) => r.status === "pending").length ?? 0,
    [requests]
  );

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-[#1a1d23]">Leave</h1>
                <p className="text-[13px] text-slate-400">
                  {pendingCount > 0 ? `${pendingCount} pending approval` : "All caught up"}
                </p>
              </div>
            </div>
            {canRequest && (
              <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2e37]">
                <Plus className="h-4 w-4" />
                Request Leave
              </button>
            )}
          </div>

          {/* status filter */}
          <div className="mt-5 flex gap-1">
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
                  filter === f.key ? "bg-[#1a1d23] text-white" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-10 text-center text-sm text-red-600">
            Failed to load leave requests. Please refresh and try again.
          </div>
        ) : requests?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
              <Plane className="h-7 w-7" />
            </div>
            <p className="text-sm font-medium text-slate-500">No leave requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests?.map((r) => (
              <RequestCard key={r.id} request={r} canApprove={canApprove} canRequest={canRequest} />
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <RequestForm
          onClose={() => setShowForm(false)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

function RequestCard({ request, canApprove, canRequest }: { request: LeaveRequest; canApprove: boolean; canRequest: boolean }) {
  const queryClient = useQueryClient();
  const [rejecting, setRejecting] = useState(false);
  const [remarks, setRemarks] = useState("");
  const meta = STATUS_META[request.status];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["leave-requests"] });

  const actionMut = useMutation({
    mutationFn: ({ status, note }: { status: "approved" | "rejected"; note?: string }) =>
      actionLeaveRequest(request.id, status, note),
    onSuccess: () => { invalidate(); setRejecting(false); },
  });
  const delMut = useMutation({ mutationFn: () => deleteLeaveRequest(request.id), onSuccess: invalidate });

  const emp = request.employee;
  const initials = emp ? `${emp.first_name[0]}${emp.last_name[0]}` : "?";

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-semibold text-slate-600">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1a1d23]">
              {emp ? `${emp.first_name} ${emp.last_name}` : "—"}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
              <span>{request.leave_type?.name}</span>
              {request.leave_type && (
                <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-medium ${request.leave_type.is_paid ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"}`}>
                  {request.leave_type.is_paid ? <Wallet className="h-3 w-3" /> : <WalletMinimal className="h-3 w-3" />}
                  {request.leave_type.is_paid ? "Paid" : "Unpaid"}
                </span>
              )}
            </div>
          </div>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.color}`}>
          {meta.icon}
          {meta.label}
        </span>
      </div>

      {/* dates + days */}
      <div className="mt-4 flex items-center gap-4 rounded-xl bg-slate-50 px-4 py-3">
        <Calendar className="h-4 w-4 text-slate-400" />
        <div className="flex-1 text-sm">
          <span className="font-medium text-slate-700">{fmtDate(request.from_date)}</span>
          <span className="mx-2 text-slate-300">→</span>
          <span className="font-medium text-slate-700">{fmtDate(request.to_date)}</span>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
          {request.days} {request.days === 1 ? "day" : "days"}
        </span>
      </div>

      {request.reason && <p className="mt-3 text-sm text-slate-500">{request.reason}</p>}

      {/* action remarks if actioned */}
      {request.status !== "pending" && request.action_remarks && (
        <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
          <span className="font-medium">{request.approver?.name ?? "Manager"}:</span> {request.action_remarks}
        </p>
      )}

      {/* actions for pending */}
      {request.status === "pending" && (
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          {canRequest && !canApprove && (
            <button onClick={() => confirm("Cancel this request?") && delMut.mutate()} className="text-xs font-medium text-slate-400 hover:text-red-500">
              Cancel request
            </button>
          )}
          {canApprove && !rejecting && (
            <>
              <button
                onClick={() => setRejecting(true)}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <Ban className="h-3.5 w-3.5" />
                Reject
              </button>
              <button
                onClick={() => actionMut.mutate({ status: "approved" })}
                disabled={actionMut.isPending}
                className="flex items-center gap-1.5 rounded-lg bg-[#1a1d23] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#2a2e37] disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
                Approve
              </button>
            </>
          )}
          {canApprove && rejecting && (
            <div className="flex w-full items-center gap-2">
              <input
                autoFocus
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Reason for rejection..."
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-sm outline-none focus:border-slate-300 focus:bg-white"
              />
              <button onClick={() => setRejecting(false)} className="rounded-lg px-2 py-1.5 text-sm text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
              <button
                onClick={() => actionMut.mutate({ status: "rejected", note: remarks || undefined })}
                disabled={actionMut.isPending}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RequestForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [employeeId, setEmployeeId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const { data: employees } = useQuery({ queryKey: ["employees"], queryFn: () => fetchEmployees() });
  const { data: types } = useQuery({ queryKey: ["leave-types"], queryFn: () => fetchLeaveTypes() });

  const mutation = useMutation({
    mutationFn: (payload: LeavePayload) => createLeaveRequest(payload),
    onSuccess: onSaved,
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message ?? "Failed to submit request.");
    },
  });

  // live day count
  const days = useMemo(() => {
    if (!fromDate || !toDate) return 0;
    const diff = (new Date(toDate).getTime() - new Date(fromDate).getTime()) / 86400000;
    return diff >= 0 ? Math.floor(diff) + 1 : 0;
  }, [fromDate, toDate]);

  const selectedType = types?.find((t) => t.id === Number(typeId));

  const canSubmit = employeeId && typeId && fromDate && toDate && days > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1a1d23]">Request Leave</h2>
          <button onClick={onClose} className="text-slate-300 transition hover:text-slate-500"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-5 space-y-3.5">
          {error && <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</div>}

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Employee</label>
            <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white">
              <option value="">Select employee</option>
              {employees?.map((e) => (
                <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.employee_code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Leave Type</label>
            <select value={typeId} onChange={(e) => setTypeId(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white">
              <option value="">Select type</option>
              {types?.map((t) => (
                <option key={t.id} value={t.id}>{t.name} {t.is_paid ? "(Paid)" : "(Unpaid)"}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-600">From</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white [color-scheme:light]" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-600">To</label>
              <input type="date" value={toDate} min={fromDate} onChange={(e) => setToDate(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white [color-scheme:light]" />
            </div>
          </div>

          {/* live day count */}
          {days > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3.5 py-2.5 text-sm">
              <span className="text-slate-500">Duration</span>
              <span className="font-semibold text-[#1a1d23]">
                {days} {days === 1 ? "day" : "days"}
                {selectedType && <span className={`ml-2 text-xs font-normal ${selectedType.is_paid ? "text-green-600" : "text-slate-400"}`}>· {selectedType.is_paid ? "Paid" : "Unpaid"}</span>}
              </span>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Reason</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="Optional" className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white" />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100">Cancel</button>
          <button
            onClick={() => canSubmit && mutation.mutate({
              employee_id: Number(employeeId),
              leave_type_id: Number(typeId),
              from_date: fromDate,
              to_date: toDate,
              reason: reason || undefined,
            })}
            disabled={!canSubmit || mutation.isPending}
            className="rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2e37] disabled:opacity-50"
          >
            {mutation.isPending ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LeavePage() {
  return (
    <PermissionGuard permission="leave.view">
      <LeaveContent />
    </PermissionGuard>
  );
}