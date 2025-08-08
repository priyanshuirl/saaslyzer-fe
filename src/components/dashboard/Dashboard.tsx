
import { useNavigate } from "react-router-dom";
import { useAnalytics } from "@/context/AnalyticsContext";
import { useStripe } from "@/context/StripeContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import StripeConnect from "./StripeConnect";
import DashboardHeader from "./DashboardHeader";
import DashboardControlBar from "./DashboardControlBar";
import DashboardContent from "./DashboardContent";
import ErrorDisplay from "./ErrorDisplay";

/**
 * Dashboard Component
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { stripeState, syncStripeData } = useStripe();
  
  // Get analytics data and functions from context
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
  } = useAnalytics();
  
  // Track active tab for dashboard sections
  const [activeTab, setActiveTab] = useState("overview");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  // Authentication protection
  useEffect(() => {
    if (!authState.user && !authState.isLoading) {
      navigate("/login");
    }
  }, [authState, navigate]);

  // Show loading state while checking authentication
  if (authState.isLoading) {
    return <div>Loading...</div>;
  }

  // Guard clause if user is not authenticated
  if (!authState.user) {
    return null;
  }

  /**
   * Handle syncing data from Stripe
   */
  const handleSyncData = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    setSyncError(null);
    
    try {
      // Get the current user ID
      const userId = authState.user?.id;
      
      if (!userId) {
        return;
      }
      
      // Clear any cache before syncing
      localStorage.removeItem('sync_cache');
      
      await syncStripeData();
      
      // If sync was successful, refresh analytics data
      if (refreshData) {
        // Give the sync some time to process
        setTimeout(() => {
          refreshData();
        }, 3000);
      }
    } catch (error) {
      console.error("Sync error:", error);
      setSyncError(error.message || "Failed to sync Stripe data");
    } finally {
      setIsSyncing(false);
    }
  };

  // Check for reconnection requirement - safely check if the property exists
  const requireReconnect = stripeState?.requireReconnect === true;
  
  // If Stripe connection needs to be reconnected, show the connect form
  if (requireReconnect) {
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

  // If not connected to Stripe, show the connect component
  if (!stripeState.isConnected) {
    return (
      <div className="container max-w-md mx-auto py-12">
        <StripeConnect />
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Dashboard Header */}
        <DashboardHeader 
          title="Your Analytics Dashboard"
          subtitle="Track your key subscription metrics and business performance in real-time"
        />

        {/* Error display */}
        {syncError && (
          <ErrorDisplay 
            title="Synchronization Error" 
            description={syncError} 
          />
        )}
        
        {stripeState.error && (
          <ErrorDisplay 
            title="Stripe Error" 
            description={stripeState.error} 
          />
        )}

        {/* Controls Bar */}
        <DashboardControlBar 
          isLoading={isLoading}
          selectedCountry={selectedCountry}
          selectedPlan={selectedPlan}
          availableCountries={availableCountries}
          availablePlans={availablePlans}
          onCountryChange={filterByCountry}
          onPlanChange={filterByPlan}
          onToggleDebug={() => setShowDebug(!showDebug)}
          showDebug={showDebug}
          hasFilterBar={true}
          refreshData={refreshData}
        />

        {/* Main content */}
        <DashboardContent 
          dashboardData={dashboardData} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
};

export default Dashboard;
