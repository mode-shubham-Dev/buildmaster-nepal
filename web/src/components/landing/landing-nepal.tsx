import { Calendar, FileText, Landmark, Building2, Check } from "lucide-react";

const NEPAL = [
  { icon: <Calendar className="h-5 w-5" />, title: "Bikram Sambat calendar", body: "Every date in BS, the way your team reads it — built in, not bolted on." },
  { icon: <FileText className="h-5 w-5" />, title: "RA bills & retention", body: "The progressive billing model Nepali contractors actually use, done correctly." },
  { icon: <Landmark className="h-5 w-5" />, title: "PAN/VAT & 13% VAT", body: "Nepali tax fields and rates throughout your bills and documents." },
  { icon: <Building2 className="h-5 w-5" />, title: "Shrawan–Ashadh fiscal year", body: "Reporting and payroll aligned to Nepal's official fiscal calendar." },
];

export function LandingNepal() {
  return (
    <section id="nepal" className="bg-[#fafafa] py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          {/* left */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              नेपालका लागि बनाइएको · Made for Nepal
            </div>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#1a1d23] sm:text-4xl">
              Not a foreign system with rupees bolted on.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Most ERPs sold here are Western systems awkwardly retrofitted — wrong calendar,
              wrong fiscal year, wrong billing model. BuildMaster was designed for Nepali
              construction from the first line of code.
            </p>
            <ul className="mt-6 space-y-2.5">
              {["No workarounds for local billing", "No manual date conversion", "No fighting a foreign fiscal year"].map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/15 text-amber-600">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* right — cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {NEPAL.map((n) => (
              <div key={n.title} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a1d23] text-amber-400">
                  {n.icon}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-[#1a1d23]">{n.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{n.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}