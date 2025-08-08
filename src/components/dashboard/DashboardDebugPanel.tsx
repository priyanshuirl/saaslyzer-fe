
import { Button } from "@/components/ui/button";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Info, FileDown } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useStripe } from "@/context/StripeContext";
import { useAuth } from "@/context/AuthContext";
import { DashboardData } from "@/types";

interface DashboardDebugPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lastSyncAttempt: Date | null;
  syncTriggerCount: number;
  syncError: string | null;
  responseData: any | null;
  isSyncing: boolean;
  isLoading: boolean;
  dashboardData: DashboardData | null;
}

const DashboardDebugPanel = ({
  open,
  onOpenChange,
  lastSyncAttempt,
  syncTriggerCount,
  syncError,
  responseData,
  isSyncing,
  isLoading,
  dashboardData
}: DashboardDebugPanelProps) => {
  const { authState } = useAuth();
  const { stripeState } = useStripe();

  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-purple-100 shadow-md space-y-2">
      <CollapsibleTrigger className="flex w-full items-center justify-between font-medium text-sm">
        <span className="flex items-center gap-2">
          <Info className="h-4 w-4 text-amber-500" />
          Debug Information
        </span>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
        </svg>
      </CollapsibleTrigger>
      <CollapsibleContent className="text-xs font-mono bg-gray-100 p-3 rounded overflow-auto max-h-96">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="font-semibold text-lg mb-2">Connection Status:</div>
            <div><strong>Context Check:</strong> {authState ? "Auth OK" : "Auth Missing!"} | 
                                                 {stripeState ? "Stripe OK" : "Stripe Missing!"}</div>
            <div><strong>Stripe Connection:</strong> {stripeState.isConnected ? "Connected" : "Not Connected"}</div>
            <div><strong>Stripe Valid:</strong> {stripeState.isValid ? "Valid" : "Invalid"}</div>
            <div><strong>Last Synced:</strong> {stripeState.lastSynced ? new Date(stripeState.lastSynced).toLocaleString() : "Never"}</div>
            <div><strong>Last Sync Attempt:</strong> {lastSyncAttempt ? lastSyncAttempt.toLocaleString() : "None"}</div>
            <div><strong>Sync Trigger Count:</strong> {syncTriggerCount}</div>
            <div><strong>Loading:</strong> {isLoading ? "True" : "False"}</div>
            <div><strong>Syncing:</strong> {isSyncing ? "True" : "False"}</div>
            <div className="font-semibold mt-3">Errors:</div>
            <div className="pl-4 text-red-600">
              {stripeState.error && <div>- Stripe Error: {stripeState.error}</div>}
              {syncError && <div>- Sync Error: {syncError}</div>}
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-lg mb-2">Data Info:</div>
            <div><strong>Dashboard Data:</strong> {dashboardData ? "Available" : "Not Available"}</div>
            {dashboardData && (
              <>
                <div><strong>MRR:</strong> {dashboardData.mrr.current}</div>
                <div><strong>Active Subscriptions:</strong> {dashboardData.active_subscriptions.current}</div>
              </>
            )}
            {responseData && (
              <>
                <div className="font-semibold mt-3">Last Response:</div>
                <pre className="bg-gray-700 text-white p-2 rounded text-[10px] overflow-auto max-h-32">
                  {JSON.stringify(responseData, null, 2)}
                </pre>
              </>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <div className="font-semibold mb-2">Actions:</div>
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-7" 
              onClick={() => {
                localStorage.removeItem('sync_cache');
                toast({ description: "Local storage cache cleared" });
              }}
            >
              Clear Cache
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-7" 
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default DashboardDebugPanel;
