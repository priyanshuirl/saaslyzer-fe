import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalytics } from "@/context/AnalyticsContext";
import { useStripe } from "@/context/StripeContext";
import { useAuth } from "@/context/AuthContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { AlertCircle, Download, PieChart as PieChartIcon, BarChart as BarChartIcon, LineChart as LineChartIcon, TrendingUp, Zap, Calendar } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { exportToCsv } from "@/utils/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import MonthlyMetricsBreakdown from "@/components/analytics/MonthlyMetricsBreakdown";

// Dummy historical data for MRR over time (when real data isn't available yet)
const generateHistoricalData = (months = 12) => {
  const data = [];
  const today = new Date();
  let baseValue = 5000;
  
  for (let i = months; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - i);
    
    // Add some random fluctuation
    const randomChange = (Math.random() * 0.15) - 0.05;  // Between -5% and +10%
    baseValue = baseValue * (1 + randomChange);
    
    data.push({
      date: date.toISOString().split('T')[0],
      mrr: Math.round(baseValue),
      customers: Math.round(baseValue / 50), // Approx $50 per customer
    });
  }
  
  return data;
};

// Placeholder color scheme for charts
const COLORS = ['#8B5CF6', '#0EA5E9', '#10B981', '#F97316', '#EC4899', '#8B5CF6', '#14B8A6'];

const Analytics = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { stripeState } = useStripe();
  const { 
    dashboardData, 
    isLoading, 
    refreshData,
    selectedCountry,
    selectedPlan
  } = useAnalytics();
  
  const [activeTab, setActiveTab] = useState("trends");
  const [historicalData, setHistoricalData] = useState([]);
  const [maxSegments, setMaxSegments] = useState(8);

  // Redirect if not logged in
  useEffect(() => {
    if (!authState.user && !authState.isLoading) {
      navigate("/login");
    }
  }, [authState, navigate]);

  // Generate placeholder historical data when real data isn't available
  useEffect(() => {
    setHistoricalData(generateHistoricalData());
  }, []);

  // Show loading state while checking authentication
  if (authState.isLoading) {
    return <div>Loading...</div>;
  }

  // Guard clause if user is not authenticated
  if (!authState.user) {
    return null;
  }

  // Show connect component if not connected to Stripe
  if (!stripeState.isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Connect to Stripe</CardTitle>
            <CardDescription>
              Please connect your Stripe account to access analytics features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/dashboard")}>
              Go to Dashboard to Connect
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group smaller segments into an "Other" category for better visualization
  const groupSmallSegments = (data, threshold = 3) => {
    if (!data || data.length === 0) return [];
    
    // Sort by value in descending order
    const sortedData = [...data].sort((a, b) => b.value - a.value);
    
    // Keep top segments based on maxSegments state
    const topSegments = sortedData.slice(0, maxSegments);
    
    // Calculate the sum of the remaining segments if any
    if (sortedData.length > maxSegments) {
      const otherSum = sortedData
        .slice(maxSegments)
        .reduce((sum, item) => sum + item.value, 0);
      
      // Only add "Other" if it's significant enough (above threshold %)
      if (otherSum > 0) {
        const totalValue = sortedData.reduce((sum, item) => sum + item.value, 0);
        const otherPercentage = (otherSum / totalValue) * 100;
        
        if (otherPercentage >= threshold) {
          topSegments.push({
            name: "Other",
            value: otherSum
          });
        }
      }
    }
    
    return topSegments;
  };

  // Prepare country distribution data for pie chart
  const prepareDistributionData = () => {
    if (!dashboardData) return [];
    
    // Convert country metrics to array format for charts
    const rawData = Object.entries(dashboardData.by_country).map(([country, metrics]) => ({
      name: country,
      value: metrics.mrr
    }));
    
    return groupSmallSegments(rawData);
  };

  // Prepare plan distribution data for pie chart
  const preparePlanDistributionData = () => {
    if (!dashboardData) return [];
    
    // Convert plan metrics to array format for charts
    const rawData = Object.entries(dashboardData.by_plan).map(([plan, metrics]) => ({
      name: plan,
      value: metrics.mrr
    }));
    
    return groupSmallSegments(rawData);
  };

  // Handle export of trend data
  const handleExportTrends = () => {
    const csvData = historicalData.map(item => ({
      Date: item.date,
      MRR: item.mrr,
      Customers: item.customers
    }));
    
    exportToCsv(csvData, "saaslyzer-trends.csv");
    toast({
      title: "Export successful",
      description: "Trend data has been exported to CSV"
    });
  };

  // Handle export of segmentation data
  const handleExportSegmentation = () => {
    if (!dashboardData) return;
    
    const countryData = Object.entries(dashboardData.by_country).map(([country, metrics]) => ({
      Segment: country,
      MRR: metrics.mrr,
      "Active Subscriptions": metrics.active_subscriptions,
      LTV: metrics.ltv
    }));
    
    exportToCsv(countryData, "saaslyzer-segmentation.csv");
    toast({
      title: "Export successful",
      description: "Segmentation data has been exported to CSV"
    });
  };

  // Format a date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Loading skeleton for charts
  const ChartSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-[250px]" />
      <Skeleton className="h-[300px] w-full rounded-md" />
    </div>
  );

  // Custom pie chart label renderer
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Only show label if the segment is big enough (more than 3%)
    if (percent < 0.03) return null;
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="#333" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900">
            Advanced Analytics
          </h1>
          <p className="mt-3 text-lg text-indigo-800 sm:mt-4">
            Gain deeper insights into your subscription metrics and customer behavior
          </p>
        </div>

        {/* Main content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border border-purple-100 rounded-lg">
            <TabsTrigger value="trends">
              <LineChartIcon className="h-4 w-4 mr-2" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="segmentation">
              <PieChartIcon className="h-4 w-4 mr-2" /> 
              Segmentation
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <BarChartIcon className="h-4 w-4 mr-2" />
              Key Metrics
            </TabsTrigger>
            <TabsTrigger value="monthly">
              <Calendar className="h-4 w-4 mr-2" />
              Monthly
            </TabsTrigger>
          </TabsList>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-100 shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                    MRR & Customers Over Time
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleExportTrends}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
                
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={historicalData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate} 
                      tick={{ fontSize: 12 }}
                      height={60}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis 
                      yAxisId="left"
                      tickFormatter={(value) => formatCurrency(value)} 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === "mrr") return formatCurrency(value);
                        return value;
                      }}
                      labelFormatter={formatDate}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="mrr" 
                      name="MRR" 
                      stroke="#8B5CF6" 
                      strokeWidth={2} 
                      dot={{ strokeWidth: 2 }} 
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="customers" 
                      name="Customers" 
                      stroke="#0EA5E9" 
                      strokeWidth={2} 
                      dot={{ strokeWidth: 2 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
                
                <div className="mt-6 text-sm text-gray-600">
                  <p className="flex items-center">
                    <Zap className="mr-2 h-4 w-4 text-amber-500" />
                    Note: Historical data visualization is currently in beta.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Segmentation Tab */}
          <TabsContent value="segmentation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Country Distribution */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-100 shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Revenue by Country
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-2">
                      <label htmlFor="maxSegments" className="text-sm text-gray-600">
                        Top:
                      </label>
                      <select
                        id="maxSegments"
                        value={maxSegments}
                        onChange={(e) => setMaxSegments(Number(e.target.value))}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="5">5</option>
                        <option value="8">8</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                      </select>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleExportSegmentation}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>

                {isLoading ? (
                  <ChartSkeleton />
                ) : !dashboardData ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No data available</AlertTitle>
                      <AlertDescription>
                        Connect your Stripe account to see country distribution.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="flex flex-col items-center h-[350px]">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={prepareDistributionData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={renderCustomLabel}
                        >
                          {prepareDistributionData().map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => formatCurrency(value)} 
                          itemSorter={(item) => -item.value}
                        />
                        <Legend layout="vertical" align="right" verticalAlign="middle" />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    <div className="mt-2 text-sm text-center text-gray-600">
                      Based on Monthly Recurring Revenue (MRR)
                    </div>
                  </div>
                )}
              </div>

              {/* Plan Distribution */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-100 shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Revenue by Plan
                  </h3>
                </div>

                {isLoading ? (
                  <ChartSkeleton />
                ) : !dashboardData ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No data available</AlertTitle>
                      <AlertDescription>
                        Connect your Stripe account to see plan distribution.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="flex flex-col items-center h-[350px]">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={preparePlanDistributionData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={renderCustomLabel}
                        >
                          {preparePlanDistributionData().map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend layout="vertical" align="right" verticalAlign="middle" />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    <div className="mt-2 text-sm text-center text-gray-600">
                      Based on Monthly Recurring Revenue (MRR)
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Key Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-100 shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  Customer Growth by Plan
                </h3>

                {isLoading ? (
                  <ChartSkeleton />
                ) : !dashboardData ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No data available</AlertTitle>
                      <AlertDescription>
                        Connect your Stripe account to see customer metrics.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={Object.entries(dashboardData.by_plan).map(([plan, metrics]) => ({
                        name: plan,
                        subscribers: metrics.active_subscriptions,
                        revenue: metrics.mrr
                      }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis 
                        yAxisId="left"
                        tickFormatter={(value) => value}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right"
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === "revenue") return formatCurrency(value);
                          return value;
                        }}
                      />
                      <Legend />
                      <Bar 
                        yAxisId="left"
                        dataKey="subscribers" 
                        name="Active Subscribers" 
                        fill="#8B5CF6" 
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        yAxisId="right"
                        dataKey="revenue" 
                        name="Revenue (MRR)" 
                        fill="#10B981" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Monthly Tab */}
          <TabsContent value="monthly" className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-purple-100 shadow-md">
              <MonthlyMetricsBreakdown />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
