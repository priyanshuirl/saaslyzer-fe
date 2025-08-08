import { useAuth } from "../../context/AuthContext";
import { useStripe } from "../../context/StripeContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, User, LogOut, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

const Navbar = () => {
  const { authState, logout } = useAuth();
  const { stripeState, syncStripeData } = useStripe();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshData = async () => {
    // Prevent multiple simultaneous refresh requests
    if (isRefreshing || !authState.user) {
      return;
    }
    
    setIsRefreshing(true);
    
    try {
      if (!authState.user?.id) {
        toast({
          title: "Authentication required",
          description: "Please log in to refresh your data.",
          variant: "destructive"
        });
        return;
      }
      
      await syncStripeData();
      
      toast({
        title: "Data refresh initiated",
        description: "Your Stripe data is being updated...",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      
      toast({
        title: "Refresh failed",
        description: "Could not refresh your Stripe data. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Reset refreshing state
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="h-16 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center">
          {/* We're removing the Saaslyzer logo here as it already exists in the sidebar */}
        </div>
        
        <div className="flex items-center gap-4">
          {stripeState.isConnected && (
            <Button 
              variant="gradient" 
              size="sm" 
              onClick={handleRefreshData}
              disabled={isRefreshing || stripeState.isLoading}
              className="flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh Data"}
            </Button>
          )}
          
          {stripeState.lastSynced && (
            <span className="text-xs text-muted-foreground hidden md:block">
              Last synced: {new Date(stripeState.lastSynced).toLocaleString()}
            </span>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">{authState.user?.email}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
