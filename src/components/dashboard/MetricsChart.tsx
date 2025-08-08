
import { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer } from "recharts";
import { DashboardData, SegmentedMetrics } from "../../types";

interface MetricsChartProps {
  data: DashboardData | null;
  segmentType: "country" | "plan";
  metricType: "mrr" | "arr" | "ltv" | "active_subscriptions";
  title: string;
}

const MetricsChart = ({ data, segmentType, metricType, title }: MetricsChartProps) => {
  if (!data) return null;

  const segmentData = segmentType === "country" ? data.by_country : data.by_plan;
  
  // Transform the segmented data for the chart
  const chartData = Object.entries(segmentData).map(([segment, metrics]) => ({
    name: segment,
    value: metrics[metricType],
  }));

  const formatYAxis = (value: number) => {
    if (metricType === "active_subscriptions") {
      return value.toString();
    }
    
    // For money values
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value}`;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatYAxis} />
            <Tooltip 
              formatter={(value: number) => {
                if (metricType === "active_subscriptions") {
                  return [value.toString(), "Subscriptions"];
                }
                return [`$${value.toLocaleString()}`, metricType.toUpperCase()];
              }}
            />
            <Bar 
              dataKey="value" 
              fill={metricType === "mrr" || metricType === "arr" ? "#0ea5e9" : 
                    metricType === "ltv" ? "#8B5CF6" : "#10B981"} 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default MetricsChart;
