
import { Progress } from "@/components/ui/progress";

interface PasswordStrengthProps {
  score: number;
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
}

const PasswordStrengthIndicator = ({
  score,
  hasMinLength,
  hasUpperCase,
  hasLowerCase,
  hasNumber,
}: PasswordStrengthProps) => {
  const getStrengthColor = () => {
    switch (score) {
      case 0:
        return "bg-red-500";
      case 1:
        return "bg-orange-500";
      case 2:
        return "bg-yellow-500";
      case 3:
        return "bg-lime-500";
      case 4:
        return "bg-green-500";
      default:
        return "bg-gray-200";
    }
  };

  const requirements = [
    { met: hasMinLength, text: "At least 8 characters" },
    { met: hasUpperCase, text: "At least one uppercase letter" },
    { met: hasLowerCase, text: "At least one lowercase letter" },
    { met: hasNumber, text: "At least one number" },
  ];

  return (
    <div className="space-y-2">
      <Progress 
        value={score * 25} 
        className={`h-2 ${getStrengthColor()}`} 
      />
      <ul className="text-xs space-y-1">
        {requirements.map((req, index) => (
          <li 
            key={index}
            className={`flex items-center gap-1 ${
              req.met ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            {req.met ? '✓' : '○'} {req.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrengthIndicator;
