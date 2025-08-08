
import { useState } from 'react';

export const usePasswordValidation = () => {
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
  });

  const validatePassword = (password: string) => {
    const newStrength = {
      score: 0,
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    };

    newStrength.score = [
      newStrength.hasMinLength,
      newStrength.hasUpperCase,
      newStrength.hasLowerCase,
      newStrength.hasNumber,
    ].filter(Boolean).length;

    setPasswordStrength(newStrength);
    return newStrength;
  };

  return { passwordStrength, validatePassword };
};
