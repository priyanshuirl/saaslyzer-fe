
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Bug, FileDown, Loader2 } from "lucide-react";
import MetricCard from "./MetricCard";
import { DashboardData } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { useStripe } from "@/context/StripeContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";

interface MetricsGridDisplayProps {
  data: DashboardData | null;
  isLoading: boolean;
}

const MetricsGridDisplay = ({ data, isLoading }: MetricsGridDisplayProps) => {
  const { authState } = useAuth();
  const { stripeState, syncStripeData } = useStripe();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncTimestamp, setSyncTimestamp] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [syncAttempts, setSyncAttempts] = useState(0);

  const handleSyncNow = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    setSyncAttempts(prev => prev + 1);
    
    try {
      // Get the current user ID
      const userId = authState.user?.id;
      
      if (!userId) {
        toast({
          title: "Authentication required",
          description: "Please log in to sync your data.",
          variant: "destructive"
        });
        return;
      }
      
      // Clear any cache before syncing
      localStorage.removeItem('sync_cache');
      
      const result = await syncStripeData();
      
      if (result && result.last_synced) {
        setSyncTimestamp(result.last_synced);
        
        const formattedTime = new Date(result.last_synced).toLocaleString();
        
        toast({
          title: "Sync completed",
          description: `Last synced: ${formattedTime}`,
        });
        
        // Reload the page to ensure fresh data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast({
          title: "Sync issue",
          description: "Sync completed but timestamp wasn't updated. Please check logs.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error syncing data:", error);
      toast({
        title: "Sync failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <Skeleton className="h-[130px] rounded-lg" />
        <Skeleton className="h-[130px] rounded-lg" />
        <Skeleton className="h-[130px] rounded-lg" />
        <Skeleton className="h-[130px] rounded-lg" />
      </div>
    );
  }

  // If no data, show more detailed error state
  if (!data) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No data available</AlertTitle>
          <AlertDescription>
            We couldn't load your metrics data. This could be because:
            <ul className="list-disc pl-5 mt-2">
              <li>You haven't synced your Stripe data yet</li>
              <li>The sync process encountered an error</li>
              <li>Your Stripe account doesn't have any customers or subscriptions</li>
            </ul>
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col gap-4">
          <div className="flex justify-center">
            <Button 
              onClick={handleSyncNow}
              variant="gradient"
              className="shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
              disabled={isSyncing}
            >
              {isSyncing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {isSyncing ? "Syncing..." : "Sync Stripe Data"}
            </Button>
          </div>
          
          {syncTimestamp && (
            <div className="text-center text-sm text-muted-foreground">
              Last synced: {new Date(syncTimestamp).toLocaleString()}
            </div>
          )}
          
          {stripeState.error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Sync Error</AlertTitle>
              <AlertDescription>{stripeState.error}</AlertDescription>
            </Alert>
          )}
          
          <Collapsible 
            open={showDebug} 
            onOpenChange={setShowDebug}
            className="w-full border rounded-md p-2 mt-4"
          >
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center justify-between gap-2 w-full">
                <span className="flex items-center gap-2">
                  <Bug className="w-4 h-4" />
                  Debug Information
                </span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">For Troubleshooting</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2 text-sm">
              <div className="bg-slate-50 p-3 rounded border space-y-2">
                <div><strong>Connection Status:</strong> {stripeState.isConnected ? "Connected" : "Not Connected"}</div>
                <div><strong>Key Valid:</strong> {stripeState.isValid ? "Yes" : "No"}</div>
                <div><strong>Edge Function Status:</strong> {stripeState.isValid ? "Working" : "Error"}</div>
                <div><strong>Last Synced:</strong> {stripeState.lastSynced ? new Date(stripeState.lastSynced).toLocaleString() : "Never"}</div>
                <div><strong>Synced in Component:</strong> {syncTimestamp ? new Date(syncTimestamp).toLocaleString() : "Never"}</div>
                <div><strong>Sync Attempts:</strong> {syncAttempts}</div>
              </div>
              
              <div className="flex justify-between items-center">
                <Button 
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => {
                    try {
                      const debugData = {
                        stripeState,
                        timestamp: new Date().toISOString(),
                        syncTimestamp,
                        syncAttempts,
                        hasLocalStorageCache: !!localStorage.getItem('sync_cache'),
                        dashboardDataExists: !!data
                      };
                      
                      const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'stripe-debug-info.json';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      
                      toast({
                        description: "Debug information downloaded"
                      });
                    } catch (e) {
                      console.error("Failed to download debug info:", e);
                    }
                  }}
                >
                  <FileDown className="w-3 h-3" />
                  Download Debug Info
                </Button>
                
                <Button 
                  variant="outline"
                  size="sm"
                  className="text-orange-700 border-orange-300 hover:bg-orange-50"
                  onClick={() => {
                    localStorage.removeItem('sync_cache');
                    window.location.reload();
                  }}
                >
                  Clear Cache & Reload
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    );
  }

  // Show metrics grid
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
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

export default MetricsGridDisplay;
