
import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { canAccessPremiumFeatures } from "@/utils/trial-utils";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PremiumFeatureGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function PremiumFeatureGuard({ children, fallback }: PremiumFeatureGuardProps) {
  const { authState } = useAuth();
  const hasAccess = canAccessPremiumFeatures(authState.user);

  if (hasAccess) {
    return <>{children}</>;
  }

  // Default fallback UI if none provided
  const defaultFallback = (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-red-800 mb-2">Premium Feature Locked</h3>
      <p className="text-red-700 mb-4">
        Your trial has expired. Upgrade now to unlock all premium features.
      </p>
      <Link to="/settings">
        <Button 
          variant="gradient" 
          className="transition-all duration-300 transform hover:-translate-y-0.5"
        >
          Upgrade Now
        </Button>
      </Link>
    </div>
  );

  return <>{fallback || defaultFallback}</>;
}
