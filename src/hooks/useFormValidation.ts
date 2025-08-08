
import { useState } from 'react';

interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

interface Validation {
  value: string;
  error: string | null;
  touched: boolean;
}

export const useFormValidation = (initialValues: { [key: string]: string }, rules: { [key: string]: ValidationRules }) => {
  const [values, setValues] = useState<{ [key: string]: Validation }>(
    Object.keys(initialValues).reduce((acc, key) => ({
      ...acc,
      [key]: {
        value: initialValues[key],
        error: null,
        touched: false,
      },
    }), {})
  );

  const validateField = (name: string, value: string): string | null => {
    const fieldRules = rules[name];
    if (!fieldRules) return null;

    if (fieldRules.required && !value) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    if (fieldRules.minLength && value.length < fieldRules.minLength) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} must be at least ${fieldRules.minLength} characters`;
    }

    if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} must be less than ${fieldRules.maxLength} characters`;
    }

    if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
      return `Please enter a valid ${name.toLowerCase()}`;
    }

    if (fieldRules.custom) {
      return fieldRules.custom(value);
    }

    return null;
  };

  const handleChange = (name: string, value: string) => {
    const error = validateField(name, value);
    setValues(prev => ({
      ...prev,
      [name]: {
        value,
        error,
        touched: true,
      },
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newValues = { ...values };

    Object.keys(rules).forEach(name => {
      const error = validateField(name, values[name].value);
      newValues[name] = {
        ...newValues[name],
        error,
        touched: true,
      };
      if (error) isValid = false;
    });

    setValues(newValues);
    return isValid;
  };

  return {
    values,
    handleChange,
    validateForm,
    setValues,
  };
};
