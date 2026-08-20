import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";

export function LandingHero() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-20 lg:pt-20 lg:pb-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* LEFT — copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              नेपाली निर्माण व्यवसायका लागि · Construction ERP for Nepal
            </div>

            <h1 className="mt-5 text-4xl font-bold leading-[1.12] tracking-tight text-[#1a1d23] sm:text-5xl">
              Manage your entire
              <br />
              construction business
              <br />
              <span className="text-amber-500">in one system.</span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600">
              From tender to final bill — projects, BOQ, procurement, stock, payroll,
              equipment, and RA billing in a single platform built for how Nepali
              contractors actually work.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/login" className="flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-[#1a1d23] transition hover:bg-amber-400">
                Request a Demo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                Log in
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
              <Phone className="h-4 w-4 text-slate-400" />
              Talk to us: <span className="font-medium text-slate-700">01-5521234</span>
            </div>
          </div>

          {/* RIGHT — product visual */}
          <div className="relative">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_50px_-12px_rgba(0,0,0,0.15)]">
              <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span className="ml-3 text-xs text-slate-400">BuildMaster · Dashboard</span>
              </div>

              <div className="grid grid-cols-3 gap-px bg-slate-100">
                {[
                  { l: "Billed", v: "Rs. 1.19 Cr" },
                  { l: "Collected", v: "Rs. 1.19 Cr", green: true },
                  { l: "Projects", v: "12" },
                ].map((m) => (
                  <div key={m.l} className="bg-white px-4 py-3">
                    <p className="text-[10px] uppercase tracking-wide text-slate-400">{m.l}</p>
                    <p className={`mt-0.5 text-sm font-semibold tabular-nums ${m.green ? "text-green-600" : "text-slate-800"}`}>{m.v}</p>
                  </div>
                ))}
              </div>

              <div className="divide-y divide-slate-100">
                {[
                  { n: "Ring Road Widening", s: "On track", tone: "green" },
                  { n: "Bridge · Ward 7", s: "Billing due", tone: "amber" },
                  { n: "Housing Block B", s: "In progress", tone: "slate" },
                ].map((r) => (
                  <div key={r.n} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-50 text-[10px] font-semibold text-amber-600">
                        {r.n.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </span>
                      <span className="text-sm text-slate-700">{r.n}</span>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${r.tone === "green" ? "bg-green-50 text-green-600" : r.tone === "amber" ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"}`}>
                      {r.s}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
                <p className="text-[11px] text-slate-500">आज · Aaisha, 6 Bhadra 2083</p>
              </div>
            </div>
            <div className="absolute -right-4 -top-4 -z-10 h-24 w-24 rounded-2xl bg-amber-100/70" />
          </div>
        </div>
      </div>

      {/* trust bar */}
      <div className="border-y border-slate-100 bg-[#fafafa]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-6 py-0 sm:grid-cols-4">
          {[
            { v: "20+", l: "Modules" },
            { v: "Site + Office", l: "One platform" },
            { v: "BS Calendar", l: "Built in" },
            { v: "IRD-ready", l: "VAT & billing" },
          ].map((s) => (
            <div key={s.l} className="px-4 py-6 text-center">
              <p className="text-xl font-bold text-[#1a1d23]">{s.v}</p>
              <p className="mt-0.5 text-xs text-slate-500">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}