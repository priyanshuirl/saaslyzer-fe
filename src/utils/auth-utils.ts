
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";
import { User as SupabaseUser } from '@supabase/supabase-js';

export const mapSupabaseUser = (supabaseUser: SupabaseUser | null): User | null => {
  if (!supabaseUser) return null;
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    created_at: supabaseUser.created_at || new Date().toISOString(),
    trial_ends_at: calculateTrialEnd(supabaseUser.created_at || new Date().toISOString()),
  };
};

export const calculateTrialEnd = (createdAt: string): string => {
  const trialEndDate = new Date(createdAt);
  trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial
  return trialEndDate.toISOString();
};

export const loginWithEmail = async (
  email: string, 
  password: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log("Attempting login with email:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Login error:", error.message);
      
      // Handle specific error cases
      if (error.message.includes("Email not confirmed")) {
        return { 
          success: false, 
          error: "Please check your email and click the confirmation link before logging in."
        };
      } else if (error.message.includes("Invalid login credentials")) {
        return { 
          success: false, 
          error: "Invalid email or password. Please check your credentials and try again."
        };
      }
      
      return { 
        success: false, 
        error: error.message || "Login failed"
      };
    }
    
    if (!data.user) {
      console.error("No user returned from login");
      return { success: false, error: "Login failed" };
    }
    
    console.log("Login successful");
    return { success: true };
  } catch (error: any) {
    console.error("Login error:", error);
    return { 
      success: false, 
      error: "Something went wrong"
    };
  }
};

export const signupWithEmail = async (email: string, password: string) => {
  try {
    console.log("Starting signup process for:", email);
    
    const { data, error } = await supabase.auth.signUp({ 
      email: email.toLowerCase().trim(), 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });

    console.log("Signup response:", { data, error });

    if (error) {
      console.error("Signup error:", error);
      
      // Handle specific error cases
      if (error.message === "User already registered") {
        return { 
          success: false, 
          error: "This email is already registered. Please log in instead." 
        };
      }
      
      return { success: false, error: error.message };
    }

    // Return the data along with success status
    return {
      success: true,
      data: data,
      message: data.user && !data.session 
        ? "Please check your email and click the confirmation link to complete your account setup."
        : undefined
    };
    
  } catch (error: any) {
    console.error("Unexpected signup error:", error);
    return { 
      success: false, 
      error: "An unexpected error occurred. Please try again." 
    };
  }
};

export const logout = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem("authSession");
    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: "Failed to logout"
    };
  }
};
