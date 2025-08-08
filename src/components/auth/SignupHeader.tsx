
import { UserPlus } from "lucide-react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const SignupHeader = () => {
  return (
    <CardHeader className="text-center pb-1">
      <div className="flex items-center justify-center mb-3">
        <span className="inline-flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-200 via-purple-200 to-pink-200 p-3 shadow-md">
          <UserPlus size={28} className="text-indigo-700" />
        </span>
      </div>
      <CardTitle className="text-2xl font-extrabold text-indigo-700 tracking-tight mb-0">
        Create Account
      </CardTitle>
      <CardDescription className="text-md text-gray-700 mt-0">
        Get started with your free 14-day trial — no credit card needed!
      </CardDescription>
    </CardHeader>
  );
};

export default SignupHeader;
