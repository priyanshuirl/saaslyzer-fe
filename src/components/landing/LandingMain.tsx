
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingPricing } from "@/components/landing/LandingPricing";
import { LandingCta } from "@/components/landing/LandingCta";
// Removed LandingFooterCta import

export function LandingMain() {
  return (
    <main className="w-full flex-1">
      <LandingHero />
      <LandingFeatures />
      <LandingPricing />
      <LandingCta />
      {/* Removed LandingFooterCta component */}
    </main>
  );
}
