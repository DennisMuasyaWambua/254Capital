import React, { createContext, useContext, useEffect, useState } from 'react';
import * as localDb from '../lib/localDb';

type AuthError = {
  message: string;
  status?: number;
};

type AuthResponse<T> = {
  data: T | null;
  error: AuthError | null;
};

interface AuthContextType {
  user: localDb.User | null;
  session: any | null;
  loading: boolean;
  networkError: boolean;
  signUp: (email: string, password: string) => Promise<AuthResponse<{ user: localDb.User | null }>>;
  signIn: (email: string, password: string) => Promise<AuthResponse<{ user: localDb.User | null; session: any | null }>>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<AuthResponse<{}>>;
  updatePassword: (password: string) => Promise<AuthResponse<{ user: localDb.User }>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<localDb.User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data } = localDb.getSession();
        setSession(data.session);
        setUser(data.session?.user || null);
        setNetworkError(false);
      } catch (error) {
        console.error('Error getting initial session:', error);
        setNetworkError(false); // Local DB won't have network errors
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = localDb.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      console.log('Signing up with email:', email);
      const response = await localDb.signUp(email, password);
      
      console.log('Signup response:', response);
      return response;
    } catch (error: any) {
      console.error('Unexpected signup error:', error);
      return {
        data: { user: null },
        error: {
          message: error.message || 'Error during signup'
        }
      };
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in with email:', email);
      const response = await localDb.signIn(email, password);
      
      console.log('Signin response:', response);
      return response;
    } catch (error: any) {
      console.error('Unexpected signin error:', error);
      return {
        data: { user: null, session: null },
        error: {
          message: error.message || 'Error during signin'
        }
      };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = localDb.signOut();
      return { error };
    } catch (error: any) {
      console.error('Signout error:', error);
      return {
        error: {
          message: error.message || 'Error during sign out'
        }
      };
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      return localDb.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
    } catch (error: any) {
      console.error('Reset password error:', error);
      return {
        data: {},
        error: {
          message: error.message || 'Error during password reset'
        }
      };
    }
  };

  // Update password
  const updatePassword = async (password: string) => {
    try {
      return await localDb.updateUser({
        password,
      });
    } catch (error: any) {
      console.error('Update password error:', error);
      return {
        data: { user: null as unknown as localDb.User },
        error: {
          message: error.message || 'Error updating password'
        }
      };
    }
  };

  const value = {
    user,
    session,
    loading,
    networkError,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
