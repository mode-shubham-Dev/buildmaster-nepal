"use client";

import { useAuth } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import { HardHat, LogOut } from "lucide-react";

function DashboardContent() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-[#1a1d23]">
              <HardHat className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <span className="text-base font-semibold tracking-tight text-[#1a1d23]">
              BuildMaster <span className="text-amber-500">Nepal</span>
            </span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-2xl font-bold tracking-tight text-[#1a1d23]">
          Welcome back, {user?.name}
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          You are signed in as {user?.email}
        </p>

        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">
            Your dashboard modules will appear here as we build them.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}