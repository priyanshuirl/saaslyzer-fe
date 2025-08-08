
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Lock } from "lucide-react";
import { useStripe } from "@/context/StripeContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const StripeConnect = () => {
  const { stripeState, connectStripe } = useStripe();
  const [form, setForm] = useState({
    isConnecting: false,
    isFormValid: false,
    errors: {
      apiKey: "",
      submit: ""
    },
    apiKeyValue: "",
    buttonDisabled: true
  });

  // Log form state for debugging
  useEffect(() => {
    console.info("Form state:", form);
  }, [form]);

  const handleApiKeyChange = (event) => {
    const value = event.target.value?.trim();
    let isValid = false;
    let error = "";

    if (!value) {
      error = "API key is required";
    } else if (!value.startsWith("sk_") && !value.startsWith("rk_")) {
      error = "API key must start with 'sk_' (secret key) or 'rk_' (restricted key)";
    } else if (value.length < 10) {
      error = "API key is too short";
    } else {
      isValid = true;
    }

    setForm(prev => ({
      ...prev,
      apiKeyValue: value,
      isFormValid: isValid,
      buttonDisabled: !isValid,
      errors: {
        ...prev.errors,
        apiKey: error
      }
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!form.isFormValid) {
      return;
    }

    try {
      setForm(prev => ({ ...prev, isConnecting: true, buttonDisabled: true, errors: { ...prev.errors, submit: "" } }));

      console.log("Attempting to connect with API key...");

      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No active session found. Please log in again.");
      }

      // Encrypt API key before storing - using direct-connect function
      const { data, error } = await supabase.functions.invoke("stripe-direct-connect", {
        body: { api_key: form.apiKeyValue },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      console.log("Direct connect response:", data, error);

      if (error) {
        console.error("Direct connect error:", error);
        throw new Error(error.message || "Failed to connect to Stripe");
      }

      if (!data || !data.success) {
        throw new Error(data?.message || "Connection failed");
      }

      console.log("Connection successful, refreshing Stripe context...");

      toast({
        title: "Connection successful",
        description: "Your Stripe account has been connected successfully.",
      });

      // Reset form
      setForm({
        isConnecting: false,
        isFormValid: false,
        errors: {
          apiKey: "",
          submit: ""
        },
        apiKeyValue: "",
        buttonDisabled: true
      });

      // Immediately refresh the connection status to update the UI
      setTimeout(async () => {
        console.log("Refreshing connection status after successful connect...");
        await connectStripe();
        
        // Force a page reload after connection to ensure fresh state
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }, 500);

    } catch (error) {
      console.error("Stripe connection error:", error);
      setForm(prev => ({ 
        ...prev, 
        isConnecting: false,
        buttonDisabled: false,
        errors: {
          ...prev.errors,
          submit: error.message || "Connection failed. Please try again."
        }
      }));

      toast({
        variant: "destructive",
        title: "Connection failed",
        description: error.message || "Could not connect to Stripe. Please try again.",
      });
    }
  };

  return (
    <Card className="max-w-md w-full mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 text-indigo-600">
          <CreditCard className="h-6 w-6" />
          <CardTitle>Connect to Stripe</CardTitle>
        </div>
        <CardDescription>
          Connect your Stripe account to view your subscription analytics
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="apiKey">Stripe API Key</Label>
            <div className="flex items-center relative">
              <Lock className="w-4 h-4 absolute left-3 text-muted-foreground" />
              <Input
                id="apiKey"
                type="password"
                className="pl-9"
                placeholder="sk_live_... or rk_live_..."
                value={form.apiKeyValue}
                onChange={handleApiKeyChange}
                spellCheck={false}
                autoComplete="off"
              />
            </div>
            {form.errors.apiKey && (
              <p className="text-sm text-red-600">{form.errors.apiKey}</p>
            )}
            {form.errors.submit && (
              <p className="text-sm text-red-600">{form.errors.submit}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Your key will be encrypted and stored securely. Both secret keys (sk_) and restricted keys (rk_) are supported.
            </p>
          </div>

          <div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={form.buttonDisabled || form.isConnecting}
            >
              {form.isConnecting ? "Connecting..." : "Connect to Stripe"}
            </Button>
          </div>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-muted-foreground mb-2">
            You can find your API keys in the
            <a 
              href="https://dashboard.stripe.com/apikeys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 mx-1"
            >
              Stripe Dashboard
            </a>
            under Developers → API keys. Both secret keys (sk_) and restricted keys (rk_) are supported.
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex-col space-y-2">
        <p className="text-xs text-center text-muted-foreground">
          By connecting your Stripe account, you agree to our 
          <a href="#" className="text-indigo-600 hover:underline mx-1">Terms of Service</a>
          and
          <a href="#" className="text-indigo-600 hover:underline mx-1">Privacy Policy</a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default StripeConnect;
