
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

/**
 * Auth Component
 * 
 * A container component that manages authentication flows:
 * - Shows either login or signup form based on route
 * - Handles redirects for authenticated users
 * - Manages shared authentication state
 * - Provides UI for switching between auth modes
 * 
 * This component is responsive and handles various authentication states.
 */
const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    authState: { user, isLoading, error },
    setAuthError,
  } = useAuth();

  // Determine which form to show based on route
  const [isLogin, setIsLogin] = useState(location.pathname === "/login");
  const [redirectInProgress, setRedirectInProgress] = useState(false);
  // Use a ref to track if the cleanup function has already run
  const cleanupRun = useRef(false);

  /* ---------- Route Changes ---------- */
  // Update form mode when route changes (login vs signup)
  useEffect(() => {
    setIsLogin(location.pathname === "/login");
  }, [location.pathname]);

  /* ---------- Authenticated User Handling ---------- */
  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user && !isLoading && !redirectInProgress) {
      console.log("User is logged in, redirecting to dashboard");
      setRedirectInProgress(true);
      navigate("/dashboard");
    }
  }, [user, navigate, isLoading, redirectInProgress]);

  /* ---------- Error Cleanup ---------- */
  // Clear error state when component unmounts
  useEffect(() => {
    // This function should only set the error to null on unmount,
    // not on every render
    return () => {
      if (!cleanupRun.current) {
        cleanupRun.current = true;
        setAuthError(null);
      }
    };
  }, [setAuthError]); 

  /**
   * Switch to signup view and clear errors
   */
  const switchToSignup = () => {
    setAuthError(null);
    setIsLogin(false);
  };

  /**
   * Switch to login view and clear errors
   */
  const switchToLogin = () => {
    setAuthError(null);
    setIsLogin(true);
  };

  // Show loading state during authentication checks or redirects
  if (isLoading || redirectInProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-purple-100">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-indigo-700">
            {redirectInProgress ? "Redirecting to dashboard..." : "Checking authentication status..."}
          </p>
        </div>
      </div>
    );
  }

  // Render authentication UI with header and appropriate form
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-purple-100">
      {/* Header with logo and home link */}
      <header className="w-full py-6 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo and brand */}
          <a href="/" className="flex items-center gap-2">
            <span className="rounded-lg px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-700 text-white text-2xl font-extrabold tracking-tight shadow-md">
              Saaslyzer
            </span>
            <span className="text-sm font-medium text-gray-600 hidden sm:inline-block">
              Analytics for SaaS businesses
            </span>
          </a>
          
          {/* Navigation link */}
          <a
            href="/"
            className="text-sm font-medium text-indigo-700 hover:text-indigo-900 hover:underline"
          >
            Back to Home
          </a>
        </div>
      </header>

      {/* Main content area with auth forms */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          {/* Show either login or signup form based on state */}
          {isLogin ? (
            <LoginForm onSwitchToSignup={switchToSignup} />
          ) : (
            <SignupForm onSwitchToLogin={switchToLogin} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
