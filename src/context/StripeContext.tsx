
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { StripeContextType, StripeState, initialStripeState } from "@/types/stripe-types";
import { syncStripeDataWithSupabase } from "@/utils/stripe-sync";
import { useStripeConnection } from "@/hooks/useStripeConnection";
import { supabase } from "@/integrations/supabase/client";

// Create context with default values
const StripeContext = createContext<StripeContextType | undefined>(undefined);

/**
 * Stripe provider component
 * Manages Stripe connection state and provides methods to interact with Stripe
 */
export function StripeProvider({ children }: { children: ReactNode }) {
  const { authState } = useAuth();
  const [stripeState, setStripeState] = useState<StripeState>(initialStripeState);
  const { checkConnectionStatus, disconnectStripe } = useStripeConnection(authState.user?.id);

  // Check connection status when authenticated user changes
  useEffect(() => {
    if (authState.user) {
      handleCheckConnectionStatus();
    } else {
      // Reset state when user logs out
      setStripeState(initialStripeState);
    }
  }, [authState.user]);

  /**
   * Wrapper function to update state during connection status check
   */
  const handleCheckConnectionStatus = async () => {
    if (!authState.user) return;

    console.log("Checking Stripe connection status for user:", authState.user.id);
    setStripeState(prevState => ({ ...prevState, isLoading: true, error: null }));
    
    try {
      const connectionStatus = await checkConnectionStatus();
      
      console.log("Connection status result:", connectionStatus);
      
      if (connectionStatus) {
        setStripeState({
          isLoading: false,
          ...connectionStatus
        });
      } else {
        setStripeState(prevState => ({
          ...prevState,
          isLoading: false,
          isConnected: false,
          isValid: true,
          requireReconnect: false
        }));
      }
    } catch (error: any) {
      console.error("Error checking Stripe connection:", error);
      setStripeState(prevState => ({
        ...prevState,
        isLoading: false,
        error: error.message,
        requireReconnect: false
      }));
    }
  };

  /**
   * Function to connect Stripe account (works for both OAuth and API key methods)
   */
  const connectStripe = useCallback(async () => {
    console.log("ConnectStripe called");
    setStripeState(prevState => ({ ...prevState, isLoading: true, error: null }));
    
    try {
      await handleCheckConnectionStatus();
    } catch (error: any) {
      console.error("Failed to connect Stripe account:", error);
      setStripeState(prevState => ({
        ...prevState,
        isLoading: false,
        error: error.message
      }));
    }
  }, []);

  /**
   * Wrapper function to handle disconnecting Stripe
   */
  const handleDisconnectStripe = useCallback(async () => {
    if (!authState.user) {
      console.error("Authentication required to disconnect Stripe");
      return;
    }

    setStripeState(prevState => ({ ...prevState, isLoading: true, error: null }));

    try {
      await disconnectStripe();
      
      // Reset state after successful disconnect
      setStripeState(initialStripeState);
    } catch (error: any) {
      console.error("Error disconnecting Stripe:", error);
      setStripeState(prevState => ({
        ...prevState,
        isLoading: false,
        error: error.message
      }));
    }
  }, [authState.user, disconnectStripe]);

  /**
   * Function to sync data from Stripe
   */
  const syncStripeData = useCallback(async () => {
    if (!authState.user) {
      console.error("User not authenticated");
      return Promise.reject(new Error("User not authenticated"));
    }

    setStripeState(prevState => ({ ...prevState, isLoading: true, error: null }));
    
    try {
      // Call the standalone sync function with user ID
      const result = await syncStripeDataWithSupabase(authState.user.id, supabase);
      
      if (result.requireReconnect) {
        setStripeState(prev => ({
          ...prev,
          isLoading: false,
          isValid: false,
          error: result.error || "Please re-enter your Stripe key.",
          requireReconnect: true
        }));
        
        return { 
          success: false, 
          requireReconnect: true, 
          error: result.error 
        };
      }

      // Update the lastSynced timestamp in our state with the fresh value
      setStripeState(prev => ({
        ...prev,
        isLoading: false,
        lastSynced: result.last_synced,
        isValid: true,
        error: null,
        requireReconnect: false
      }));
      
      // Clear any cache after a successful sync
      localStorage.removeItem('sync_cache');
      
      return result.data;
    } catch (error: any) {
      console.error("Error in syncStripeData:", error);
      
      setStripeState(prev => ({
        ...prev,
        isLoading: false,
        isValid: !error.requireReconnect,
        error: error.message || "Unknown sync error",
        requireReconnect: error.requireReconnect || false
      }));
      
      throw error;
    }
  }, [authState.user]);

  return (
    <StripeContext.Provider
      value={{
        stripeState,
        connectStripe,
        disconnectStripe: handleDisconnectStripe,
        syncStripeData
      }}
    >
      {children}
    </StripeContext.Provider>
  );
}

/**
 * Custom hook for consuming Stripe context
 */
export function useStripe() {
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error("useStripe must be used within a StripeProvider");
  }
  return context;
}
