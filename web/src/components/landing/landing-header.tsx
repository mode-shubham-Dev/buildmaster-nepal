"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HardHat, Menu, X } from "lucide-react";

const NAV = [
  { label: "Features", href: "#features" },
  { label: "Built for Nepal", href: "#nepal" },
  { label: "Modules", href: "#modules" },
];

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 border-b transition-colors ${scrolled ? "border-slate-200 bg-white/90 backdrop-blur" : "border-transparent bg-white"}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-[#1a1d23]">
            <HardHat className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <span className="text-base font-semibold tracking-tight text-[#1a1d23]">
            BuildMaster <span className="text-amber-500">Nepal</span>
          </span>
        </Link>

        {/* desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="text-sm font-medium text-slate-600 transition hover:text-[#1a1d23]">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="text-sm font-medium text-slate-600 transition hover:text-[#1a1d23]">
            Log in
          </Link>
          <Link href="/login" className="rounded-lg bg-[#1a1d23] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2a2e37]">
            Request a demo
          </Link>
        </div>

        {/* mobile toggle */}
        <button onClick={() => setOpen((o) => !o)} className="text-slate-600 md:hidden">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* mobile menu */}
      {open && (
        <div className="border-t border-slate-100 bg-white md:hidden">
          <nav className="flex flex-col px-6 py-3">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="py-2.5 text-sm font-medium text-slate-600">
                {n.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3">
              <Link href="/login" className="py-2 text-sm font-medium text-slate-600">Log in</Link>
              <Link href="/login" className="rounded-lg bg-[#1a1d23] px-4 py-2.5 text-center text-sm font-medium text-white">Request a demo</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}