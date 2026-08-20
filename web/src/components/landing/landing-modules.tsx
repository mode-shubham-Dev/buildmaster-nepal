const GROUPS = [
  { label: "Projects & Field", items: ["Projects", "Tenders", "BOQ", "Milestones", "Site Reports"] },
  { label: "Procurement & Stock", items: ["Materials", "Warehouse", "Purchases", "Suppliers", "Subcontractors"] },
  { label: "Assets & People", items: ["Equipment", "Fleet", "Attendance", "Leave", "Payroll"] },
  { label: "Finance & Records", items: ["Client Billing", "Expenses", "Documents", "Reports", "Clients"] },
];

export function LandingModules() {
  return (
    <section id="modules" className="bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-amber-600">One connected platform</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1a1d23] sm:text-4xl">
            Every part of the operation, in one place.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Each module is powerful on its own — and every one shares the same data, so nothing
            is entered twice and nothing falls through the cracks.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {GROUPS.map((g) => (
            <div key={g.label} className="rounded-xl border border-slate-200 bg-[#fafafa] p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">{g.label}</p>
              <ul className="mt-3 space-y-2">
                {g.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}