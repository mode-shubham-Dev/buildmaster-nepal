"use client";

import { useAuth } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import { HardHat, LogOut, Users, ChevronRight, Building2, UserCog, Handshake, FileText, Layers, Package, Warehouse, ShoppingCart } from "lucide-react";
import Link from "next/link";

function DashboardContent() {
  const { user, logout, can } = useAuth();

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

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {can("projects.view") && (
            <Link
              href="/projects"
              className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-5 transition hover:border-amber-300 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Projects
                  </p>
                  <p className="text-xs text-slate-500">
                    Manage all your projects
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:text-amber-500" />
            </Link>
          )}

          {can("users.view") && (
            <Link
              href="/users"
              className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-5 transition hover:border-amber-300 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    User Management
                  </p>
                  <p className="text-xs text-slate-500">
                    Manage users and roles
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:text-amber-500" />
            </Link>
          )}

          {can("company.view") && (
            <Link
              href="/company"
              className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-5 transition hover:border-amber-300 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Company Settings
                  </p>
                  <p className="text-xs text-slate-500">
                    Branches, departments, teams
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:text-amber-500" />
            </Link>
          )}

          {can("employees.view") && (
            <Link
              href="/employees"
              className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-5 transition hover:border-amber-300 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <UserCog className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Employees
                  </p>
                  <p className="text-xs text-slate-500">
                    Manage your workforce
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:text-amber-500" />
            </Link>
          )}

          {can("clients.view") && (
            <Link
              href="/clients"
              className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-5 transition hover:border-amber-300 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Handshake className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Clients
                  </p>
                  <p className="text-xs text-slate-500">
                    Clients, contracts & communication
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:text-amber-500" />
            </Link>
          )}

          {can("tenders.view") && (
            <Link
              href="/tenders"
              className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-5 transition hover:border-amber-300 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Tenders &amp; Bids
                  </p>
                  <p className="text-xs text-slate-500">
                    Track opportunities and bids
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:text-amber-500" />
            </Link>
          )}

          {can("materials.view") && (
            <Link
              href="/materials"
              className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-5 transition hover:border-amber-300 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Materials
                  </p>
                  <p className="text-xs text-slate-500">
                    Material catalog &amp; categories
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:text-amber-500" />
            </Link>
          )}

          {can("purchases.view") && (
            <Link
              href="/purchases"
              className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-5 transition hover:border-amber-300 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Purchase Orders
                  </p>
                  <p className="text-xs text-slate-500">
                    Procurement &amp; approvals
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:text-amber-500" />
            </Link>
          )}

          {can("materials.view") && (
            <Link
              href="/warehouse"
              className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-5 transition hover:border-amber-300 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Warehouse className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Warehouse &amp; Stock
                  </p>
                  <p className="text-xs text-slate-500">
                    Inventory &amp; stock movements
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:text-amber-500" />
            </Link>
          )}
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