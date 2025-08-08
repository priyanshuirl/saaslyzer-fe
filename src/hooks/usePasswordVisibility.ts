
import { useState } from "react";

export const usePasswordVisibility = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return {
    showPassword,
    showConfirmPassword,
    setShowPassword,
    setShowConfirmPassword
  };
};
