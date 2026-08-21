"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  ArrowLeft, Building2, Percent, CalendarDays, Save, Check, Landmark, Phone, Mail, MapPin, Hash,
} from "lucide-react";
import api from "@/lib/api";
import { todayBS, BS_MONTHS } from "@/lib/bikram-sambat";

interface Settings {
  id: number;
  company_name: string;
  company_address: string | null;
  pan_vat_no: string | null;
  phone: string | null;
  email: string | null;
  default_vat_percentage: string;
  default_retention_percentage: string;
  currency_symbol: string;
  fiscal_year_start_month: number;
  fiscal_year_start_day: number;
}

async function fetchSettings(): Promise<Settings> {
  const res = await api.get("/settings");
  return res.data.settings;
}
async function updateSettings(payload: Partial<Settings>): Promise<Settings> {
  const res = await api.put("/settings", payload);
  return res.data.settings;
}

function SettingsContent() {
  const queryClient = useQueryClient();
  const { can } = useAuth();
  const canManage = can("settings.manage");
  const [overrides, setOverrides] = useState<Partial<Settings>>({});
  const [saved, setSaved] = useState(false);

  const { data: settings, isLoading, isError } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const form = { ...(settings ?? {}), ...overrides };

  const mutation = useMutation({
    mutationFn: () => updateSettings(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setOverrides({});
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => { setOverrides((o) => ({ ...o, [k]: v })); setSaved(false); };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#fafaf9]"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" /></div>;
  }

  if (isError) {
    return <div className="flex min-h-screen items-center justify-center bg-[#fafaf9] text-sm text-red-600">Failed to load settings. Please refresh and try again.</div>;
  }

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-5">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-[#1a1d23]">Settings</h1>
              <p className="text-[13px] text-slate-400">Company &amp; system configuration</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {/* BS date banner — the Nepali heart */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-amber-100 bg-linear-to-br from-amber-50 to-orange-50/40">
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-amber-700/70">आजको मिति · Today</p>
              <p className="mt-1 text-2xl font-semibold text-[#1a1d23]">
                {todayBS({ np: true, weekday: true })}
              </p>
              <p className="mt-0.5 text-sm text-amber-700/80">{todayBS({ weekday: true })}</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/70 text-amber-600 shadow-sm">
              <CalendarDays className="h-7 w-7" />
            </div>
          </div>
          <div className="border-t border-amber-100/70 bg-white/40 px-6 py-2.5">
            <p className="text-xs text-amber-700/70">
              Gregorian: {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        <fieldset disabled={!canManage} className="space-y-6">
          {/* Company Identity */}
          <Section icon={<Building2 className="h-4 w-4" />} title="Company Identity" subtitle="Appears on bills, documents & reports">
            <Field label="Company Name" icon={<Landmark className="h-4 w-4" />}>
              <input value={form.company_name ?? ""} onChange={(e) => set("company_name", e.target.value)} className="input" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="PAN / VAT No." icon={<Hash className="h-4 w-4" />}>
                <input value={form.pan_vat_no ?? ""} onChange={(e) => set("pan_vat_no", e.target.value)} placeholder="e.g. 301234567" className="input" />
              </Field>
              <Field label="Phone" icon={<Phone className="h-4 w-4" />}>
                <input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} placeholder="01-XXXXXXX" className="input" />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" icon={<Mail className="h-4 w-4" />}>
                <input type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} className="input" />
              </Field>
              <Field label="Address" icon={<MapPin className="h-4 w-4" />}>
                <input value={form.company_address ?? ""} onChange={(e) => set("company_address", e.target.value)} placeholder="City, District" className="input" />
              </Field>
            </div>
          </Section>

          {/* Financial Defaults */}
          <Section icon={<Percent className="h-4 w-4" />} title="Financial Defaults" subtitle="Applied to new bills & purchases">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Default VAT %">
                <input type="number" value={form.default_vat_percentage ?? ""} onChange={(e) => set("default_vat_percentage", e.target.value)} className="input" />
              </Field>
              <Field label="Default Retention %">
                <input type="number" value={form.default_retention_percentage ?? ""} onChange={(e) => set("default_retention_percentage", e.target.value)} className="input" />
              </Field>
              <Field label="Currency Symbol">
                <input value={form.currency_symbol ?? ""} onChange={(e) => set("currency_symbol", e.target.value)} className="input" />
              </Field>
            </div>
          </Section>

          {/* Fiscal Year */}
          <Section icon={<CalendarDays className="h-4 w-4" />} title="Fiscal Year" subtitle="Nepal's fiscal year runs Shrawan–Ashadh">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start Month (BS)">
                <select value={form.fiscal_year_start_month ?? 4} onChange={(e) => set("fiscal_year_start_month", Number(e.target.value))} className="input">
                  {BS_MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              </Field>
              <Field label="Start Day">
                <input type="number" min={1} max={32} value={form.fiscal_year_start_day ?? 1} onChange={(e) => set("fiscal_year_start_day", Number(e.target.value))} className="input" />
              </Field>
            </div>
            <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Default: 1 Shrawan (श्रावण), matching Nepal&rsquo;s official fiscal calendar. Reports and payroll periods will align to this.
            </p>
          </Section>
        </fieldset>

        {canManage ? (
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-[#1a1d23] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#2a2e37] disabled:opacity-50"
            >
              {saved ? <><Check className="h-4 w-4" /> Saved</> : mutation.isPending ? "Saving..." : <><Save className="h-4 w-4" /> Save Settings</>}
            </button>
          </div>
        ) : (
          <p className="mt-4 text-center text-xs text-slate-400">You have view-only access to settings.</p>
        )}
      </main>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgb(226 232 240);
          background: rgb(248 250 252 / 0.5);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.15s;
        }
        :global(.input:focus) {
          border-color: rgb(203 213 225);
          background: white;
        }
        :global(fieldset:disabled .input) {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

function Section({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">{icon}</div>
        <div>
          <h2 className="text-sm font-semibold text-[#1a1d23]">{title}</h2>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-slate-600">
        {icon && <span className="text-slate-400">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}