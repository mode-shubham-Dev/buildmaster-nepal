import Link from "next/link";
import { ArrowRight, Phone, Mail } from "lucide-react";

export function LandingCTA() {
  return (
    <section className="bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-2xl border border-slate-200 bg-[#fafafa] px-8 py-14 lg:px-16">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-[#1a1d23] sm:text-4xl">
                See BuildMaster with your projects in mind.
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600">
                Book a free walkthrough. We&rsquo;ll show you how BuildMaster fits the way
                your firm already works — from your first site report to your final RA bill.
              </p>
            </div>

            <div className="lg:justify-self-end">
              <div className="flex flex-wrap gap-3">
                <Link href="/login" className="flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-[#1a1d23] transition hover:bg-amber-400">
                  Request a Demo <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/login" className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  Log in
                </Link>
              </div>
              <div className="mt-5 space-y-2">
                <p className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" /> 01-5521234
                </p>
                <p className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" /> info@buildmaster.com.np
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}