
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface MonthlyData {
  month: string;
  year: number;
  total_subscriptions: number;
  total_mrr: number;
  total_arr: number;
  countries: string[];
}

const MonthlyMetricsBreakdown = () => {
  const { authState } = useAuth();
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMonthlyBreakdown = async () => {
    if (!authState.user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('monthly-breakdown', {
        body: { user_id: authState.user.id }
      });

      if (error) {
        console.error('Error fetching monthly breakdown:', error);
        return;
      }

      setMonthlyData(data.monthlyData || []);
    } catch (error) {
      console.error('Error fetching monthly breakdown:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyBreakdown();
  }, [authState.user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const calculateGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getGrowthIcon = (growthRate: number) => {
    if (growthRate > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (growthRate < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getGrowthColor = (growthRate: number) => {
    if (growthRate > 0) return "text-green-500";
    if (growthRate < 0) return "text-red-500";
    return "text-gray-400";
  };

  // Prepare chart data
  const chartData = monthlyData.map((item, index) => {
    const previousMonth = monthlyData[index + 1];
    const mrrGrowth = previousMonth ? calculateGrowthRate(item.total_mrr, previousMonth.total_mrr) : 0;
    
    return {
      period: `${item.month.substring(0, 3)} ${item.year}`,
      mrr: item.total_mrr,
      subscribers: item.total_subscriptions,
      mrrGrowth
    };
  }).reverse(); // Reverse to show chronological order

  const currentMRR = monthlyData.length > 0 ? monthlyData[0].total_mrr : 0;
  const previousMRR = monthlyData.length > 1 ? monthlyData[1].total_mrr : 0;
  const mrrGrowthRate = calculateGrowthRate(currentMRR, previousMRR);

  // Custom tooltip formatter that handles ValueType properly
  const formatTooltipValue = (value: any): string => {
    if (typeof value === 'number') {
      return formatCurrency(value);
    }
    return String(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Monthly Metrics Breakdown
          </h2>
          <p className="text-gray-600 mt-1">Track your subscription metrics over time</p>
        </div>
        <Button
          onClick={fetchMonthlyBreakdown}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current MRR</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentMRR)}</p>
              </div>
              <div className="flex items-center gap-1">
                {getGrowthIcon(mrrGrowthRate)}
                <span className={`text-sm font-medium ${getGrowthColor(mrrGrowthRate)}`}>
                  {mrrGrowthRate > 0 ? '+' : ''}{mrrGrowthRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">MRR Growth</p>
                <p className={`text-2xl font-bold ${getGrowthColor(mrrGrowthRate)}`}>
                  {formatCurrency(currentMRR - previousMRR)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-sm font-medium ${getGrowthColor(mrrGrowthRate)}`}>
                  {mrrGrowthRate > 0 ? '+' : ''}{mrrGrowthRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Subscribers</p>
              <p className="text-2xl font-bold text-gray-900">
                {monthlyData.length > 0 ? monthlyData[0].total_subscriptions : 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MRR Chart */}
        <Card>
          <CardHeader>
            <CardTitle>MRR Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">Loading MRR data...</div>
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  No monthly data available. Try syncing your data first.
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip formatter={(value) => [formatTooltipValue(value), 'MRR']} />
                  <Line 
                    type="monotone" 
                    dataKey="mrr" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Subscribers Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Subscriber Growth</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">Loading subscriber data...</div>
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  No subscriber data available.
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value) => [String(value), 'Subscribers']} />
                  <Line 
                    type="monotone" 
                    dataKey="subscribers" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading monthly data...</div>
          ) : monthlyData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No monthly data available. Try syncing your data first.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Period</th>
                    <th className="text-right py-3 px-4 font-medium">MRR</th>
                    <th className="text-right py-3 px-4 font-medium">Growth</th>
                    <th className="text-right py-3 px-4 font-medium">Subscribers</th>
                    <th className="text-left py-3 px-4 font-medium">Countries</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((row, index) => {
                    const previousRow = monthlyData[index + 1];
                    const growthRate = previousRow ? calculateGrowthRate(row.total_mrr, previousRow.total_mrr) : 0;
                    
                    return (
                      <tr key={`${row.month}-${row.year}`} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{row.month} {row.year}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(row.total_mrr)}</td>
                        <td className={`py-3 px-4 text-right ${getGrowthColor(growthRate)}`}>
                          <div className="flex items-center justify-end gap-1">
                            {getGrowthIcon(growthRate)}
                            <span>{growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">{row.total_subscriptions}</td>
                        <td className="py-3 px-4">
                          <div className="max-w-xs">
                            {row.countries.slice(0, 3).join(', ')}
                            {row.countries.length > 3 && ` (+${row.countries.length - 3} more)`}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyMetricsBreakdown;
