
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useStripe } from "@/context/StripeContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertTriangle, RefreshCw, Bug } from "lucide-react";
import { useState, useEffect } from "react";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const Settings = () => {
  const { authState } = useAuth();
  const { stripeState, syncStripeData, disconnectStripe } = useStripe();
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDebug, setShowDebug] = useState(false); // Changed to false so debug is collapsed by default
  const [syncTime, setSyncTime] = useState<string | null>(stripeState.lastSynced);
  
  // Update syncTime whenever stripe state changes
  useEffect(() => {
    if (stripeState.lastSynced) {
      setSyncTime(stripeState.lastSynced);
    }
  }, [stripeState.lastSynced]);
  
  const handleSyncNow = async () => {
    try {
      setIsSyncing(true);
      await syncStripeData();
      
      // The timestamp will be updated through the useEffect above
      toast({
        title: "Sync completed",
        description: "Your Stripe data is being updated...",
      });
    } catch (error) {
      console.error("Error with manual sync:", error);
      toast({
        title: "Sync failed",
        description: "Could not sync your Stripe data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  const handleDisconnectStripe = async () => {
    try {
      await disconnectStripe();
      setDisconnectDialogOpen(false);
    } catch (error) {
      console.error("Error disconnecting Stripe:", error);
      toast({
        title: "Disconnect failed",
        description: "Could not disconnect your Stripe account. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and connections
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              View and manage your account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Email</Label>
              <div className="font-medium">{authState.user?.email}</div>
            </div>
            <div className="space-y-1">
              <Label>Account Created</Label>
              <div className="font-medium">
                {authState.user?.created_at && new Date(authState.user.created_at).toLocaleDateString()}
              </div>
            </div>
            {authState.user?.trial_ends_at && (
              <div className="space-y-1">
                <Label>Trial Ends</Label>
                <div className="font-medium">
                  {new Date(authState.user.trial_ends_at).toLocaleDateString()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {stripeState.isConnected && (
          <Card>
            <CardHeader>
              <CardTitle>Stripe Connection</CardTitle>
              <CardDescription>
                Manage your Stripe data synchronization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="block mb-1">Connection Status</Label>
                  <span className="flex items-center text-green-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-1"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Connected
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSyncNow} 
                    variant="outline" 
                    disabled={isSyncing}
                    className="relative"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? "Syncing..." : "Sync Now"}
                  </Button>
                  <Dialog open={disconnectDialogOpen} onOpenChange={setDisconnectDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
                        Disconnect
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500">
                          <AlertTriangle className="h-5 w-5" />
                          Disconnect Stripe Account
                        </DialogTitle>
                        <DialogDescription>
                          Are you sure you want to disconnect your Stripe account? This will remove your analytics data.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDisconnectDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={handleDisconnectStripe}
                          disabled={stripeState.isLoading}
                        >
                          {stripeState.isLoading ? "Disconnecting..." : "Disconnect"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              {syncTime && (
                <div className="space-y-1">
                  <Label>Last Synced</Label>
                  <div>
                    {new Date(syncTime).toLocaleString()}
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2 pt-4">
                <Switch id="auto-sync" defaultChecked />
                <Label htmlFor="auto-sync">Auto-sync every 12 hours</Label>
              </div>

              {stripeState.accountId && (
                <div className="space-y-1 mt-4 pt-4 border-t border-gray-100">
                  <Label>Connected Account ID</Label>
                  <div className="font-mono text-sm text-gray-500">
                    {stripeState.accountId}
                  </div>
                </div>
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
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${showDebug ? 'rotate-180' : ''}`}>
                      <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                    </svg>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2 text-sm">
                  <div className="bg-slate-50 p-3 rounded border space-y-2">
                    <div><strong>Connection Status:</strong> {stripeState.isConnected ? "Connected" : "Not Connected"}</div>
                    <div><strong>Key Valid:</strong> {stripeState.isValid ? "Yes" : "No"}</div>
                    <div><strong>Edge Function Status:</strong> {stripeState.isValid ? "Working" : "Error"}</div>
                    <div><strong>Last Synced (State):</strong> {stripeState.lastSynced ? new Date(stripeState.lastSynced).toLocaleString() : "Never"}</div>
                    <div><strong>Last Synced (Component):</strong> {syncTime ? new Date(syncTime).toLocaleString() : "Never"}</div>
                    <div><strong>Is Loading:</strong> {stripeState.isLoading ? "Yes" : "No"}</div>
                    <div><strong>Is Syncing (Local):</strong> {isSyncing ? "Yes" : "No"}</div>
                    <div><strong>Stripe Account ID:</strong> {stripeState.accountId || "Unknown"}</div>
                    <div><strong>Needs Reconnect:</strong> {stripeState.requireReconnect ? "Yes" : "No"}</div>
                    {stripeState.error && (
                      <div className="pt-2 border-t">
                        <strong>Last Error:</strong> 
                        <pre className="whitespace-pre-wrap bg-red-50 text-red-800 p-2 rounded mt-1 text-xs">
                          {stripeState.error}
                        </pre>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    className="w-full text-orange-700 border-orange-300 hover:bg-orange-50"
                    onClick={() => {
                      localStorage.removeItem('sync_cache');
                      window.location.reload();
                    }}
                  >
                    Clear Cache & Reload
                  </Button>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure when and how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="email-notifications" />
              <Label htmlFor="email-notifications">Email notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="sync-notifications" defaultChecked />
              <Label htmlFor="sync-notifications">Notify after each Stripe sync</Label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
