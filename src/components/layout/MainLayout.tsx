
import { ReactNode, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { TrialBanner } from "../trial/TrialBanner";

/**
 * MainLayout - This component provides the main application layout structure
 * 
 * Features:
 * - Authentication protection - redirects to login if not authenticated
 * - Consistent layout with sidebar and navbar for authenticated users
 * - Loading state while checking authentication status
 * - Trial status banner for expiring/expired trials
 * 
 * @param {ReactNode} children - The page content to render in the layout
 */
interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  // Get authentication state to determine if user is logged in
  const { authState } = useAuth();
  const navigate = useNavigate();
  
  // Derive authentication status from auth state
  const isAuthenticated = authState.user !== null;

  // Authentication protection: redirect to login page if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !authState.isLoading) {
      // User is not authenticated and we've finished checking auth state
      // Redirect to login page
      navigate("/login");
    }
  }, [isAuthenticated, authState.isLoading, navigate]);

  // Show loading state while checking authentication status
  if (authState.isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  // Render full layout with navigation components for authenticated users
  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-purple-100">
      {/* Sidebar - contains main navigation links */}
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar - contains user profile, notifications, etc. */}
        <Navbar />
        
        {/* Trial banner */}
        <TrialBanner />
        
        {/* Main content area - scrollable and responsive */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-transparent">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
