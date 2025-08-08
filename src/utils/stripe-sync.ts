
import { supabase } from "@/integrations/supabase/client";
import { withRetry, stripeLimiter } from "@/utils/api-utils";

// Helper function to format timestamps consistently
export const formatTimestamp = (timestamp: string | null): string | null => {
  if (!timestamp) return null;
  // Ensure timestamp is in ISO format and remove milliseconds if present
  return new Date(timestamp).toISOString();
};

/**
 * A standalone utility function to sync Stripe data
 * This is defined outside of any React components to avoid React context issues
 */
export const syncStripeDataWithSupabase = async (userId: string | undefined, supabaseClient: any, filterMay2025?: boolean) => {
  console.log("Starting Stripe sync process...", { filterMay2025 });
  
  if (!userId) {
    throw new Error("User not authenticated");
  }
  
  try {
    // Apply rate limiting to avoid hitting Stripe API limits
    await stripeLimiter.acquire();
    
    console.log("Invoking stripe-sync function for user:", userId);
    
    // Use retry logic with exponential backoff for better resilience
    const { data, error } = await withRetry(
      async () => supabaseClient.functions.invoke('stripe-sync', {
        body: { 
          user_id: userId,
          debug: true, // Add debug flag to get more detailed logs
          filter_may_2025: filterMay2025 // Add May filter flag
        }
      }),
      {
        maxRetries: 3,
        initialDelay: 1000,
        factor: 2,
        maxDelay: 10000,
        onRetry: (attempt, error, delay) => {
          console.warn(`Stripe sync attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms...`);
        }
      }
    );

    if (error) {
      console.error("Error from stripe-sync function:", error);
      
      // Check if it's a function error vs HTTP error
      if (error.message?.includes('FunctionsHttpError')) {
        // This is an HTTP error from the function
        const errorDetails = error.context?.body || error.message;
        console.error("Function HTTP error details:", errorDetails);
        
        // Try to parse the error response
        let parsedError;
        try {
          if (typeof errorDetails === 'string') {
            parsedError = JSON.parse(errorDetails);
          } else {
            parsedError = errorDetails;
          }
        } catch (parseError) {
          parsedError = { message: errorDetails };
        }
        
        if (parsedError.require_reconnect) {
          return { 
            success: false, 
            requireReconnect: true, 
            error: parsedError.message || "Please re-enter your Stripe key.",
            last_synced: null
          };
        }
        
        throw new Error(parsedError.message || "Function execution failed");
      }
      
      throw new Error(error.message || "Edge function error");
    }

    console.log("Stripe sync function response:", data);

    // Check if reconnection is required
    if (data.require_reconnect) {
      return { 
        success: false, 
        requireReconnect: true, 
        error: data.message || data.error,
        last_synced: null
      };
    }

    // Use the timestamp returned by the function if available
    const syncTimestamp = data.last_synced || new Date().toISOString();
    
    return { 
      success: true, 
      requireReconnect: false,
      data,
      last_synced: syncTimestamp
    };
  } catch (error: any) {
    console.error("Error syncing Stripe data:", error);
    
    // Check if the error message indicates we need to reconnect
    const requireReconnect = error.message?.toLowerCase().includes("re-enter your stripe key") || 
                            error.message?.toLowerCase().includes("invalid api key") ||
                            error.message?.toLowerCase().includes("unauthorized") ||
                            false;
    
    throw {
      message: error.message || "Unknown sync error",
      requireReconnect
    };
  }
};
