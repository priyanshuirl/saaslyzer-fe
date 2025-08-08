
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useStripe } from "./StripeContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardData, MetricWithTrend, SegmentedMetrics, AnalyticsMetrics } from "../types";

// Define Analytics context type
interface AnalyticsContextType {
  dashboardData: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  filterByCountry: (country: string | null) => void;
  filterByPlan: (plan: string | null) => void;
  selectedCountry: string | null;
  selectedPlan: string | null;
  availableCountries: string[];
  availablePlans: string[];
}

// Create context with default values
const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

// Analytics provider component
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  // Get current authenticated user and Stripe connection state
  const { authState } = useAuth();
  const { stripeState } = useStripe();
  
  // Dashboard data and loading states
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering states
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availablePlans, setAvailablePlans] = useState<string[]>([]);

  // Fetch data when Stripe connection or user changes
  useEffect(() => {
    if (authState.user && stripeState.isConnected && !isLoading) {
      fetchAnalyticsData();
    }
  }, [authState.user, stripeState.isConnected, stripeState.lastSynced]);

  // Function to fetch analytics data from the database
  const fetchAnalyticsData = async () => {
    if (!authState.user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch all analytics data for the current user
      const { data, error } = await supabase
        .from('analytics_data')
        .select('*')
        .eq('user_id', authState.user.id);
      
      if (error) {
        console.error("Error fetching analytics data:", error);
        setError("Failed to load analytics data");
        setIsLoading(false);
        return;
      }
      
      // Process and transform the data for the dashboard
      const processedData = processAnalyticsData(data || []);
      setDashboardData(processedData);
      
      // Extract available filter options
      const countries = [...new Set(data
        ?.filter(item => item.segment_type === 'country')
        ?.map(item => item.segment_value) || [])];
      
      const plans = [...new Set(data
        ?.filter(item => item.segment_type === 'plan')
        ?.map(item => item.segment_value) || [])];
      
      setAvailableCountries(countries as string[]);
      setAvailablePlans(plans as string[]);
      
    } catch (error) {
      console.error("Error in fetchAnalyticsData:", error);
      setError("An unexpected error occurred while loading analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  // Process the raw analytics data into dashboard format
  const processAnalyticsData = (data: any[]): DashboardData => {
    // Extract top-level metrics (without segment_type)
    const topLevelMetrics = data.filter(item => !item.segment_type);
    
    // Get metrics by segments
    const countryMetrics = data.filter(item => item.segment_type === 'country');
    const planMetrics = data.filter(item => item.segment_type === 'plan');
    
    // Create dashboard data structure
    const dashboardData: DashboardData = {
      mrr: getMetricFromData(topLevelMetrics, 'mrr'),
      arr: getMetricFromData(topLevelMetrics, 'arr'),
      ltv: getMetricFromData(topLevelMetrics, 'ltv'),
      active_subscriptions: getMetricFromData(topLevelMetrics, 'active_subscriptions'),
      by_country: groupBySegment(countryMetrics),
      by_plan: groupBySegment(planMetrics),
      currency: topLevelMetrics.find(item => item.currency)?.currency || 'USD'
    };
    
    return dashboardData;
  };

  // Extract a specific metric from the raw data
  const getMetricFromData = (data: any[], metricType: string): MetricWithTrend => {
    const metricData = data.find(item => item.data_type === metricType);
    
    if (!metricData) {
      return {
        current: 0,
        trend: null
      };
    }
    
    return {
      current: metricData.value,
      currency: metricData.currency,
      trend: metricData.trend_percentage ? {
        value: metricData.trend_value || 0,
        percentage: metricData.trend_percentage,
        direction: metricData.trend_direction
      } : null
    };
  };

  // Group metrics by segment (country or plan)
  const groupBySegment = (items: any[]): Record<string, AnalyticsMetrics> => {
    const result: Record<string, AnalyticsMetrics> = {};
    
    // Group items by segment_value
    const groupedBySegment = items.reduce<Record<string, any[]>>((acc, item) => {
      const segmentValue = item.segment_value;
      if (!acc[segmentValue]) {
        acc[segmentValue] = [];
      }
      acc[segmentValue].push(item);
      return acc;
    }, {} as Record<string, any[]>);
    
    // For each segment, create a metrics object
    Object.entries(groupedBySegment).forEach(([segmentValue, segmentItems]) => {
      result[segmentValue] = {
        mrr: getMetricFromSegmentData(segmentItems, 'mrr'),
        arr: getMetricFromSegmentData(segmentItems, 'arr'),
        ltv: getMetricFromSegmentData(segmentItems, 'ltv'),
        active_subscriptions: getMetricFromSegmentData(segmentItems, 'active_subscriptions'),
        currency: segmentItems.find(item => item.currency)?.currency || 'USD'
      };
    });
    
    return result;
  };
  
  // Helper function to extract metric values from segment data
  const getMetricFromSegmentData = (data: any[], metricType: string): number => {
    const item = data.find(item => item.data_type === metricType);
    return item ? item.value : 0;
  };

  // Function to refresh data
  const refreshData = async () => {
    await fetchAnalyticsData();
  };

  // Function to filter by country
  const filterByCountry = (country: string | null) => {
    setSelectedCountry(country);
  };

  // Function to filter by plan
  const filterByPlan = (plan: string | null) => {
    setSelectedPlan(plan);
  };

  return (
    <AnalyticsContext.Provider
      value={{
        dashboardData,
        isLoading,
        error,
        refreshData,
        filterByCountry,
        filterByPlan,
        selectedCountry,
        selectedPlan,
        availableCountries,
        availablePlans,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

// Custom hook for consuming Analytics context
export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
}
