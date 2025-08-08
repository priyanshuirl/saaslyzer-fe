
import { z } from "zod";

export const signupSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .refine(
      (email) => {
        const disposableDomains = [
          'temp-mail.org', 
          'guerrillamail.com', 
          'mailinator.com', 
          '10minutemail.com'
        ];
        return !disposableDomains.some(domain => email.toLowerCase().endsWith(domain));
      }, 
      { message: "Please use a valid, permanent email address" }
    )
    .refine(
      (email) => email.length <= 320, 
      { message: "Email address is too long" }
    ),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string()
    .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type SignupFormValues = z.infer<typeof signupSchema>;
