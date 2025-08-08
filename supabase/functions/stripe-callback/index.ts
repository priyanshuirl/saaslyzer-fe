
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state"); // This should be the user_id from our request
  const error = url.searchParams.get("error");
  
  // Handle error response from Stripe
  if (error) {
    console.error("Stripe OAuth error:", error);
    return new Response(
      JSON.stringify({ error: "Stripe authorization failed" }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  if (!code || !state) {
    return new Response(
      JSON.stringify({ error: "Missing required parameters" }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    
    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://connect.stripe.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_secret: stripeSecretKey,
        grant_type: "authorization_code",
        code,
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      throw new Error(tokenData.error_description || "Failed to get access token");
    }
    
    // Initialize Supabase client with service role key to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables are not configured");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Save the connection details in the database
    const { data: connectionData, error: connectionError } = await supabase
      .from("stripe_connections")
      .upsert({
        user_id: state,
        stripe_account_id: tokenData.stripe_user_id,
        stripe_access_token: tokenData.access_token,
        stripe_refresh_token: tokenData.refresh_token,
        token_type: tokenData.token_type,
        scope: tokenData.scope,
        last_synced: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select();

    if (connectionError) {
      throw new Error(`Database error: ${connectionError.message}`);
    }

    // Create initial sync log entry
    await supabase.from("sync_logs").insert({
      user_id: state,
      status: "success",
      message: "Initial Stripe connection established",
      records_processed: 0,
      completed_at: new Date().toISOString()
    });

    // Redirect back to the dashboard with success parameter
    const origin = req.headers.get("origin") || "http://localhost:5173";
    return Response.redirect(`${origin}/dashboard?stripeConnected=true`, 302);
  } catch (error) {
    console.error("Error handling Stripe callback:", error);
    const origin = req.headers.get("origin") || "http://localhost:5173";
    return Response.redirect(`${origin}/dashboard?error=stripe_connection_failed`, 302);
  }
});
