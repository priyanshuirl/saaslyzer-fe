
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";

// Schema for password reset validation
const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .refine(
      (password) => /[A-Z]/.test(password),
      "Password must contain at least one uppercase letter"
    )
    .refine(
      (password) => /[a-z]/.test(password),
      "Password must contain at least one lowercase letter"
    )
    .refine(
      (password) => /[0-9]/.test(password),
      "Password must contain at least one number"
    ),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [hasValidToken, setHasValidToken] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });
  
  // Extract access token from URL hash and check if it's valid
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Location:", location);
        
        // Check if there's a hash in the URL (Supabase appends the token as a hash)
        if (location.hash) {
          console.log("Found URL hash:", location.hash);
          
          // The auth state should be automatically updated by Supabase's library
          // when the hash is present, so we just need to check if we have a session
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Session error:", error);
            setError("Invalid or expired recovery link. Please request a new password reset.");
            setHasValidToken(false);
          } else if (data.session) {
            console.log("Valid session found");
            setHasValidToken(true);
            setError(null);
          } else {
            console.error("No session found with valid hash");
            setError("Invalid or expired recovery link. Please request a new password reset.");
            setHasValidToken(false);
          }
        } else {
          // If there's no hash, directly check for an active session
          const { data, error } = await supabase.auth.getSession();
          
          if (error || !data.session) {
            console.error("No valid session found:", error);
            setError("Invalid or missing reset token. Please request a new password reset.");
            setHasValidToken(false);
          } else {
            console.log("Active session found without hash");
            setHasValidToken(true);
            setError(null);
          }
        }
        
        setTokenChecked(true);
      } catch (err) {
        console.error("Error checking session:", err);
        setError("An error occurred. Please try again.");
        setHasValidToken(false);
        setTokenChecked(true);
      }
    };
    
    checkSession();
  }, [location]);

  const handleResetPassword = async (values: ResetPasswordValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: values.password
      });
      
      if (error) {
        console.error("Password update failed:", error);
        setError(error.message);
        toast({
          title: "Password Reset Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Password updated successfully",
        description: "You can now log in with your new password",
        variant: "default",
      });
      
      // Redirect to login page after successful password reset
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err?.message || "An error occurred while resetting your password");
      toast({
        title: "Error",
        description: err?.message || "An error occurred while resetting your password",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (!tokenChecked) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-50 via-purple-50 to-purple-100 p-4">
        <Card className="w-full max-w-md bg-white/80 shadow-xl border-0 rounded-2xl backdrop-blur-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Validating your request</CardTitle>
            <CardDescription>Please wait while we verify your password reset link...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!hasValidToken) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-50 via-purple-50 to-purple-100 p-4">
        <Card className="w-full max-w-md bg-white/80 shadow-xl border-0 rounded-2xl backdrop-blur-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-600">Invalid Reset Link</CardTitle>
            <CardDescription className="text-red-600">
              {error || "This password reset link is invalid or has expired. Please request a new one."}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button 
              onClick={() => navigate("/login")}
              variant="outline"
              className="font-semibold"
            >
              Back to login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-50 via-purple-50 to-purple-100 p-4">
      <Card className="w-full max-w-md bg-white/80 shadow-xl border-0 rounded-2xl backdrop-blur-lg">
        <CardHeader className="text-center pb-1">
          <div className="flex items-center justify-center mb-3">
            <span className="inline-flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-200 via-purple-200 to-pink-200 p-3 shadow-md">
              <Lock size={28} className="text-indigo-700" />
            </span>
          </div>
          <CardTitle className="text-2xl font-extrabold text-indigo-700 tracking-tight mb-0">Reset Password</CardTitle>
          <CardDescription className="text-md text-gray-700 mt-0">
            Please enter your new password below
          </CardDescription>
        </CardHeader>
        
        {error && (
          <CardContent className="pt-0">
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 py-2 my-2">
              <AlertDescription className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleResetPassword)}>
            <CardContent className="space-y-4 pt-3">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2 text-left">
                    <FormLabel className="font-semibold text-ink-900">New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your new password"
                          className="bg-white/85 shadow-inner rounded-lg pr-10"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={togglePasswordVisibility}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="space-y-2 text-left">
                    <FormLabel className="font-semibold text-ink-900">Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your new password"
                          className="bg-white/85 shadow-inner rounded-lg pr-10"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={toggleConfirmPasswordVisibility}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-5 px-6 pb-5">
              <Button
                type="submit"
                className="w-full px-6 py-3 text-md font-bold rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 hover:from-indigo-600 hover:to-pink-600 shadow-lg transition-colors duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating Password..." : "Reset Password"}
              </Button>
              
              <div className="text-sm text-center text-gray-700">
                <Button
                  type="button"
                  variant="link"
                  className="font-semibold text-indigo-700 hover:text-fuchsia-600 transition p-0"
                  onClick={() => navigate("/login")}
                >
                  Back to login
                </Button>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPassword;
