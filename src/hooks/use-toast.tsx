
// This file defines a custom toast notification system using React context
// It provides functions to show different types of toast notifications across the app

import * as React from "react";

// Define the shape of toast notification data
export interface Toast {
  id: string;           // Unique identifier for each toast
  title?: string;       // Optional toast title
  description?: string; // Optional toast description
  action?: React.ReactNode; // Optional action element (like a button)
  variant?: "default" | "destructive"; // Style variant
}

// Configuration options for creating toast notifications
export interface ToasterToast extends Partial<Toast> {
  id: string;          // ID is required
  position?: "top-right" | "top-center" | "top-left" | "bottom-right" | "bottom-center" | "bottom-left";
  duration?: number; // How long the toast appears in milliseconds
}

// Create a React context to hold the toast state
const ToastContext = React.createContext<{
  toasts: ToasterToast[]; // Array of active toasts
  addToast: (toast: ToasterToast) => void; // Function to add a new toast
  removeToast: (id: string) => void; // Function to remove a toast by ID
  updateToast: (id: string, toast: ToasterToast) => void; // Function to update an existing toast
}>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
  updateToast: () => {},
});

// Generate a unique ID for each toast
function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

// Hook that provides toast functionality to components
export function useToast() {
  const context = React.useContext(ToastContext);

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}

// Convenience function to show a toast without using the hook directly
// Re-export this function from the ui/use-toast.ts file to prevent hook usage issues
export const toast = (props: Omit<Toast, 'id'> & { id?: string }) => {
  // Generate an ID if one is not provided
  const id = props.id || `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  // Create the full toast object with the ID
  const fullToast = {
    ...props,
    id
  };
  
  // Dispatch the event which will be caught by the Toaster component
  const event = new CustomEvent("toast-trigger", { 
    detail: fullToast 
  });
  
  document.dispatchEvent(event);
  
  return {
    id,
    dismiss: () => {
      const dismissEvent = new CustomEvent("toast-dismiss", { 
        detail: { id } 
      });
      document.dispatchEvent(dismissEvent);
    }
  };
};

// Provider component that makes toast functionality available to children
export function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([]);

  // Add a new toast to the array
  const addToast = React.useCallback((toast: ToasterToast) => {
    // Ensure an ID exists
    const id = toast.id || generateId();

    // Create the new toast with ID
    const newToast = { ...toast, id };
    
    // Add to existing toasts array
    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto-remove toast after duration (if specified)
    if (toast.duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }

    return id;
  }, []);

  // Remove a toast by ID
  const removeToast = React.useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Update an existing toast
  const updateToast = React.useCallback((id: string, toast: ToasterToast) => {
    setToasts((prevToasts) => 
      prevToasts.map((t) => (t.id === id ? { ...t, ...toast } : t))
    );
  }, []);

  // Provide toast functionality to children components
  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        updateToast,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}
