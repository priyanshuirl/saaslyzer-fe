
import { AlertTriangle, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { TrialStatus, getTrialStatus, getTrialDaysRemaining, getTrialStatusMessage } from "@/utils/trial-utils";
import { Link } from "react-router-dom";

export function TrialBanner() {
  const { authState } = useAuth();
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [showBanner, setShowBanner] = useState<boolean>(false);

  // Get trial status
  const trialStatus = getTrialStatus(authState.user);
  const daysRemaining = getTrialDaysRemaining(authState.user);
  const message = getTrialStatusMessage(trialStatus, daysRemaining);

  useEffect(() => {
    // Only show banner for expiring or expired trials
    if (trialStatus === TrialStatus.EXPIRING_SOON || trialStatus === TrialStatus.EXPIRED) {
      const dismissedKey = `trial_banner_dismissed_${trialStatus}`;
      const isDismissed = localStorage.getItem(dismissedKey) === "true";
      
      if (!isDismissed) {
        setShowBanner(true);
      } else {
        setDismissed(true);
      }
    }
  }, [trialStatus]);

  if (!showBanner || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    const dismissedKey = `trial_banner_dismissed_${trialStatus}`;
    localStorage.setItem(dismissedKey, "true");
    setDismissed(true);
    setShowBanner(false);
  };

  // Different styling based on trial status
  let bannerClass = "p-4 flex items-center justify-between";
  let iconComponent = null;

  switch (trialStatus) {
    case TrialStatus.EXPIRED:
      bannerClass += " bg-red-50 border-red-200 border text-red-800";
      iconComponent = <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />;
      break;
    case TrialStatus.EXPIRING_SOON:
      bannerClass += " bg-yellow-50 border-yellow-200 border text-yellow-800";
      iconComponent = <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />;
      break;
    default:
      bannerClass += " bg-blue-50 border-blue-200 border text-blue-800";
      iconComponent = <Check className="h-5 w-5 text-blue-600 mr-2" />;
  }

  return (
    <div className={bannerClass}>
      <div className="flex items-center">
        {iconComponent}
        <span className="font-medium">{message}</span>
      </div>
      <div className="flex items-center gap-3">
        {trialStatus === TrialStatus.EXPIRED && (
          <Link to="/settings">
            <Button 
              variant="gradient" 
              size="sm"
              className="transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Upgrade Now
            </Button>
          </Link>
        )}
        <button 
          onClick={handleDismiss} 
          className="text-gray-500 hover:text-gray-700"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
