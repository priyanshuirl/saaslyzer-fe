
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

/**
 * Call-to-action section: Enhanced for SEO with SaaS analytics keywords.
 */
export function LandingCta() {
  return (
    <section
      className="py-20 px-4 bg-gradient-to-r from-indigo-800 via-purple-700 to-pink-600 text-white"
      aria-label="Free SaaS Analytics Trial CTA"
      itemScope
      itemType="https://schema.org/WebPageElement"
    >
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-5 bg-clip-text text-transparent bg-gradient-to-tr from-white via-pink-200 to-yellow-100 drop-shadow-lg max-w-3xl mx-auto"
          itemProp="name"
        >
          Get Started with Saaslyzer – Your SaaS Analytics Platform
        </h2>
        <meta itemProp="alternativeHeadline" content="Start Your Free SaaS Analytics Trial: Grow Subscription Metrics Fast" />
        <p className="text-xl mb-10 text-pink-100/90 max-w-2xl mx-auto" itemProp="description">
          Join hundreds of software founders and SaaS companies using Saaslyzer to unlock in-depth insights into customer growth, optimize subscriptions, and drive revenue with comprehensive analytics.
        </p>
        <Button 
          size="lg" 
          className="bg-white/90 text-purple-800 hover:bg-white font-bold shadow-xl transition duration-200"
          asChild
        >
          <Link to="/signup" aria-label="Sign up for SaaS analytics free trial">
            Start Your Free 14-Day Trial
          </Link>
        </Button>
        <p className="mt-6 text-base text-pink-100/80 max-w-xl mx-auto" itemProp="description">
          No credit card required. Cancel anytime. Experience full SaaS analytics and forecasting for free.
        </p>
        <ul className="sr-only">
          <li>SaaS analytics free trial</li>
          <li>Subscription growth</li>
          <li>Stripe SaaS dashboard</li>
          <li>No credit card SaaS analytics trial</li>
        </ul>
        <meta itemProp="keywords" content="SaaS analytics trial, free SaaS analytics, business intelligence, subscription metrics, MRR, ARR, SaaS onboarding, SaaS demo, SaaS insights" />
      </div>
    </section>
  );
}
