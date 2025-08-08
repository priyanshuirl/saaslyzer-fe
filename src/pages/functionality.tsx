
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  BarChart3,
  LineChart,
  PieChart,
  Layers,
  RefreshCcw,
  Shield,
  Users,
  CreditCard,
  TrendingUp,
  BarChartHorizontal,
  Calendar,
  Gauge,
} from "lucide-react";

const Functionality = () => {
  const featureSections = [
    {
      title: "Analytics & Metrics",
      description:
        "Comprehensive analytics and key SaaS metrics for data-driven decisions",
      features: [
        {
          icon: <BarChart3 className="w-5 h-5 text-primary" />,
          name: "MRR & ARR Tracking",
          description:
            "Monitor your Monthly and Annual Recurring Revenue with detailed breakdowns and trends over time.",
        },
        {
          icon: <LineChart className="w-5 h-5 text-primary" />,
          name: "Growth & Churn Analysis",
          description:
            "Track customer acquisition, retention rates, and churn with comprehensive visualizations and reports.",
        },
        {
          icon: <PieChart className="w-5 h-5 text-primary" />,
          name: "Revenue Segmentation",
          description:
            "Segment your revenue by customer type, plan, geography, and other key dimensions.",
        },
        {
          icon: <Gauge className="w-5 h-5 text-primary" />,
          name: "Custom Metrics",
          description:
            "Create and track custom KPIs specific to your business model and goals.",
        },
      ],
    },
    {
      title: "Data Management",
      description: "Powerful data handling capabilities for your SaaS business",
      features: [
        {
          icon: <RefreshCcw className="w-5 h-5 text-primary" />,
          name: "Automated Sync",
          description:
            "Regular automated data synchronization with your Stripe account to keep metrics current.",
        },
        {
          icon: <Shield className="w-5 h-5 text-primary" />,
          name: "Secure Data Storage",
          description:
            "Enterprise-grade security for all your sensitive business and customer data.",
        },
        {
          icon: <Layers className="w-5 h-5 text-primary" />,
          name: "Historical Data",
          description:
            "Access historical performance data to identify long-term trends and patterns.",
        },
        {
          icon: <CreditCard className="w-5 h-5 text-primary" />,
          name: "Stripe Integration",
          description:
            "Seamless connection with your Stripe account for accurate subscription data.",
        },
      ],
    },
    {
      title: "User Experience",
      description: "Intuitive tools designed for SaaS business owners and analysts",
      features: [
        {
          icon: <Users className="w-5 h-5 text-primary" />,
          name: "Multi-User Access",
          description:
            "Grant controlled access to team members with role-based permissions.",
        },
        {
          icon: <TrendingUp className="w-5 h-5 text-primary" />,
          name: "Customizable Dashboards",
          description:
            "Create personalized dashboards focusing on the metrics that matter most to your team.",
        },
        {
          icon: <BarChartHorizontal className="w-5 h-5 text-primary" />,
          name: "Exportable Reports",
          description:
            "Generate and export detailed reports for stakeholders and team meetings.",
        },
        {
          icon: <Calendar className="w-5 h-5 text-primary" />,
          name: "Scheduled Insights",
          description:
            "Set up automated reports delivered to your inbox on your preferred schedule.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faff] via-[#f2e7fa] to-[#e8e6fa]">
      {/* Hero Section */}
      <header className="py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-800 via-purple-700 to-pink-600 bg-clip-text text-transparent">
            SaaS Analytics Platform Functionality
          </h1>
          <p className="mt-6 text-xl text-gray-700 max-w-2xl mx-auto">
            Discover the powerful features and capabilities of our SaaS analytics platform designed to help you track, analyze, and optimize your subscription business.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="font-medium">
              <Link to="/signup">Start Free Trial</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-medium">
              <Link to="/docs">View Documentation</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Features Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {featureSections.map((section, index) => (
          <section key={section.title} className={`py-16 ${index > 0 ? "border-t border-gray-200" : ""}`}>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">{section.title}</h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                {section.description}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {section.features.map((feature) => (
                <div
                  key={feature.name}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.name}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary/90 to-secondary/90 rounded-2xl p-8 sm:p-10 text-white mt-16">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to optimize your SaaS metrics?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Start tracking your key business metrics today and make data-driven decisions for your subscription business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="font-medium bg-white text-primary hover:bg-gray-100">
                <Link to="/signup">Start Free Trial</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10 font-medium">
                <Link to="/">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Functionality;
