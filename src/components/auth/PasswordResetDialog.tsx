
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onEmailChange: (email: string) => void;
  onReset: () => void;
  error: string | null;
  isSubmitting: boolean;
  emailSent: boolean;
}

const PasswordResetDialog = ({
  open,
  onOpenChange,
  email,
  onEmailChange,
  onReset,
  error,
  isSubmitting,
  emailSent,
}: PasswordResetDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset your password</DialogTitle>
          <DialogDescription>
            {!emailSent ? 
              "Enter your email address and we'll send you a link to reset your password." : 
              "Password reset email has been sent. Check your inbox for instructions."
            }
          </DialogDescription>
        </DialogHeader>
        
        {!emailSent && (
          <>
            <div className="flex flex-col space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email address</Label>
                <Input 
                  id="reset-email" 
                  type="email" 
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                />
                {error && (
                  <p className="text-sm font-medium text-destructive">{error}</p>
                )}
              </div>
            </div>
            
            <DialogFooter className="sm:justify-between">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={onReset}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send reset link"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PasswordResetDialog;
