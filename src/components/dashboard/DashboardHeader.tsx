
import { Rocket } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

const DashboardHeader = ({ title, subtitle }: DashboardHeaderProps) => {
  return (
    <div className="text-center space-y-2 sm:space-y-4">
      <div className="flex items-center justify-center gap-2 mb-2 sm:mb-4">
        <Rocket className="text-indigo-600 w-6 h-6 sm:w-8 sm:h-8" />
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900">
          {title}
        </h1>
      </div>
      <p className="text-sm sm:text-base lg:text-lg text-indigo-800 max-w-2xl mx-auto">
        {subtitle}
      </p>
    </div>
  );
};

export default DashboardHeader;
