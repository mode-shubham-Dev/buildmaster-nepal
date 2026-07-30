"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  HardHat,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  FileText,
  Package,
  Wallet,
} from "lucide-react";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      const apiError = err as ApiError;
      const message =
        apiError.response?.data?.message ||
        "Unable to sign in. Please check your credentials and try again.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#1a1d23] to-[#2d3138] px-14 py-12 text-white lg:flex lg:w-[55%]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500 text-[#1a1d23]">
            <HardHat className="h-6 w-6" strokeWidth={2.2} />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            BuildMaster <span className="text-amber-500">Nepal</span>
          </span>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Build smarter.
            <br />
            Manage everything.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-slate-400">
            Run your projects, teams, materials, equipment, and finances from a
            single platform built for the way construction works in Nepal.
          </p>
        </div>

        <div className="relative flex gap-8">
          <TrustPoint
            icon={<FileText className="h-4 w-4" />}
            label="Real-time site reports"
          />
          <TrustPoint
            icon={<Package className="h-4 w-4" />}
            label="Inventory control"
          />
          <TrustPoint
            icon={<Wallet className="h-4 w-4" />}
            label="Payroll and billing"
          />
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-[#fafafa] px-6 py-12 lg:w-[45%]">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-[#1a1d23]">
              <HardHat className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <span className="text-base font-semibold tracking-tight text-[#1a1d23]">
              BuildMaster <span className="text-amber-500">Nepal</span>
            </span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-[#1a1d23]">
            Welcome back
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Sign in to your BuildMaster account
          </p>

          {error ? (
            <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-amber-500"
                />
                Remember me
              </label>
              <a
                href="#"
                className="text-sm font-medium text-amber-600 transition hover:text-amber-700"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-amber-500 py-2.5 text-sm font-semibold text-[#1a1d23] shadow-sm transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-6 text-center">
            <p className="text-sm text-slate-500">
              Need access?{" "}
              <span className="font-medium text-slate-700">
                Contact your administrator.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustPoint({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-300">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/5 text-amber-500">
        {icon}
      </span>
      {label}
    </div>
  );
}