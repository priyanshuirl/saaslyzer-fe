
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, UserPlus } from "lucide-react";
import { useSignupForm } from "@/hooks/useSignupForm";
import PasswordToggle from "./PasswordToggle";
import SignupHeader from "./SignupHeader";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import { usePasswordValidation } from "@/hooks/usePasswordValidation";

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

const SignupForm = ({ onSwitchToLogin }: SignupFormProps) => {
  const {
    form,
    isSubmitting,
    isCheckingEmail,
    existingUserError,
    showPassword,
    showConfirmPassword,
    setShowPassword,
    setShowConfirmPassword,
    handleSubmit,
    authState,
    switchToLogin  // Renamed to avoid conflict with prop name
  } = useSignupForm(onSwitchToLogin);

  const { passwordStrength, validatePassword } = usePasswordValidation();

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <Card className="bg-white/70 shadow-xl border-0 rounded-2xl backdrop-blur-lg">
        <SignupHeader />
        
        <Form {...form}>
          <form onSubmit={handleSubmit} noValidate>
            <CardContent className="space-y-4 pt-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2 text-left">
                    <FormLabel className="font-semibold text-ink-900">
                      Email
                      {isCheckingEmail && (
                        <Loader2 className="inline-block ml-2 h-4 w-4 animate-spin text-indigo-600" />
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        className={`bg-white/85 shadow-inner rounded-lg ${existingUserError ? 'border-red-300 focus-visible:ring-red-300' : ''}`}
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {existingUserError && (
                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 py-2 mt-0">
                  <AlertDescription className="flex flex-col items-start gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {existingUserError}
                    </div>
                    <Button 
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onSwitchToLogin}
                      className="mt-2 border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800"
                    >
                      Switch to login
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
              {!existingUserError && (
                <>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-2 text-left">
                        <FormLabel className="font-semibold text-ink-900">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a password"
                              className="bg-white/85 shadow-inner rounded-lg pr-10"
                              autoComplete="new-password"
                              onChange={(e) => {
                                field.onChange(e);
                                validatePassword(e.target.value);
                              }}
                            />
                            <PasswordToggle 
                              show={showPassword} 
                              onToggle={() => setShowPassword(!showPassword)} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                        <PasswordStrengthIndicator {...passwordStrength} />
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
                              placeholder="Confirm your password"
                              className="bg-white/85 shadow-inner rounded-lg pr-10"
                              autoComplete="new-password"
                            />
                            <PasswordToggle 
                              show={showConfirmPassword} 
                              onToggle={() => setShowConfirmPassword(!showConfirmPassword)} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              {authState.error && !existingUserError && (
                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 py-2">
                  <AlertDescription className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {authState.error}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-5 px-6 pb-5">
              <Button
                type="submit"
                className="w-full px-6 py-3 text-md font-bold rounded-xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 hover:from-fuchsia-600 hover:to-indigo-600 shadow-lg transition-colors duration-200"
                disabled={isSubmitting || authState.isLoading || !!existingUserError}
              >
                {isSubmitting || authState.isLoading ? "Creating account..." : (
                  <span className="flex items-center gap-2 justify-center">
                    <UserPlus size={20} className="inline" /> Create account
                  </span>
                )}
              </Button>
              
              <div className="text-sm text-center text-gray-700">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="font-semibold text-fuchsia-700 hover:underline hover:text-indigo-600 transition"
                >
                  Log in instead
                </button>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default SignupForm;
