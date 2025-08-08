
import { DashboardData } from "@/types";
import MetricCard from "./MetricCard";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricsGridProps {
  data: DashboardData | null;
  isLoading: boolean;
}

const MetricsGrid = ({ data, isLoading }: MetricsGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No data available. Please sync your Stripe data.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <MetricCard
        title="Monthly Recurring Revenue"
        value={data.mrr.current}
        currency={data.currency}
        trend={data.mrr.trend}
        icon="dollar"
        className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
      />
      
      <MetricCard
        title="Annual Recurring Revenue"
        value={data.arr.current}
        currency={data.currency}
        trend={data.arr.trend}
        icon="chart"
        className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
      />
      
      <MetricCard
        title="Customer Lifetime Value"
        value={data.ltv.current}
        currency={data.currency}
        trend={data.ltv.trend}
        icon="activity"
        className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
      />
      
      <MetricCard
        title="Active Subscriptions"
        value={data.active_subscriptions.current}
        trend={data.active_subscriptions.trend}
        icon="users"
        className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
      />
    </div>
  );
};

export default MetricsGrid;
