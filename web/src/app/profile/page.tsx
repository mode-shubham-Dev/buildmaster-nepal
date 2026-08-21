"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/protected-route";
import Link from "next/link";
import {
  ArrowLeft, User, Mail, Phone, Shield, Check, KeyRound, Save, Eye, EyeOff,
} from "lucide-react";
import {
  fetchProfile, updateProfile, changePassword,
  type ProfileUser,
} from "@/lib/profile-api";

function ProfileContent() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading, isError } = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });

  if (isLoading || !profile) {
    return <div className="flex min-h-screen items-center justify-center bg-[#fafaf9]"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" /></div>;
  }

  if (isError) {
    return <div className="flex min-h-screen items-center justify-center bg-[#fafaf9] text-sm text-red-600">Failed to load profile. Please refresh and try again.</div>;
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
              <h1 className="text-lg font-semibold tracking-tight text-[#1a1d23]">My Account</h1>
              <p className="text-[13px] text-slate-400">Manage your profile and password</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-6 py-8">
        {/* identity header */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 text-xl font-semibold text-slate-600">
            {profile.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-[#1a1d23]">{profile.name}</h2>
            <p className="text-sm text-slate-400">{profile.email}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {profile.roles.length === 0 ? (
                <span className="text-xs text-slate-400">No role assigned</span>
              ) : (
                profile.roles.map((role) => (
                  <span key={role} className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                    <Shield className="h-3 w-3" />
                    {role}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        <ProfileDetailsForm key={`${profile.name}-${profile.phone}`} profile={profile} onSaved={() => queryClient.invalidateQueries({ queryKey: ["profile"] })} />
        <ChangePasswordForm />
        <PermissionsList permissions={profile.permissions} />
      </main>
    </div>
  );
}

function ProfileDetailsForm({ profile, onSaved }: { profile: ProfileUser; onSaved: () => void }) {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [saved, setSaved] = useState(false);

  const mutation = useMutation({
    mutationFn: () => updateProfile({ name, phone: phone || null }),
    onSuccess: () => { onSaved(); setSaved(true); setTimeout(() => setSaved(false), 2000); },
  });

  const dirty = name !== profile.name || phone !== (profile.phone ?? "");

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><User className="h-4 w-4" /></div>
        <div>
          <h2 className="text-sm font-semibold text-[#1a1d23]">Profile Details</h2>
          <p className="text-xs text-slate-400">Your name and contact number</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Full Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none transition focus:border-slate-300 focus:bg-white" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-slate-600"><Mail className="h-3.5 w-3.5 text-slate-400" />Email</label>
            <input value={profile.email} disabled className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500" />
            <p className="mt-1 text-[11px] text-slate-400">Email can&rsquo;t be changed here — contact an administrator.</p>
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-slate-600"><Phone className="h-3.5 w-3.5 text-slate-400" />Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9841XXXXXX" className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none transition focus:border-slate-300 focus:bg-white" />
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          onClick={() => dirty && mutation.mutate()}
          disabled={!dirty || mutation.isPending}
          className="flex items-center gap-2 rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2e37] disabled:opacity-40"
        >
          {saved ? <><Check className="h-4 w-4" /> Saved</> : mutation.isPending ? "Saving..." : <><Save className="h-4 w-4" /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}

function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: () => changePassword({ current_password: current, password: next, password_confirmation: confirm }),
    onSuccess: () => {
      setDone(true); setError("");
      setCurrent(""); setNext(""); setConfirm("");
      setTimeout(() => setDone(false), 3000);
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const errs = e.response?.data?.errors;
      setError(errs?.current_password?.[0] ?? errs?.password?.[0] ?? e.response?.data?.message ?? "Failed to change password.");
    },
  });

  const canSubmit = current && next && confirm && next === confirm && next.length >= 8;

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><KeyRound className="h-4 w-4" /></div>
        <div>
          <h2 className="text-sm font-semibold text-[#1a1d23]">Change Password</h2>
          <p className="text-xs text-slate-400">Update the password you use to sign in</p>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</div>}
      {done && <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 px-3.5 py-2.5 text-sm text-green-600"><Check className="h-4 w-4" /> Password changed successfully.</div>}

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Current Password</label>
          <div className="relative">
            <input type={show ? "text" : "password"} value={current} onChange={(e) => setCurrent(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 pr-10 text-sm outline-none transition focus:border-slate-300 focus:bg-white" />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">New Password</label>
            <input type={show ? "text" : "password"} value={next} onChange={(e) => setNext(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none transition focus:border-slate-300 focus:bg-white" />
            {next && next.length < 8 && <p className="mt-1 text-[11px] text-amber-600">At least 8 characters.</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-600">Confirm New Password</label>
            <input type={show ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none transition focus:border-slate-300 focus:bg-white" />
            {confirm && next !== confirm && <p className="mt-1 text-[11px] text-red-500">Passwords don&rsquo;t match.</p>}
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          onClick={() => canSubmit && mutation.mutate()}
          disabled={!canSubmit || mutation.isPending}
          className="flex items-center gap-2 rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2e37] disabled:opacity-40"
        >
          <KeyRound className="h-4 w-4" />
          {mutation.isPending ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
}

function PermissionsList({ permissions }: { permissions: string[] }) {
  if (permissions.length === 0) return null;

  // group permissions by module prefix (e.g. "projects.view" → "projects")
  const grouped = permissions.reduce<Record<string, string[]>>((acc, p) => {
    const [module, action] = p.split(".");
    (acc[module] ??= []).push(action ?? p);
    return acc;
  }, {});

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><Shield className="h-4 w-4" /></div>
        <div>
          <h2 className="text-sm font-semibold text-[#1a1d23]">Your Access</h2>
          <p className="text-xs text-slate-400">What you can do in the system, by your role</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(grouped).map(([module, actions]) => (
          <div key={module} className="rounded-lg border border-slate-100 bg-slate-50/40 px-3 py-2.5">
            <p className="text-xs font-semibold capitalize text-slate-700">{module.replace(/_/g, " ")}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {actions.map((a) => (
                <span key={a} className="rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500 ring-1 ring-slate-200">{a}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}