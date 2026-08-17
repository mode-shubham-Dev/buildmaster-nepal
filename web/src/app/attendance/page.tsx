"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/permission-guard";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  ArrowLeft, Calendar, Check, Clock, ChevronLeft, ChevronRight, Users2,
} from "lucide-react";
import {
  fetchRoster, markAttendance,
  type AttendanceStatus, type MarkEntry, type RosterRow,
} from "@/lib/attendance-api";

const STATUSES: { key: AttendanceStatus; label: string; short: string; color: string; active: string }[] = [
  { key: "present",  label: "Present",  short: "P",  color: "text-green-600",  active: "bg-green-500 text-white border-green-500" },
  { key: "absent",   label: "Absent",   short: "A",  color: "text-red-600",    active: "bg-red-500 text-white border-red-500" },
  { key: "half_day", label: "Half Day", short: "½",  color: "text-orange-600", active: "bg-orange-500 text-white border-orange-500" },
  { key: "on_leave", label: "Leave",    short: "L",  color: "text-blue-600",   active: "bg-blue-500 text-white border-blue-500" },
  { key: "holiday",  label: "Holiday",  short: "H",  color: "text-slate-500",  active: "bg-slate-500 text-white border-slate-500" },
];

function shiftDate(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function AttendanceContent() {
  const queryClient = useQueryClient();
  const { can } = useAuth();
  const canMark = can("attendance.mark");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Only track what the user has locally edited; server data is the base.
  const [pendingEdits, setPendingEdits] = useState<Record<number, MarkEntry>>({});
  // Reset pending edits when the date changes (render-time adjustment per React docs).
  const [lastDate, setLastDate] = useState(date);
  if (lastDate !== date) {
    setLastDate(date);
    setPendingEdits({});
  }

  const { data, isLoading } = useQuery({
    queryKey: ["roster", date],
    queryFn: () => fetchRoster(date),
  });

  // Effective marks = server attendance records merged with any unsaved local edits.
  const marks = useMemo(() => {
    const base: Record<number, MarkEntry> = {};
    data?.roster.forEach((row) => {
      if (row.attendance) {
        base[row.employee.id] = {
          employee_id: row.employee.id,
          status: row.attendance.status,
          check_in: row.attendance.check_in ?? undefined,
          check_out: row.attendance.check_out ?? undefined,
          remarks: row.attendance.remarks ?? undefined,
        };
      }
    });
    return { ...base, ...pendingEdits };
  }, [data, pendingEdits]);

  const setStatus = (empId: number, status: AttendanceStatus) =>
    setPendingEdits((m) => ({ ...m, [empId]: { ...marks[empId], employee_id: empId, status } }));

  const setTime = (empId: number, field: "check_in" | "check_out", value: string) =>
    setPendingEdits((m) => ({ ...m, [empId]: { ...marks[empId], employee_id: empId, [field]: value || undefined } }));

  const saveMut = useMutation({
    mutationFn: () => markAttendance(date, Object.values(marks)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roster", date] }),
  });

  // live tally
  const tally = useMemo(() => {
    const counts: Record<string, number> = { present: 0, absent: 0, half_day: 0, on_leave: 0, holiday: 0 };
    Object.values(marks).forEach((m) => { counts[m.status] = (counts[m.status] ?? 0) + 1; });
    return counts;
  }, [marks]);

  const markedCount = Object.keys(marks).length;
  const totalCount = data?.roster.length ?? 0;
  const isToday = date === new Date().toISOString().split("T")[0];

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
                <h1 className="text-lg font-semibold tracking-tight text-[#1a1d23]">Attendance</h1>
                <p className="text-[13px] text-slate-400">{markedCount} of {totalCount} marked</p>
              </div>
            </div>
            {canMark && (
              <button
                onClick={() => saveMut.mutate()}
                disabled={saveMut.isPending || markedCount === 0}
                className="flex items-center gap-2 rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2e37] disabled:opacity-40"
              >
                <Check className="h-4 w-4" />
                {saveMut.isPending ? "Saving..." : saveMut.isSuccess ? "Saved" : "Save Day"}
              </button>
            )}
          </div>

          {/* date navigator */}
          <div className="mt-5 flex items-center gap-2">
            <button onClick={() => setDate(shiftDate(date, -1))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="relative flex-1">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-slate-300"
              />
            </div>
            <button
              onClick={() => setDate(shiftDate(date, 1))}
              disabled={isToday}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* live tally */}
          <div className="mt-4 flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <span key={s.key} className={`rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium ${s.color}`}>
                {s.label}: {tally[s.key]}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
          </div>
        ) : totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
              <Users2 className="h-7 w-7" />
            </div>
            <p className="text-sm font-medium text-slate-500">No active employees</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data?.roster.map((row) => (
              <RosterCard
                key={row.employee.id}
                row={row}
                entry={marks[row.employee.id]}
                canMark={canMark}
                onStatus={(s) => setStatus(row.employee.id, s)}
                onTime={(f, v) => setTime(row.employee.id, f, v)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function RosterCard({
  row, entry, canMark, onStatus, onTime,
}: {
  row: RosterRow;
  entry: MarkEntry | undefined;
  canMark: boolean;
  onStatus: (s: AttendanceStatus) => void;
  onTime: (field: "check_in" | "check_out", v: string) => void;
}) {
  const { employee } = row;
  const status = entry?.status;
  const showTimes = status === "present" || status === "half_day";

  return (
    <div className={`rounded-2xl border bg-white p-4 transition ${status ? "border-slate-200/70" : "border-dashed border-slate-200"}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-slate-100 to-slate-200 text-xs font-semibold text-slate-600">
            {employee.first_name[0]}{employee.last_name[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1a1d23]">{employee.first_name} {employee.last_name}</p>
            <p className="text-xs text-slate-400">{employee.employee_code}{employee.job_title ? ` · ${employee.job_title}` : ""}</p>
          </div>
        </div>

        {/* status buttons */}
        {canMark ? (
          <div className="flex gap-1">
            {STATUSES.map((s) => (
              <button
                key={s.key}
                onClick={() => onStatus(s.key)}
                title={s.label}
                className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-semibold transition ${
                  status === s.key ? s.active : `border-slate-200 ${s.color} hover:bg-slate-50`
                }`}
              >
                {s.short}
              </button>
            ))}
          </div>
        ) : (
          status && (
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUSES.find((s) => s.key === status)?.color}`}>
              {STATUSES.find((s) => s.key === status)?.label}
            </span>
          )
        )}
      </div>

      {/* check-in/out — only for present/half_day */}
      {canMark && showTimes && (
        <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3">
          <Clock className="h-3.5 w-3.5 text-slate-300" />
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={entry?.check_in ?? ""}
              onChange={(e) => onTime("check_in", e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50/50 px-2 py-1 text-xs outline-none focus:border-slate-300 focus:bg-white"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="time"
              value={entry?.check_out ?? ""}
              onChange={(e) => onTime("check_out", e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50/50 px-2 py-1 text-xs outline-none focus:border-slate-300 focus:bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function AttendancePage() {
  return (
    <PermissionGuard permission="attendance.view">
      <AttendanceContent />
    </PermissionGuard>
  );
}