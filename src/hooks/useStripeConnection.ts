
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { withRetry, stripeLimiter } from "@/utils/api-utils";
import { StripeState } from "@/types/stripe-types";
import { formatTimestamp } from "@/utils/stripe-sync";

/**
 * Custom hook to handle Stripe connection management
 */
export const useStripeConnection = (userId: string | undefined) => {
  /**
   * Check Stripe connection status
   */
  const checkConnectionStatus = useCallback(async () => {
    if (!userId) return null;

    console.log("Checking Stripe connection status...");

    try {
      // Apply rate limiting to the connection check
      await stripeLimiter.acquire();
      
      // Use retry logic with exponential backoff
      const { data, error } = await withRetry(
        async () => supabase
          .from('stripe_connections')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
        {
          maxRetries: 2, // Fewer retries for UI operations
          initialDelay: 500,
          factor: 2
        }
      );

      if (error) throw new Error(error.message);

      console.log("Stripe connection data:", data);

      // Check if the connection is valid
      const connectionData = data as any; // Use type assertion to bypass TypeScript errors
      const isValid = connectionData?.is_valid !== false; // If undefined or true, consider valid
      const requireReconnect = !isValid;
      const errorMessage = connectionData?.error_message;
      const lastSynced = data?.last_synced || null;

      console.log("Connection validity:", { isValid, requireReconnect, lastSynced });

      return {
        isConnected: !!data,
        isValid, 
        lastSynced: formatTimestamp(lastSynced),
        error: errorMessage || null,
        accountId: data?.stripe_account_id || null,
        requireReconnect
      };
    } catch (error: any) {
      console.error("Error checking Stripe connection:", error);
      throw error;
    }
  }, [userId]);

  /**
   * Function to disconnect Stripe account
   */
  const disconnectStripe = useCallback(async () => {
    if (!userId) {
      console.error("Authentication required to disconnect Stripe");
      return { success: false, error: "Authentication required" };
    }

    try {
      // Apply rate limiting
      await stripeLimiter.acquire();
      
      // Use retry logic with exponential backoff for the fetch operation
      const { data, error } = await withRetry(
        async () => {
          const result = await supabase
            .from('stripe_connections')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();
            
          return result;
        },
        {
          maxRetries: 2,
          initialDelay: 500
        }
      );

      if (error) throw new Error(error.message);
      
      if (data?.id) {
        // Apply rate limiting for the delete operation as well
        await stripeLimiter.acquire();
        
        // If connection exists, delete it
        const { error: deleteError } = await withRetry(
          async () => supabase
            .from('stripe_connections')
            .delete()
            .eq('id', data.id),
          {
            maxRetries: 2,
            initialDelay: 500
          }
        );
          
        if (deleteError) throw new Error(deleteError.message);
      }

      return { success: true };
    } catch (error: any) {
      console.error("Error disconnecting Stripe:", error);
      throw error;
    }
  }, [userId]);

  return {
    checkConnectionStatus,
    disconnectStripe
  };
};
