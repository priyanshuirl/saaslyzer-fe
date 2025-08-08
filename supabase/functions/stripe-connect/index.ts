
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();
    
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "Missing user_id parameter" }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Configure Stripe OAuth URL for Stripe App (not Connect)
    const stripeClientId = Deno.env.get("STRIPE_CLIENT_ID");
    if (!stripeClientId) {
      throw new Error("STRIPE_CLIENT_ID is not configured");
    }

    // Get the request origin for the redirect URL
    const origin = req.headers.get("origin") || "http://localhost:5173";
    const redirectUri = `${origin}/api/stripe/callback`;

    // Create the OAuth URL with state containing user_id for verification during callback
    // For Stripe Apps we use the standard OAuth endpoint
    const stripeOAuthURL = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${stripeClientId}&scope=read_write&redirect_uri=${encodeURIComponent(redirectUri)}&state=${user_id}`;

    return new Response(
      JSON.stringify({ url: stripeOAuthURL }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating Stripe OAuth URL:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create Stripe connection" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
