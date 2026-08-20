import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function LandingCTA() {
  return (
    <section className="py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-2xl border border-slate-200 bg-[#fafafa] px-8 py-14 text-center lg:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-[#1a1d23]">
            Ready to bring your whole operation together?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
            See how BuildMaster Nepal fits the way your firm already works.
            Request a walkthrough and we&rsquo;ll show you the system with your kind of projects in mind.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/login" className="flex items-center gap-2 rounded-lg bg-[#1a1d23] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#2a2e37]">
              Request a demo <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}