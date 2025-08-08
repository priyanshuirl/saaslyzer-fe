
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalytics } from "../context/AnalyticsContext";
import { useStripe } from "../context/StripeContext";
import { useAuth } from "@/context/AuthContext";
import StripeConnect from "../components/dashboard/StripeConnect";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardControlBar from "@/components/dashboard/DashboardControlBar";
import DashboardDebugPanel from "@/components/dashboard/DashboardDebugPanel";
import DashboardContent from "@/components/dashboard/DashboardContent";
import ErrorDisplay from "@/components/dashboard/ErrorDisplay";

const Dashboard = () => {
  // Navigation and state
  const navigate = useNavigate();
  
  // Access context with proper null checks
  const authContext = useAuth();
  const stripeContext = useStripe();
  const analyticsContext = useAnalytics();
  
  // Using nullish coalescing to handle potential undefined values
  const authState = authContext?.authState || { user: null, isLoading: true };
  const stripeState = stripeContext?.stripeState || { 
    isConnected: false, 
    isLoading: true,
    lastSynced: null,
    error: null,
    requireReconnect: false,
    isValid: true,
    accountId: null
  };
  
  // Safely access analytics methods with optional chaining
  const { 
    dashboardData, 
    isLoading, 
    refreshData, 
    filterByCountry, 
    filterByPlan, 
    selectedCountry, 
    selectedPlan, 
    availableCountries, 
    availablePlans 
  } = analyticsContext || {};

  // Component state
  const [showDebug, setShowDebug] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [syncTriggerCount, setSyncTriggerCount] = useState(0);
  const [lastSyncAttempt, setLastSyncAttempt] = useState<Date | null>(null);
  const [responseData, setResponseData] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authState.user && !authState.isLoading) {
      navigate("/login");
    }
  }, [authState, navigate]);

  // Auto-sync on first load if no data
  useEffect(() => {
    if (authState.user && stripeState.isConnected && !isLoading && !dashboardData) {
      if (syncTriggerCount === 0) {
        console.log("No dashboard data available, triggering auto-sync");
        setSyncTriggerCount(prev => prev + 1);
        handleSyncData();
      }
    }
  }, [authState.user, stripeState?.isConnected, dashboardData, isLoading]);

  // Handle sync failure retry with backoff
  useEffect(() => {
    if (syncError && syncTriggerCount > 0 && syncTriggerCount < 3) {
      const retryDelay = syncTriggerCount * 5000; // 5s, 10s
      console.log(`Scheduling sync retry #${syncTriggerCount} in ${retryDelay/1000}s due to error`);
      
      const timerId = setTimeout(() => {
        console.log(`Executing scheduled retry #${syncTriggerCount}`);
        handleSyncData();
      }, retryDelay);
      
      return () => clearTimeout(timerId);
    }
  }, [syncError, syncTriggerCount]);

  const handleSyncData = async () => {
    // Don't allow multiple simultaneous sync operations
    if (isSyncing || !stripeContext?.syncStripeData) return;
    
    try {
      setIsSyncing(true);
      setLastSyncAttempt(new Date());
      setSyncError(null);
      setResponseData(null);
      
      console.log("Starting sync operation");
      const result = await stripeContext.syncStripeData();
      
      console.log("Sync completed successfully:", result);
      setResponseData(result);
      
      // Wait a bit and then refresh the data
      setTimeout(() => {
        console.log("Refreshing data after sync");
        if (refreshData) refreshData();
      }, 5000);
    } catch (error) {
      console.error("Error syncing data:", error);
      setSyncError(error.message || "Failed to sync Stripe data");
      
      // Count the sync attempt for retry logic
      setSyncTriggerCount(prev => prev + 1);
    } finally {
      setIsSyncing(false);
    }
  };

  // Loading state
  if (authState.isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // Not logged in
  if (!authState.user) {
    return null;
  }
  
  // If Stripe connection needs to be reconnected, show the connect form
  // Use proper null/undefined check for the requireReconnect property
  if (stripeState.requireReconnect === true) {
    return (
      <div className="container max-w-md mx-auto py-12">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Stripe Connection Issue</AlertTitle>
          <AlertDescription>{stripeState.error || "Your Stripe connection needs to be updated."}</AlertDescription>
        </Alert>
        
        <StripeConnect />
      </div>
    );
  }

  // If not connected to Stripe, show connect form
  if (!stripeState.isConnected) {
    return (
      <div className="container max-w-md mx-auto py-12">
        <StripeConnect />
      </div>
    );
  }

  // Main dashboard display
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-purple-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Dashboard header */}
        <DashboardHeader 
          title="Your Analytics Dashboard"
          subtitle="Track your key subscription metrics and business performance in real-time"
        />

        {/* Error alerts */}
        {syncError && (
          <ErrorDisplay 
            title="Synchronization Error"
            description={syncError}
          />
        )}

        {stripeState.error && stripeState.error !== syncError && (
          <ErrorDisplay 
            title="Stripe Connection Issue"
            description={stripeState.error}
          />
        )}

        {/* Control bar for refresh and filters */}
        <DashboardControlBar 
          isLoading={isLoading || false}
          selectedCountry={selectedCountry}
          selectedPlan={selectedPlan}
          availableCountries={availableCountries}
          availablePlans={availablePlans}
          onCountryChange={filterByCountry}
          onPlanChange={filterByPlan}
          onToggleDebug={() => setShowDebug(!showDebug)}
          showDebug={showDebug}
          hasFilterBar={!!analyticsContext && !!dashboardData}
          refreshData={refreshData}
        />

        {/* Debug panel */}
        <DashboardDebugPanel 
          open={showDebug}
          onOpenChange={setShowDebug}
          lastSyncAttempt={lastSyncAttempt}
          syncTriggerCount={syncTriggerCount}
          syncError={syncError}
          responseData={responseData}
          isSyncing={isSyncing}
          isLoading={isLoading || false}
          dashboardData={dashboardData}
        />

        {/* Main content */}
        <DashboardContent 
          dashboardData={dashboardData} 
          isLoading={isLoading || false} 
        />
      </div>
    </div>
  );
};

export default Dashboard;
