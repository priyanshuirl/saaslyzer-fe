
import { BarChart, Globe, CreditCard, LineChart, Download, Users } from "lucide-react";

/**
 * Key Features section with enhanced SEO for SaaS Analytics
 */
export function LandingFeatures() {
  return (
    <section
      id="features"
      className="py-20 px-4 bg-gradient-to-br from-[#f8faff] via-[#f2e7fa] to-[#e8e6fa]"
      aria-label="Key Features of Saaslyzer Analytics Platform"
      itemScope
      itemType="https://schema.org/WebPageElement"
    >
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-14">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-800 via-purple-700 to-pink-600 bg-clip-text text-transparent max-w-3xl mx-auto" itemProp="name">
            SaaS Analytics Platform – Key Features and Benefits
          </h2>
          <meta itemProp="alternateName" content="SaaS Analytics Features: Metrics, Dashboards, Security, Export, Cohorts" />
          <p className="text-lg text-gray-600 mt-3 max-w-2xl mx-auto" itemProp="description">
            All-in-one SaaS analytics dashboard designed for subscription-based businesses: Track critical metrics, visualize your growth, and make informed decisions with actionable data insights.
          </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Feature Card */}
          <article className="feature-panel" itemScope itemType="https://schema.org/SoftwareApplication">
            <div className="icon-glass bg-gradient-to-tr from-indigo-500 via-purple-400 to-pink-400">
              <BarChart className="h-7 w-7 text-white" />
            </div>
            <h3 className="feature-title" itemProp="feature">Complete SaaS Metrics Coverage</h3>
            <p className="feature-desc" itemProp="description">
              Track and analyze Monthly Recurring Revenue (MRR), Annual Recurring Revenue (ARR), Customer Lifetime Value (LTV), and churn rate—all automatically synced from your Stripe subscription data.
            </p>
            <meta itemProp="applicationCategory" content="Analytics" />
          </article>
          <article className="feature-panel" itemScope itemType="https://schema.org/SoftwareApplication">
            <div className="icon-glass bg-gradient-to-tr from-purple-500 via-fuchsia-500 to-indigo-400">
              <Globe className="h-7 w-7 text-white" />
            </div>
            <h3 className="feature-title" itemProp="feature">Advanced Segmentation Analytics</h3>
            <p className="feature-desc" itemProp="description">
              Segment subscription metrics by geography, plan, and customer profile to identify opportunities for growth in your SaaS business.
            </p>
            <meta itemProp="applicationCategory" content="Segmentation" />
          </article>
          <article className="feature-panel" itemScope itemType="https://schema.org/SoftwareApplication">
            <div className="icon-glass bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-300">
              <CreditCard className="h-7 w-7 text-white" />
            </div>
            <h3 className="feature-title" itemProp="feature">Secure Stripe Integration</h3>
            <p className="feature-desc" itemProp="description">
              Connect your Stripe account in seconds. Saaslyzer never stores payment data and ensures enterprise-grade security for your subscription analytics.
            </p>
            <meta itemProp="applicationCategory" content="Security" />
          </article>
          <article className="feature-panel" itemScope itemType="https://schema.org/SoftwareApplication">
            <div className="icon-glass bg-gradient-to-tr from-indigo-400 via-blue-500 to-purple-500">
              <LineChart className="h-7 w-7 text-white" />
            </div>
            <h3 className="feature-title" itemProp="feature">Interactive Data Dashboards</h3>
            <p className="feature-desc" itemProp="description">
              Visualize revenue trends, cohort analysis, and retention rates with beautiful, interactive charts and graphs that update in real-time.
            </p>
            <meta itemProp="applicationCategory" content="Dashboard" />
          </article>
          <article className="feature-panel" itemScope itemType="https://schema.org/SoftwareApplication">
            <div className="icon-glass bg-gradient-to-tr from-indigo-500 via-purple-400 to-pink-500">
              <Download className="h-7 w-7 text-white" />
            </div>
            <h3 className="feature-title" itemProp="feature">Export & Share Analytics</h3>
            <p className="feature-desc" itemProp="description">
              Easily export all your key SaaS metrics as CSV files for reporting, collaboration, or additional analysis with your team and stakeholders.
            </p>
            <meta itemProp="applicationCategory" content="Export" />
          </article>
          <article className="feature-panel" itemScope itemType="https://schema.org/SoftwareApplication">
            <div className="icon-glass bg-gradient-to-tr from-indigo-500 via-purple-400 to-pink-500">
              <Users className="h-7 w-7 text-white" />
            </div>
            <h3 className="feature-title" itemProp="feature">Multi-Tenant Support for Agencies</h3>
            <p className="feature-desc" itemProp="description">
              Manage multiple SaaS businesses and client accounts in a single dashboard, with secure data isolation by workspace. Perfect for SaaS agencies and analytics consultants.
            </p>
            <meta itemProp="applicationCategory" content="Multi-Tenant" />
          </article>
        </div>
        <meta itemProp="keywords" content="SaaS dashboard, Stripe analytics, subscription metrics, SaaS features, revenue tracking, cohort analysis, SaaS segmentation, analytics export, multi-tenant SaaS, SaaS platform benefits" />
      </div>
    </section>
  );
}
