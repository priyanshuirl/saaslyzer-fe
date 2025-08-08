
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket, BarChart, Star } from "lucide-react";

/**
 * Hero section of SaaS Analytics Home Page - SEO Enhanced
 */
export function LandingHero() {
  return (
    <section
      className="w-full bg-gradient-to-br from-indigo-50 via-purple-100 to-indigo-200 py-16 md:py-24 px-4 md:px-8"
      itemScope
      itemType="https://schema.org/WebPage"
      aria-label="SaaS Analytics Platform Hero Section"
    >
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Rocket className="text-indigo-600 w-8 h-8" />
          <span className="text-2xl font-bold text-indigo-900" itemProp="name">
            Saaslyzer: SaaS Metrics & Analytics
          </span>
        </div>
        <h1
          className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900 leading-tight mb-2 max-w-3xl mx-auto"
          itemProp="headline"
        >
          Comprehensive <span className="text-purple-600">SaaS Analytics & Metrics</span> for Subscription Businesses
        </h1>
        <meta itemProp="alternativeHeadline" content="Subscription Business Reporting and Analytics Dashboard" />
        <p
          className="text-lg md:text-xl text-indigo-800 mb-4 max-w-2xl mx-auto"
          itemProp="description"
        >
          Instantly gain actionable insights into your SaaS performance: monitor Monthly Recurring Revenue (MRR), Annual Recurring Revenue (ARR), Lifetime Value (LTV), churn rates, and more with Saaslyzer's advanced analytics dashboard.
          Connect your <strong>Stripe account</strong> securely and start optimizing subscription growth, customer segmentation, and revenue forecasting for your SaaS product today.
        </p>
        <ul className="sr-only">
          <li>SaaS analytics for Stripe, MRR, ARR, LTV</li>
          <li>Customer segmentation and forecasting</li>
          <li>Subscription business insights</li>
        </ul>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-lg"
            asChild
          >
            <Link to="/signup" aria-label="Start Free SaaS Analytics Trial">
              Start Your Free Trial
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto border-indigo-400 text-indigo-700 hover:bg-indigo-50 shadow-md"
            asChild
          >
            <Link to="/#features" aria-label="See SaaS Analytics Features">
              View Features
            </Link>
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <span className="inline-flex items-center bg-white/70 px-3 py-1 rounded-full text-sm text-indigo-800 shadow-sm">
            <Star className="mr-2 w-4 h-4 text-yellow-500" />
            14-day Free Trial – No commitment
          </span>
          <span className="inline-flex items-center bg-white/70 px-3 py-1 rounded-full text-sm text-indigo-800 shadow-sm">
            <BarChart className="mr-2 w-4 h-4 text-indigo-600" />
            No Credit Card Required – Secure Analytics
          </span>
        </div>
        <meta itemProp="keywords" content="SaaS analytics, stripe integration, subscription KPIs, subscription business analytics, MRR, ARR, LTV, churn, business insights, SaaS dashboard" />
        <meta itemProp="publisher" content="Saaslyzer" />
      </div>
    </section>
  );
}

