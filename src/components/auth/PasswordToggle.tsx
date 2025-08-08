
import { Eye, EyeOff } from "lucide-react";

interface PasswordToggleProps {
  show: boolean;
  onToggle: () => void;
}

const PasswordToggle = ({ show, onToggle }: PasswordToggleProps) => {
  return (
    <button
      type="button"
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
      onClick={onToggle}
      tabIndex={-1}
    >
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
};

export default PasswordToggle;
