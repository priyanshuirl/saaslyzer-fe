
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-DIRECT-CONNECT] ${step}${detailsStr}`);
};

// Updated encryption function to match the decryption format in stripe-sync
const encryptApiKey = async (apiKey: string, secret: string) => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const secretData = encoder.encode(secret);
    
    // Use SubtleCrypto for AES-GCM encryption
    const key = await crypto.subtle.importKey(
      "raw", 
      secretData,
      { name: "AES-GCM", length: 256 }, 
      false, 
      ["encrypt"]
    );
    
    // Generate a random IV for each encryption
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );
    
    // Combine IV and encrypted data
    const result = new Uint8Array(iv.length + new Uint8Array(encrypted).length);
    result.set(iv);
    result.set(new Uint8Array(encrypted), iv.length);
    
    // Convert to hex string with \x prefix for PostgreSQL bytea format
    const hexString = Array.from(result)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    
    return `\\x${hexString}`;
  } catch (error) {
    logStep("Encryption error", { error: error.message });
    throw new Error(`Failed to encrypt API key: ${error.message}`);
  }
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    // Parse request body
    const { api_key } = await req.json();
    
    // Extract user_id from authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("Missing Authorization header");
      return new Response(
        JSON.stringify({ success: false, message: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const token = authHeader.replace("Bearer ", "");
    
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      logStep("Missing Supabase environment variables");
      throw new Error("Supabase environment variables are not configured");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
    
    // Get the user from the token
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      logStep("Error getting user from token", { error: userError?.message });
      return new Response(
        JSON.stringify({ success: false, message: "Invalid user token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const user_id = userData.user.id;
    logStep("Authenticated user", { user_id });
    
    if (!api_key) {
      logStep("Missing api_key parameter");
      return new Response(
        JSON.stringify({ success: false, message: "Missing api_key parameter" }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Validating API key", { keyType: api_key.startsWith("rk_") ? "restricted" : "secret" });
    
    // Validate API key by attempting to use it
    try {
      const stripe = new Stripe(api_key, { apiVersion: "2024-06-20" });
      let account;
      let accountId;
      
      if (api_key.startsWith("rk_")) {
        // For restricted keys, try to list customers (which most restricted keys can do)
        logStep("Testing restricted key with customers.list");
        const customers = await stripe.customers.list({ limit: 1 });
        logStep("Restricted key validation successful");
        
        // For restricted keys, we'll use a placeholder account ID or try to get it from other means
        // Since we can't retrieve account info directly with restricted keys
        accountId = "restricted_key_account";
      } else {
        // For secret keys, retrieve account information
        logStep("Attempting to retrieve account with secret key");
        account = await stripe.account.retrieve();
        
        if (!account || !account.id) {
          logStep("Invalid account data returned", { accountExists: !!account });
          throw new Error("Invalid Stripe API key or account data");
        }
        
        accountId = account.id;
        logStep("Account retrieved successfully", { accountId });
      }
      
      // Get encryption secret from environment
      const encryptionSecret = Deno.env.get("ENCRYPTION_SECRET") || supabaseServiceKey.substring(0, 32);
      
      // Encrypt the API key before storing
      logStep("Encrypting API key");
      const encryptedKey = await encryptApiKey(api_key, encryptionSecret);
      
      logStep("Storing connection details");
      // Check if a connection record already exists for this user
      const { data: existingConnection, error: checkError } = await supabase
        .from("stripe_connections")
        .select("id")
        .eq("user_id", user_id)
        .maybeSingle();
        
      if (checkError) {
        logStep("Database error checking existing connection", { error: checkError.message });
        throw new Error(`Database error: ${checkError.message}`);
      }
      
      let connectionError;
      
      if (existingConnection) {
        // Update the existing record
        logStep("Updating existing connection", { id: existingConnection.id });
        const { error } = await supabase
          .from("stripe_connections")
          .update({
            stripe_account_id: accountId,
            encrypted_api_key: encryptedKey, // Store encrypted key
            is_valid: true,
            error_message: null,
            last_synced: new Date().toISOString()
          })
          .eq("id", existingConnection.id);
          
        connectionError = error;
      } else {
        // Insert a new record
        logStep("Creating new connection");
        const { error } = await supabase
          .from("stripe_connections")
          .insert({
            user_id: user_id,
            stripe_account_id: accountId,
            encrypted_api_key: encryptedKey, // Store encrypted key
            is_valid: true,
            error_message: null,
            last_synced: new Date().toISOString()
          });
          
        connectionError = error;
      }

      if (connectionError) {
        logStep("Database error", { error: connectionError.message });
        throw new Error(`Database error: ${connectionError.message}`);
      }

      logStep("Connection successful");
      // Return success response
      return new Response(
        JSON.stringify({ 
          success: true, 
          account_id: accountId,
          message: "Successfully connected to Stripe account" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (stripeError) {
      console.error("Stripe validation error:", stripeError);
      logStep("Stripe validation error", { message: stripeError.message });
      
      // Check for specific error types
      let errorMessage = "Invalid Stripe API key or connection error";
      if (stripeError.message?.includes("Invalid API Key")) {
        errorMessage = "Invalid Stripe API key provided";
      } else if (stripeError.message?.includes("expired")) {
        errorMessage = "Stripe API key has expired";
      } else if (stripeError.message?.includes("No such")) {
        errorMessage = "Stripe API key not found or revoked";
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: errorMessage,
          details: stripeError.message 
        }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    logStep("Error processing request", { message: error.message });
    return new Response(
      JSON.stringify({ success: false, message: error.message || "Failed to process request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
