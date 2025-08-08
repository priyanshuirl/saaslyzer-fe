
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const usePasswordReset = () => {
  const [resetEmail, setResetEmail] = useState("");
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetEmailError, setResetEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordReset = async () => {
    if (!resetEmail.trim()) {
      setResetEmailError("Please enter your email address");
      return;
    }

    try {
      setResetEmailError(null);
      setIsSubmitting(true);
      
      // Get the full application URL for the reset-password page
      const siteUrl = window.location.origin;
      const redirectTo = `${siteUrl}/reset-password`;
      
      console.log(`Sending reset email with redirect to: ${redirectTo}`);
      
      // When using resetPasswordForEmail, Supabase will append the token as a hash 
      // to the redirectTo URL (#access_token=...)
      const { data, error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: redirectTo,
      });

      if (error) {
        console.error("Password reset error:", error);
        setResetEmailError(error.message);
        toast({
          title: "Password Reset Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log("Password reset email sent successfully", data);
        setResetEmailSent(true);
        toast({
          title: "Password reset email sent",
          description: "Please check your inbox (and spam folder) for instructions",
        });
        
        setTimeout(() => {
          setResetDialogOpen(false);
          // Keep reset email sent status true for a bit so user knows it worked
          setTimeout(() => {
            setResetEmailSent(false);
          }, 5000);
        }, 3000);
      }
    } catch (error: any) {
      console.error("Password reset exception:", error);
      setResetEmailError(error.message || "An error occurred");
      toast({
        title: "Error",
        description: error.message || "An error occurred sending reset email",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    resetEmail,
    setResetEmail,
    resetDialogOpen,
    setResetDialogOpen,
    resetEmailSent,
    resetEmailError,
    setResetEmailError,
    isSubmitting,
    handlePasswordReset,
  };
};
