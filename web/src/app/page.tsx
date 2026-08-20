import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingNepal } from "@/components/landing/landing-nepal";
import { LandingModules } from "@/components/landing/landing-modules";
import { LandingCTA } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingNepal />
        <LandingModules />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
