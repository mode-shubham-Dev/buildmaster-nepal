import { Calendar, FileText, Landmark, Building2 } from "lucide-react";

const NEPAL = [
  { icon: <Calendar className="h-5 w-5" />, title: "Bikram Sambat calendar", body: "Every date shown in BS, the way your team actually reads it — not bolted on, built in." },
  { icon: <FileText className="h-5 w-5" />, title: "RA bills & retention", body: "The progressive billing model Nepali contractors use, with retention and VAT handled correctly." },
  { icon: <Landmark className="h-5 w-5" />, title: "PAN/VAT & 13% VAT", body: "Nepali tax fields and rates throughout — bills and documents that match local requirements." },
  { icon: <Building2 className="h-5 w-5" />, title: "Shrawan–Ashadh fiscal year", body: "Reporting and payroll aligned to Nepal's official fiscal calendar, not a foreign one." },
];

export function LandingNepal() {
  return (
    <section id="nepal" className="border-b border-slate-100 bg-[#1a1d23] py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              नेपालका लागि बनाइएको
            </div>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-white">
              Not a foreign system with rupees bolted on.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70">
              Most ERPs sold in Nepal are Western systems awkwardly retrofitted —
              wrong calendar, wrong fiscal year, wrong billing model. BuildMaster was
              designed for Nepali construction from the first line of code.
            </p>
          </div>

          <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {NEPAL.map((n) => (
              <div key={n.title}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-amber-400">
                  {n.icon}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-white">{n.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/60">{n.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}