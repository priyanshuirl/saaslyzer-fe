
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface LoginErrorProps {
  error: string;
}

const LoginError = ({ error }: LoginErrorProps) => {
  return (
    <Alert variant="destructive" className="bg-red-100 border-2 border-red-300 text-red-900 py-4 px-4 rounded-md shadow-md">
      <AlertDescription className="flex items-center gap-2 text-sm font-medium">
        <AlertCircle className="h-5 w-5 text-red-600" />
        {error}
      </AlertDescription>
    </Alert>
  );
};

export default LoginError;
