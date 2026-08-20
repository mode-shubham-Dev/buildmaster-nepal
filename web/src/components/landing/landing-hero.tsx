import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const POINTS = [
  "Projects, BOQ & site tracking",
  "RA billing & payroll built for Nepal",
  "Bikram Sambat throughout",
];

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-100 bg-[#fafafa]">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
        {/* left — copy */}
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Construction ERP · Built for Nepal
          </div>

          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-[#1a1d23] sm:text-5xl">
            Run your entire construction business in one place.
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600">
            BuildMaster Nepal brings projects, procurement, inventory, HR, payroll,
            billing, and reporting together — designed from the ground up for how
            Nepali construction firms actually work.
          </p>

          <ul className="mt-6 space-y-2.5">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-sm text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-amber-500" />
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/login" className="flex items-center gap-2 rounded-lg bg-[#1a1d23] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#2a2e37]">
              Request a demo <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#features" className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              Explore features
            </a>
          </div>
        </div>

        {/* right — a restrained product mock (not a fake screenshot, an honest abstract) */}
        <div className="relative flex items-center justify-center">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)]">
            {/* window chrome */}
            <div className="flex items-center gap-1.5 border-b border-slate-100 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
              <span className="ml-3 text-xs text-slate-400">BuildMaster · Dashboard</span>
            </div>
            {/* mock KPI strip */}
            <div className="grid grid-cols-2 gap-px bg-slate-100">
              {[
                { l: "Total Billed", v: "Rs. 1.19 Cr" },
                { l: "Collected", v: "Rs. 1.19 Cr", green: true },
                { l: "Active Projects", v: "12" },
                { l: "This Month", v: "Rs. 6.4 L" },
              ].map((m) => (
                <div key={m.l} className="bg-white px-4 py-3">
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">{m.l}</p>
                  <p className={`mt-0.5 text-sm font-semibold tabular-nums ${m.green ? "text-green-600" : "text-slate-800"}`}>{m.v}</p>
                </div>
              ))}
            </div>
            {/* mock rows */}
            <div className="space-y-px bg-slate-100">
              {[
                { n: "Ring Road Widening", s: "On track", tone: "green" },
                { n: "Bridge · Ward 7", s: "Billing due", tone: "amber" },
                { n: "Housing Block B", s: "In progress", tone: "slate" },
              ].map((r) => (
                <div key={r.n} className="flex items-center justify-between bg-white px-4 py-3">
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
          </div>
          {/* subtle amber accent block behind */}
          <div className="absolute -right-6 -top-6 -z-10 h-32 w-32 rounded-2xl bg-amber-100/60" />
          <div className="absolute -bottom-6 -left-6 -z-10 h-24 w-24 rounded-2xl bg-slate-100" />
        </div>
      </div>
    </section>
  );
}