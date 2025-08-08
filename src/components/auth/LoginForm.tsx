
import { useEffect } from "react";
import { usePasswordReset } from "@/hooks/usePasswordReset";
import { Form, FormItem, FormField, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import PasswordToggle from "./PasswordToggle";
import PasswordResetDialog from "./PasswordResetDialog";
import { LogIn } from "lucide-react";
import LoginError from "./LoginError";
import LoginHeader from "./LoginHeader";
import { useLoginForm } from "@/hooks/useLoginForm";

/**
 * LoginForm Component
 * 
 * Handles user login functionality with:
 * - Email and password validation
 * - Error display
 * - Password visibility toggle
 * - Password reset flow
 * - Form submission handling
 * 
 * @param {Function} onSwitchToSignup - Callback to switch to signup form
 */
interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export default function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  // Get login form state and functions from custom hook
  const {
    form,             // Form methods from react-hook-form
    showPassword,     // Boolean to toggle password visibility
    setShowPassword,  // Function to set password visibility
    isLoading,        // Loading state during form submission
    loginError,       // Error message from failed login attempt
    handleSubmit,     // Function to handle form submission
    authState         // Auth state from context (user, error, etc)
  } = useLoginForm();

  // Password reset functionality from custom hook
  const passwordReset = usePasswordReset();

  /**
   * Open password reset dialog with pre-filled email
   */
  const openResetDialog = () => {
    passwordReset.setResetEmail(form.getValues().email || "");
    passwordReset.setResetDialogOpen(true);
  };

  // Clear form errors on component unmount
  useEffect(() => {
    return () => {
      form.clearErrors();
    };
  }, [form]);

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <Card className="bg-white/80 shadow-xl border-0 rounded-2xl backdrop-blur-lg">
        {/* Card header with title and description */}
        <LoginHeader />

        {/* Login form */}
        <Form {...form}>
          <form onSubmit={handleSubmit} noValidate>
            <CardContent className="space-y-4 pt-3">
              {/* Show authentication error if present */}
              {authState.error && (
                <LoginError error={authState.error} />
              )}

              {/* Email field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-ink-900">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="bg-white/85 shadow-inner rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password field with forgot password link and visibility toggle */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="font-semibold text-ink-900">Password</FormLabel>
                      <button
                        type="button"
                        onClick={openResetDialog}
                        className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition"
                      >
                        Forgot?
                      </button>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          className="bg-white/85 shadow-inner rounded-lg pr-10"
                        />
                        {/* Toggle for password visibility */}
                        <PasswordToggle
                          show={showPassword}
                          onToggle={() => setShowPassword(!showPassword)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            {/* Form actions */}
            <CardFooter className="flex flex-col space-y-5 px-6 pb-5">
              {/* Submit button */}
              <Button
                type="submit"
                className="w-full font-bold rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 hover:from-indigo-600 hover:to-pink-600 transition-colors"
                disabled={isLoading || !form.formState.isValid}
              >
                {isLoading ? "Signing in…" : (
                  <span className="flex items-center gap-2 justify-center">
                    <LogIn size={20} /> Log in
                  </span>
                )}
              </Button>

              {/* Link to signup */}
              <p className="text-sm text-center text-gray-700">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToSignup}
                  className="font-semibold text-indigo-700 hover:text-fuchsia-600 hover:underline"
                >
                  Sign up instead
                </button>
              </p>
            </CardFooter>
          </form>
        </Form>

        {/* Password reset dialog */}
        <PasswordResetDialog
          open={passwordReset.resetDialogOpen}
          onOpenChange={passwordReset.setResetDialogOpen}
          email={passwordReset.resetEmail}
          onEmailChange={(e) => {
            passwordReset.setResetEmail(e);
            passwordReset.setResetEmailError(null);
          }}
          onReset={passwordReset.handlePasswordReset}
          error={passwordReset.resetEmailError}
          isSubmitting={passwordReset.isSubmitting}
          emailSent={passwordReset.resetEmailSent}
        />
      </Card>
    </div>
  );
}
