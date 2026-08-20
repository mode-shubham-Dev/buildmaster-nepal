import Link from "next/link";
import { HardHat } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col justify-between gap-8 sm:flex-row">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-[#1a1d23]">
                <HardHat className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <span className="text-base font-semibold tracking-tight text-[#1a1d23]">
                BuildMaster <span className="text-amber-500">Nepal</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Construction management software built for Nepali firms — projects,
              billing, payroll, and inventory in one place.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 sm:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Product</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><a href="#features" className="transition hover:text-[#1a1d23]">Features</a></li>
                <li><a href="#nepal" className="transition hover:text-[#1a1d23]">Built for Nepal</a></li>
                <li><a href="#modules" className="transition hover:text-[#1a1d23]">Modules</a></li>
                <li><Link href="/login" className="transition hover:text-[#1a1d23]">Log in</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Company</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><span className="text-slate-400">Lalitpur, Nepal</span></li>
                <li><span className="text-slate-400">info@buildmaster.com.np</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-100 pt-6">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} BuildMaster Nepal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}


