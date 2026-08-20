import { Layers, Receipt, Package, CircleDollarSign, BarChart3, ShieldCheck } from "lucide-react";

const FEATURES = [
  {
    icon: <Layers className="h-5 w-5" />,
    title: "Projects & BOQ",
    body: "Track every project from tender to handover — bill of quantities, milestones, site reports, and progress in one connected view.",
  },
  {
    icon: <Receipt className="h-5 w-5" />,
    title: "RA Billing",
    body: "Running Account bills the way Nepali construction works — cumulative, progressive, with retention, VAT, and advance recovery handled automatically.",
  },
  {
    icon: <Package className="h-5 w-5" />,
    title: "Inventory & Procurement",
    body: "Purchase orders, supplier management, and a real stock ledger — every material movement tracked, never over-issued.",
  },
  {
    icon: <CircleDollarSign className="h-5 w-5" />,
    title: "Payroll & HR",
    body: "Attendance, leave, and payroll that talk to each other — unpaid leave flows into salary automatically, with locked, auditable payslips.",
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Reports & Analytics",
    body: "Know exactly where you stand — project profitability, outstanding receivables, and spending, computed live from real data.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Roles & Control",
    body: "Fine-grained permissions and approval workflows — separation of duties on every sensitive step, from purchases to payroll.",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="border-b border-slate-100 py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-amber-600">Everything in one system</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1a1d23]">
            Built for the whole business, not just one department.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Most firms stitch together spreadsheets, separate tools, and paper.
            BuildMaster connects the entire operation — so a site report, a purchase,
            and a payment all live in the same trusted place.
          </p>
        </div>

        <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title}>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#1a1d23] text-amber-400">
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