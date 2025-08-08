
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Settings, Calendar } from "lucide-react";
import FilterBar from "./FilterBar";
import { syncStripeDataWithSupabase } from "@/utils/stripe-sync";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";

interface DashboardControlBarProps {
  isLoading: boolean;
  selectedCountry?: string | null;
  selectedPlan?: string | null;
  availableCountries?: string[];
  availablePlans?: string[];
  onCountryChange?: (country: string | null) => void;
  onPlanChange?: (plan: string | null) => void;
  onToggleDebug: () => void;
  showDebug: boolean;
  hasFilterBar: boolean;
  refreshData?: () => Promise<void>;
}

const DashboardControlBar = ({
  isLoading,
  selectedCountry,
  selectedPlan,
  availableCountries,
  availablePlans,
  onCountryChange,
  onPlanChange,
  onToggleDebug,
  showDebug,
  hasFilterBar,
  refreshData,
}: DashboardControlBarProps) => {
  const { authState } = useAuth();
  const [isSyncingMay, setIsSyncingMay] = useState(false);

  const handleSyncMayData = async () => {
    if (!authState.user) return;
    
    setIsSyncingMay(true);
    try {
      console.log("Syncing May 2025 data specifically...");
      await syncStripeDataWithSupabase(authState.user.id, supabase, true);
      
      toast({
        title: "May 2025 data synced",
        description: "Your May 2025 subscription data has been synced successfully.",
      });
      
      // Refresh the analytics data
      if (refreshData) {
        setTimeout(() => refreshData(), 2000);
      }
    } catch (error: any) {
      console.error("Error syncing May data:", error);
      toast({
        title: "Sync failed",
        description: error.message || "Failed to sync May 2025 data",
        variant: "destructive",
      });
    } finally {
      setIsSyncingMay(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 sm:p-4 lg:p-6 border border-purple-100 shadow-md space-y-4">
      {/* Control buttons */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Button
          onClick={refreshData}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="flex-shrink-0"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Syncing...' : 'Refresh Data'}
        </Button>

        <Button
          onClick={handleSyncMayData}
          disabled={isSyncingMay || isLoading}
          variant="outline"
          size="sm"
          className="flex-shrink-0"
        >
          <Calendar className={`w-4 h-4 mr-2 ${isSyncingMay ? 'animate-spin' : ''}`} />
          {isSyncingMay ? 'Syncing May...' : 'Sync May 2025'}
        </Button>

        <Button
          onClick={onToggleDebug}
          variant="ghost"
          size="sm"
          className="flex-shrink-0"
        >
          <Settings className="w-4 h-4 mr-2" />
          {showDebug ? 'Hide' : 'Show'} Debug
        </Button>
      </div>

      {/* Filter bar */}
      {hasFilterBar && (
        <FilterBar
          selectedCountry={selectedCountry}
          selectedPlan={selectedPlan}
          availableCountries={availableCountries}
          availablePlans={availablePlans}
          onCountryChange={onCountryChange}
          onPlanChange={onPlanChange}
        />
      )}
    </div>
  );
};

export default DashboardControlBar;
