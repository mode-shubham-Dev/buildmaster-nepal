import { Layers, Receipt, Package, Truck, Users, BarChart3 } from "lucide-react";

const FEATURES = [
  { icon: <Layers className="h-5 w-5" />, title: "Project & BOQ Management", body: "Tender to handover — BOQ, milestones, site reports, and progress tracked against budget in real time." },
  { icon: <Receipt className="h-5 w-5" />, title: "RA Billing & Retention", body: "Running Account bills the Nepali way — cumulative, with retention, 13% VAT, and advance recovery calculated for you." },
  { icon: <Package className="h-5 w-5" />, title: "Procurement & Stock", body: "Purchase orders, suppliers, and a live stock ledger across every warehouse and site — nothing over-issued." },
  { icon: <Truck className="h-5 w-5" />, title: "Equipment & Fleet", body: "Track machinery and vehicles with fuel, maintenance, and running-cost logs for every asset on every project." },
  { icon: <Users className="h-5 w-5" />, title: "Attendance & Payroll", body: "Site attendance, leave, and payroll connected — unpaid leave flows into salary automatically, payslips locked and auditable." },
  { icon: <BarChart3 className="h-5 w-5" />, title: "Reports & Analytics", body: "Project profitability, outstanding dues, and spending — live numbers you can trust for every decision." },
];

export function LandingFeatures() {
  return (
    <section id="features" className="bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-amber-600">Everything in one place</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1a1d23] sm:text-4xl">
            Built for the whole construction business.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            No more scattered files, separate registers, and numbers that never match.
            Every part of your firm — field and office — shares one trusted system.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-6 transition hover:border-amber-300 hover:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                {f.icon}
              </div>
              <h3 className="mt-4 text-base font-semibold text-[#1a1d23]">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}