
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts, addToast, removeToast } = useToast();
  
  // Listen for toast events from outside components
  useEffect(() => {
    const handleToastTrigger = (event: CustomEvent) => {
      addToast(event.detail);
    };
    
    const handleToastDismiss = (event: CustomEvent) => {
      if (event.detail?.id) {
        removeToast(event.detail.id);
      }
    };
    
    // Add event listeners
    document.addEventListener("toast-trigger", handleToastTrigger as EventListener);
    document.addEventListener("toast-dismiss", handleToastDismiss as EventListener);
    
    // Clean up event listeners
    return () => {
      document.removeEventListener("toast-trigger", handleToastTrigger as EventListener);
      document.removeEventListener("toast-dismiss", handleToastDismiss as EventListener);
    };
  }, [addToast, removeToast]);

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
