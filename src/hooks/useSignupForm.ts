
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";
import { signupSchema, type SignupFormValues } from "@/schemas/signupSchema";
import { useEmailValidation } from "./useEmailValidation";
import { usePasswordVisibility } from "./usePasswordVisibility";

export const useSignupForm = (onSwitchToLogin: () => void) => {
  const { signup, authState, setAuthError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const { 
    existingUserError, 
    isCheckingEmail, 
    checkExistingEmail, 
    hasExistingEmailError,
    cleanup: cleanupEmailValidation 
  } = useEmailValidation({
    setError: form.setError,
    clearErrors: form.clearErrors
  });

  const {
    showPassword,
    showConfirmPassword,
    setShowPassword,
    setShowConfirmPassword
  } = usePasswordVisibility();

  useEffect(() => {
    const subscription = form.watch((formValues, { name }) => {
      if (name === 'email' || name === undefined) {
        const email = formValues.email;
        if (email && email !== '' && email.includes('@')) {
          console.log("Email changed, validating:", email);
          checkExistingEmail(email);
        } else {
          form.clearErrors("email");
        }
      }
    });
    
    return () => {
      cleanupEmailValidation();
      subscription.unsubscribe();
    };
  }, [form.watch]);

  const handleSubmit = async (values: SignupFormValues) => {
    if (isSubmitting) return;
    
    // Clear any previous auth errors
    setAuthError(null);
    
    // Don't proceed if there's an existing email error
    if (hasExistingEmailError()) {
      console.log("Signup blocked due to existing email error");
      return;
    }
    
    setIsSubmitting(true);

    try {
      console.log("Attempting signup for:", values.email);
      
      const result = await signup(values.email, values.password);

      if (result.success) {
        // Check if this is an email confirmation required case based on success response
        // Since we don't have user/session data in the result, we'll just show success
        toast({
          title: "Account created successfully",
          description: "Welcome to Saaslyzer! Please check your email if confirmation is required.",
        });
        
        form.reset();
        cleanupEmailValidation();
      } else {
        console.error("Signup failed:", result.error);
        
        // Handle specific error cases
        if (result.error?.includes("already registered") || result.error?.includes("User already registered")) {
          form.setError("email", { 
            type: "manual", 
            message: "This email is already registered. Please log in instead." 
          });
          
          toast({
            title: "Email already registered",
            description: "This email is already registered. Please log in instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Signup failed",
            description: result.error || "An error occurred during signup",
            variant: "destructive",
          });
          
          if (result.error) {
            form.setError("email", { type: "manual", message: result.error });
          }
        }
      }
    } catch (err) {
      console.error("Unexpected signup error:", err);
      toast({
        title: "Unexpected error",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    isCheckingEmail,
    existingUserError,
    showPassword,
    showConfirmPassword,
    setShowPassword,
    setShowConfirmPassword,
    handleSubmit: form.handleSubmit(handleSubmit),
    authState,
    switchToLogin: onSwitchToLogin
  };
};
