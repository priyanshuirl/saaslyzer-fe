
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { StripeProvider } from "./context/StripeContext";
import { AnalyticsProvider } from "./context/AnalyticsContext";
import MainLayout from "./components/layout/MainLayout";
import Index from "./pages/index";
import Dashboard from "./pages/dashboard";
import Settings from "./pages/settings";
import Functionality from "./pages/functionality";
import Analytics from "./pages/analytics";
import Auth from "./pages/Auth";
import NotFound from "./pages/not-found";
import Landing from "./pages/landing";
import Docs from "./pages/docs";
import ResetPassword from "./pages/reset-password";

// Create a query client with specific config for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 300000, // 5 minutes
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }) => {
  // Use the Supabase auth state directly
  const isAuthenticated = localStorage.getItem("authSession") === "true";
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <AuthProvider>
          <StripeProvider>
            <AnalyticsProvider>
              {/* These toasters must be inside all providers to have access to context */}
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/signup" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/functionality" element={<Functionality />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Dashboard />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Analytics />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Settings />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/docs"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Docs />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnalyticsProvider>
          </StripeProvider>
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
