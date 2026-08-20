const MODULES = [
  "Projects", "Tenders", "BOQ", "Milestones", "Site Reports", "Clients",
  "Materials", "Warehouse & Stock", "Purchases", "Suppliers", "Subcontractors",
  "Equipment", "Fleet", "Attendance", "Leave", "Payroll",
  "Expenses", "Client Billing", "Documents", "Reports",
];

export function LandingModules() {
  return (
    <section id="modules" className="border-b border-slate-100 py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-amber-600">One connected platform</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1a1d23]">
            Twenty-plus modules, working as one.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Each module is powerful on its own — and every one shares the same data,
            so nothing is entered twice and nothing falls through the cracks.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap gap-2.5">
          {MODULES.map((m) => (
            <span key={m} className="rounded-lg border border-slate-200 bg-[#fafafa] px-3.5 py-2 text-sm font-medium text-slate-600">
              {m}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}