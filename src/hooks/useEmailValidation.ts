
import { useState, useRef } from "react";
import { UseFormSetError, UseFormClearErrors } from "react-hook-form";
import { debounce } from "lodash";
import { supabase } from "@/integrations/supabase/client";
import { SignupFormValues } from "@/schemas/signupSchema";

interface UseEmailValidationProps {
  setError: UseFormSetError<SignupFormValues>;
  clearErrors: UseFormClearErrors<SignupFormValues>;
}

export const useEmailValidation = ({ setError, clearErrors }: UseEmailValidationProps) => {
  const [existingUserError, setExistingUserError] = useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const abortController = useRef<AbortController | null>(null);

  const checkExistingEmail = debounce(async (email: string) => {
    if (!email || !email.includes('@') || email.length < 5) return;
    
    if (abortController.current) {
      abortController.current.abort();
    }
    
    abortController.current = new AbortController();
    
    setIsCheckingEmail(true);
    console.log("Checking email:", email);

    try {
      // Check profiles table for existing users
      const { data: existingUsers, error: lookupError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email.toLowerCase())
        .limit(1);
      
      if (abortController.current?.signal.aborted) {
        console.log("Email check aborted for:", email);
        return;
      }
      
      console.log("Existing users check result:", existingUsers, lookupError);

      if (lookupError) {
        console.error("Error checking for existing user:", lookupError);
        // Don't show error to user for lookup failures
        setExistingUserError(null);
        clearErrors("email");
        return;
      }

      if (existingUsers && existingUsers.length > 0) {
        console.log("Email already registered:", email);
        setExistingUserError("This email is already registered. Please log in instead.");
        
        setError("email", {
          type: "manual",
          message: "This email is already registered. Please log in instead."
        });
      } else {
        setExistingUserError(null);
        clearErrors("email");
      }
    } catch (error) {
      console.error("Error during email check:", error);
      // Don't show error to user, just clear any existing validation errors
      setExistingUserError(null);
      clearErrors("email");
    } finally {
      if (abortController.current && !abortController.current.signal.aborted) {
        setIsCheckingEmail(false);
        abortController.current = null;
      }
    }
  }, 800);

  // Synchronous check for existing user error - useful during form submission
  const hasExistingEmailError = () => {
    return existingUserError !== null;
  };

  const cleanup = () => {
    checkExistingEmail.cancel();
    if (abortController.current) {
      abortController.current.abort();
    }
    setExistingUserError(null);
  };

  return {
    existingUserError,
    isCheckingEmail,
    checkExistingEmail,
    hasExistingEmailError,
    cleanup
  };
};
