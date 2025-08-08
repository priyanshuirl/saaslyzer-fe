
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "../context/AuthContext";
import { useStripe } from "../context/StripeContext";
import { AlertCircle, RefreshCw } from "lucide-react";
import StripeConnect from "@/components/dashboard/StripeConnect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { getTrialStatus, TrialStatus, getTrialDaysRemaining } from "@/utils/trial-utils";

const Settings = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { stripeState, syncStripeData, disconnectStripe } = useStripe();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(stripeState.lastSynced);
  const [showReconnectDialog, setShowReconnectDialog] = useState(false);

  // Get trial status
  const trialStatus = getTrialStatus(authState.user);
  const daysRemaining = getTrialDaysRemaining(authState.user);
  const isTrialExpired = trialStatus === TrialStatus.EXPIRED;
  const isTrialExpiringSoon = trialStatus === TrialStatus.EXPIRING_SOON;

  // Update the last synced time whenever stripeState changes
  useEffect(() => {
    if (stripeState.lastSynced) {
      setLastSyncedTime(stripeState.lastSynced);
    }
  }, [stripeState.lastSynced]);

  useEffect(() => {
    if (!authState.user && !authState.isLoading) {
      navigate("/login");
    }
  }, [authState, navigate]);

  if (authState.isLoading) {
    return <div>Loading...</div>;
  }

  if (!authState.user) {
    return null;
  }
  
  // If Stripe connection needs to be reconnected, show the connect form
  if (stripeState.isConnected && stripeState.requireReconnect) {
    return <StripeConnect />;
  }
  
  const handleSyncNow = async () => {
    try {
      setIsSyncing(true);
      await syncStripeData();
      
      // Force refresh cached time after sync is complete
      setTimeout(() => {
        if (stripeState.lastSynced) {
          setLastSyncedTime(stripeState.lastSynced);
          toast({
            title: "Sync completed",
            description: "Your Stripe data has been successfully updated.",
          });
        }
      }, 500);
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

  const handleReconnectStripe = async () => {
    // First disconnect current connection
    try {
      await disconnectStripe();
      setShowReconnectDialog(false);
      
      toast({
        title: "Disconnected",
        description: "Your Stripe account has been disconnected. You can now reconnect with a new API key.",
      });
      
      // Navigate to dashboard to show the StripeConnect form
      navigate("/dashboard");
    } catch (error) {
      console.error("Error disconnecting Stripe:", error);
      toast({
        title: "Error",
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
                <Label>Trial Status</Label>
                <div className={`font-medium ${isTrialExpired ? 'text-red-600' : isTrialExpiringSoon ? 'text-yellow-600' : 'text-green-600'}`}>
                  {isTrialExpired ? (
                    <span className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Expired on {new Date(authState.user.trial_ends_at).toLocaleDateString()}
                    </span>
                  ) : (
                    <span>
                      {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining (Ends {new Date(authState.user.trial_ends_at).toLocaleDateString()})
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {isTrialExpired && !authState.user?.subscribed && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                <h4 className="text-amber-800 font-medium mb-2">Your trial has expired</h4>
                <p className="text-amber-700 text-sm mb-3">
                  Upgrade now to continue using premium features and get full access to all analytics.
                </p>
                <Button 
                  variant="gradient"
                  size="sm"
                  className="transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Upgrade to Premium
                </Button>
              </div>
            )}
            
            {isTrialExpiringSoon && !authState.user?.subscribed && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="text-blue-800 font-medium mb-2">Your trial is ending soon</h4>
                <p className="text-blue-700 text-sm mb-3">
                  Upgrade now to ensure uninterrupted access to all premium features.
                </p>
                <Button 
                  variant="gradient"
                  size="sm"
                  className="transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Upgrade to Premium
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {stripeState.isConnected && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Stripe Connection
                {!stripeState.isValid && (
                  <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 border border-yellow-400">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Needs Attention
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Manage your Stripe data synchronization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="block mb-1">Connection Status</Label>
                  {stripeState.isValid ? (
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
                  ) : (
                    <span className="flex items-center text-yellow-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      API Key Invalid
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSyncNow} 
                    variant="outline" 
                    disabled={isSyncing || !stripeState.isValid}
                    className="relative"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? "Syncing..." : "Sync Now"}
                  </Button>
                  
                  <Dialog open={showReconnectDialog} onOpenChange={setShowReconnectDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="gradient"
                        size="sm" 
                        className="transition-all duration-300 transform hover:-translate-y-0.5"
                      >
                        Reconnect
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-indigo-700">
                          Reconnect Stripe
                        </DialogTitle>
                        <DialogDescription>
                          This will disconnect your current Stripe connection and allow you to reconnect with a new API key.
                          Are you sure you want to proceed?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="flex space-x-2 justify-end">
                        <Button variant="outline" onClick={() => setShowReconnectDialog(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleReconnectStripe}
                          variant="gradient"
                          className="transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                          Disconnect and Reconnect
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              {lastSyncedTime && (
                <div className="space-y-1">
                  <Label>Last Synced</Label>
                  <div>
                    {new Date(lastSyncedTime).toLocaleString()}
                  </div>
                </div>
              )}
              
              {!stripeState.isValid && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md my-3">
                  <h4 className="font-medium text-yellow-800 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Action Required
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your Stripe API key is no longer valid. Please update it to continue syncing your data.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-2 bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200"
                    onClick={() => navigate("/dashboard")}
                  >
                    Update API Key
                  </Button>
                </div>
              )}
              
              <div className="flex items-center space-x-2 pt-4">
                <Switch id="auto-sync" defaultChecked disabled={!stripeState.isValid} />
                <Label htmlFor="auto-sync" className={!stripeState.isValid ? "text-gray-400" : ""}>
                  Auto-sync every 12 hours
                </Label>
              </div>
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
