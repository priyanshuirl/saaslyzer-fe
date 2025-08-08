
// We need to modify this file to prevent hooks from being called outside React components
// and to ensure Toast type consistency

// Import types and functions directly from the hooks directory
import { toast as hookToast, type Toast as HookToast, type ToasterToast } from "@/hooks/use-toast";

// Define our adjusted Toast type that doesn't require id
export interface Toast extends Omit<HookToast, 'id'> {
  id?: string; // Make id optional as we'll generate it if not provided
}

// Re-export the toast function from hooks
export const toast = hookToast;

// Re-export the hook from the hooks directory
export { useToast } from "@/hooks/use-toast";

// Re-export types
export type { ToasterToast };
