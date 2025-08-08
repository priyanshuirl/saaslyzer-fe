
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const useLoginForm = () => {
  const { login, authState } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  const handleSubmit = async (values: LoginFormValues) => {
    // Cancel any previous in-flight requests
    if (abortController.current) {
      abortController.current.abort();
    }
    
    // Create a new abort controller for this request
    abortController.current = new AbortController();
    
    setIsLoading(true);
    setLoginError(null);
    
    try {
      // Attempt login directly
      const { success, error } = await login(values.email, values.password);
      
      if (!success && error) {
        console.log("Login failed with error:", error);
        
        // Handle specific error cases
        if (error.includes("Email not confirmed") || error.includes("check your email")) {
          form.setError("email", { 
            type: "manual",
            message: "Please check your email and click the confirmation link before logging in." 
          });
        } else if (error.includes("Invalid login credentials") || error.includes("Invalid email or password")) {
          // Check if email exists in profiles to give better error message
          try {
            const { data: existingUsers, error: lookupError } = await supabase
              .from('profiles')
              .select('email')
              .eq('email', values.email.toLowerCase())
              .limit(1);

            if (abortController.current.signal.aborted) {
              console.log("Login request was aborted");
              return;
            }

            if (lookupError) {
              console.error("Error checking email:", lookupError);
              setLoginError("An error occurred. Please try again.");
              return;
            }

            if (!existingUsers || existingUsers.length === 0) {
              // Email doesn't exist in profiles, so it's not registered
              form.setError("email", { 
                type: "manual",
                message: "Email not registered yet. Please register using signup." 
              });
            } else {
              // Email exists but password is wrong
              form.setError("password", {
                type: "manual", 
                message: "Incorrect password. Please try again."
              });
            }
          } catch (err) {
            console.error("Error during email check:", err);
            setLoginError("An error occurred while checking your email. Please try again.");
          }
        } else {
          // Some other error occurred
          setLoginError(error);
        }
      }
    } catch (err) {
      setLoginError("Something went wrong");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
      abortController.current = null;
    }
  };

  return {
    form,
    showPassword,
    setShowPassword,
    isLoading,
    loginError,
    handleSubmit: form.handleSubmit(handleSubmit),
    authState
  };
};
