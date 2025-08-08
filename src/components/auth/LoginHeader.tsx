
import { LogIn } from "lucide-react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const LoginHeader = () => {
  return (
    <CardHeader className="text-center pb-1">
      <div className="flex items-center justify-center mb-3">
        <span className="inline-flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-200 via-purple-200 to-pink-200 p-3 shadow-md">
          <LogIn size={28} className="text-indigo-700" />
        </span>
      </div>
      <CardTitle className="text-2xl font-extrabold text-indigo-700 tracking-tight mb-0">
        Sign in
      </CardTitle>
      <CardDescription className="text-md text-gray-700 mt-0">
        Welcome back! Please log in to access your dashboard.
      </CardDescription>
    </CardHeader>
  );
};

export default LoginHeader;

