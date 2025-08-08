
import { useState } from 'react';
import { AuthState } from '../types';

export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  const setUser = (user: AuthState['user']) => {
    setAuthState(prev => ({ ...prev, user }));
  };

  const setError = (error: string | null) => {
    setAuthState(prev => ({ ...prev, error }));
    console.info("Auth error set to:", error);
  };

  const setLoading = (isLoading: boolean) => {
    setAuthState(prev => ({ ...prev, isLoading }));
  };

  return {
    authState,
    setUser,
    setError,
    setLoading,
    setAuthState,
  };
};
