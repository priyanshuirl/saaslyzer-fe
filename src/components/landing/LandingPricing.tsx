import { Button } from "@/components/ui/button";

const PRICING_TIERS = [
  {
    price: 0,
    arrRange: "Less than $10,000 Annual Recurring Revenue",
    short: "Best for early-stage SaaS startups under $10k ARR",
    description: "Free SaaS analytics for startups under $10,000 ARR. Track essential metrics and make data-driven decisions.",
    features: [
      "All essential SaaS metrics & analytics tools",
      "Customer segmentation and retention analysis",
      "Export metrics and reports as CSV",
      "Fully supports SaaS businesses under $10,000 ARR"
    ],
    cta: "Start Free"
  },
  {
    price: 50,
    arrRange: "$50,000 – $100,000 Annual Recurring Revenue",
    short: "Designed for established SaaS ($50k–$100k ARR)",
    description: "Premium analytics for SaaS brands with $50,000–$100,000 ARR. Custom metrics and API access for strategic insights.",
    features: [
      "Everything from tier 1 plus more advanced analytics",
      "Custom metrics and flexible business intelligence reports",
      "API access for integrations and reporting automation",
      "Supports SaaS revenue up to $100,000 ARR"
    ],
    cta: "Upgrade"
  },
  {
    price: 100,
    arrRange: "$10,000 – $50,000 Annual Recurring Revenue",
    short: "Ideal for growing SaaS businesses ($10k–$50k ARR)",
    description: "Advanced analytics for SaaS companies earning $10,000–$50,000 ARR. Accelerate growth with actionable insights.",
    features: [
      "All Free plan analytics plus advanced features",
      "Granular segmentation & filtering by customer and geography",
      "Customer cohort and retention analysis",
      "Robust analytics for SaaS with up to $50,000 ARR"
    ],
    cta: "Upgrade"
  }
];

export function LandingPricing() {
  return (
    <section
      className="py-20 px-4 bg-gradient-to-br from-[#edf5ff] via-[#f3e1ff] to-[#f9e8f8]"
      aria-labelledby="pricing-section"
      itemScope
      itemType="https://schema.org/OfferCatalog"
    >
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-14">
          <h2
            id="pricing-section"
            className="text-4xl font-extrabold bg-gradient-to-r from-indigo-900 via-fuchsia-700 to-pink-700 bg-clip-text text-transparent drop-shadow-lg max-w-3xl mx-auto"
            itemProp="name"
          >
            SaaS Analytics Pricing Plans - Transparent ARR-Based Tiers for Every Subscription Business
          </h2>
          <meta itemProp="alternateName" content="SaaS Analytics Platform Pricing & Plans by ARR" />
          <p className="text-lg text-gray-700 mt-3 max-w-2xl mx-auto" itemProp="description">
            Compare Saaslyzer’s <strong>Annual Recurring Revenue (ARR)</strong>-based SaaS analytics plans. No hidden fees—enjoy a risk-free <strong>14-day free trial</strong> with no credit card required.
            After your free trial, connect your Stripe account and we'll match you to the perfect plan for your current ARR. Easily upgrade as you scale your SaaS business.
          </p>
          <meta itemProp="keywords" content="SaaS pricing, SaaS analytics tiers, ARR pricing, Stripe integration, SaaS analytics pricing, SaaS business plans" />
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10" itemProp="itemListElement">
          {/* Tier 1: Free */}
          <article
            className="pricing-panel"
            aria-label="Free SaaS Analytics Plan for Early-Stage Startups"
            itemScope
            itemType="https://schema.org/Offer"
            itemProp="itemOffered"
          >
            <div className="mb-3 mt-3">
              <span className="text-5xl font-extrabold text-indigo-700" itemProp="price">${PRICING_TIERS[0].price}</span>
              <span className="text-gray-500">/month</span>
            </div>
            <h3 className="mb-2 text-base font-medium text-green-700" itemProp="category">
              Eligible: {PRICING_TIERS[0].arrRange}
            </h3>
            <p className="text-base text-gray-600 mb-7" itemProp="description">
              {PRICING_TIERS[0].description}
            </p>
            <ul className="pricing-features list-disc pl-5 mb-7">
              {PRICING_TIERS[0].features.map((f) => (
                <li key={f} itemProp="feature">{f}</li>
              ))}
            </ul>
            <Button className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold shadow-xl transition duration-200" aria-label="Start your free SaaS analytics trial">
              {PRICING_TIERS[0].cta}
            </Button>
            <meta itemProp="priceCurrency" content="USD" />
          </article>
          {/* Tier 2: $50/month, Prominent Style */}
          <article
            className="pricing-panel relative z-10 border-2 border-[#ea384c] shadow-2xl scale-[1.03]"
            aria-label="Premium SaaS Analytics Plan for Established SaaS"
            itemScope
            itemType="https://schema.org/Offer"
            itemProp="itemOffered"
          >
            <div className="popular-banner">Advanced Analytics</div>
            <div className="mb-3 mt-3">
              <span className="text-5xl font-extrabold text-pink-700" itemProp="price">${PRICING_TIERS[1].price}</span>
              <span className="text-gray-500">/month</span>
            </div>
            <h3 className="mb-2 text-base font-medium text-pink-700" itemProp="category">
              Eligible: {PRICING_TIERS[1].arrRange}
            </h3>
            <p className="text-base text-gray-600 mb-7" itemProp="description">
              {PRICING_TIERS[1].description}
            </p>
            <ul className="pricing-features list-disc pl-5 mb-7">
              {PRICING_TIERS[1].features.map((f) => (
                <li key={f} itemProp="feature">{f}</li>
              ))}
            </ul>
            <Button className="w-full bg-gradient-to-r from-pink-500 to-indigo-400 hover:from-pink-700 hover:to-indigo-700 text-white font-bold shadow-xl transition duration-200" aria-label="Upgrade to premium SaaS analytics" variant="outline">
              {PRICING_TIERS[1].cta}
            </Button>
            <meta itemProp="priceCurrency" content="USD" />
          </article>
          {/* Tier 3: $100/month, Standard Style */}
          <article
            className="pricing-panel"
            aria-label="Advanced SaaS Analytics Plan for Growing Companies"
            itemScope
            itemType="https://schema.org/Offer"
            itemProp="itemOffered"
          >
            <div className="mb-3 mt-3">
              <span className="text-5xl font-extrabold text-purple-700" itemProp="price">${PRICING_TIERS[2].price}</span>
              <span className="text-gray-500">/month</span>
            </div>
            <h3 className="mb-2 text-base font-medium text-purple-700" itemProp="category">
              Eligible: {PRICING_TIERS[2].arrRange}
            </h3>
            <p className="text-base text-gray-600 mb-7" itemProp="description">
              {PRICING_TIERS[2].description}
            </p>
            <ul className="pricing-features list-disc pl-5 mb-7">
              {PRICING_TIERS[2].features.map((f) => (
                <li key={f} itemProp="feature">{f}</li>
              ))}
            </ul>
            <Button className="w-full bg-gradient-to-r from-purple-500 via-indigo-600 to-pink-500 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-xl transition duration-200" aria-label="Upgrade to advanced SaaS analytics">
              {PRICING_TIERS[2].cta}
            </Button>
            <meta itemProp="priceCurrency" content="USD" />
          </article>
        </div>
        <footer className="text-center mt-10 text-gray-700 font-medium text-base" itemProp="description">
          <strong>Start your risk-free 14-day free trial of Saaslyzer’s SaaS analytics dashboard today.</strong>
          <br />
          After the trial, simply connect Stripe—your best-fit plan is selected automatically based on your business ARR, with transparent pricing to help you scale confidently.
        </footer>
      </div>
    </section>
  );
}
