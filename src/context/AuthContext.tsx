import { createContext, useContext, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthState, User } from "../types";
import { useAuthState } from "../hooks/useAuthState";
import { toast } from "@/components/ui/use-toast";
import { 
  mapSupabaseUser, 
  loginWithEmail, 
  signupWithEmail, 
  logout as logoutUser 
} from "../utils/auth-utils";

const AuthContext = createContext<{
  authState: AuthState;
  login: (email: string, password: string) => Promise<{success: boolean; error?: string}>;
  signup: (email: string, password: string) => Promise<{success: boolean, error?: string}>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setAuthError: (error: string | null) => void;
} | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { 
    authState, 
    setAuthState, 
    setUser, 
    setError: setAuthError, 
    setLoading 
  } = useAuthState();

  useEffect(() => {
    console.info("AuthProvider initialized");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.info("Auth state change:", event, session ? "Session exists" : "No session");
        
        if (event === 'SIGNED_IN' && session) {
          const user = mapSupabaseUser(session.user);
          setAuthState({
            user,
            isLoading: false,
            error: null,
          });
          
          localStorage.setItem("authSession", "true");
          
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in.",
          });
          
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            isLoading: false,
            error: null,
          });
          
          localStorage.removeItem("authSession");
          
          toast({
            title: "Signed out",
            description: "You've been successfully signed out.",
          });
        } else if (event === 'USER_UPDATED') {
          // Handle user update events
          if (session) {
            const user = mapSupabaseUser(session.user);
            setAuthState({
              user,
              isLoading: false,
              error: null,
            });
          }
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.info("Initial session check:", session ? "Session found" : "No session");
      if (session) {
        const user = mapSupabaseUser(session.user);
        setAuthState({
          user,
          isLoading: false,
          error: null,
        });
        localStorage.setItem("authSession", "true");
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          error: null,
        });
        localStorage.removeItem("authSession");
      }
    });

    return () => {
      console.info("AuthProvider cleanup - unsubscribing");
      subscription.unsubscribe();
    };
  }, [setAuthState]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);
    
    const result = await loginWithEmail(email, password);
    
    if (!result.success) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: result.error,
      }));
    }
    
    return result;
  };

  const signup = async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);

    const result = await signupWithEmail(email, password);

    if (!result.success) {
      setAuthState(prev => ({ ...prev, isLoading: false, error: result.error }));
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }

    return result;
  };

  const logout = async () => {
    setLoading(true);
    const result = await logoutUser();
    
    if (!result.success) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: result.error,
      }));
      
      toast({
        title: "Error",
        description: result.error || "Failed to logout",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      authState, 
      login, 
      signup, 
      logout, 
      setUser, 
      setAuthError 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
