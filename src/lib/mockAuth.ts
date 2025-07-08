// Mock authentication service for local development
import { User } from '@supabase/supabase-js';

// Mock user storage
const USERS_STORAGE_KEY = '254_capital_users';
const SESSION_STORAGE_KEY = '254_capital_session';

// Types
interface MockUser {
  id: string;
  email: string;
  password: string;
  created_at: string;
}

interface MockSession {
  user: User;
  access_token: string;
  expires_at: number;
}

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 15);
const generateToken = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Get users from local storage
const getUsers = (): MockUser[] => {
  const users = localStorage.getItem(USERS_STORAGE_KEY);
  return users ? JSON.parse(users) : [];
};

// Save users to local storage
const saveUsers = (users: MockUser[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

// Get current session
const getSession = (): MockSession | null => {
  const session = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!session) return null;
  
  const parsedSession = JSON.parse(session) as MockSession;
  
  // Check if session is expired
  if (parsedSession.expires_at < Date.now()) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
  
  return parsedSession;
};

// Save session
const saveSession = (session: MockSession) => {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

// Clear session
const clearSession = () => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
};

// Mock authentication methods
export const mockAuth = {
  // Get current user
  getUser: () => {
    const session = getSession();
    return session ? session.user : null;
  },
  
  // Sign up
  signUp: async (email: string, password: string) => {
    const users = getUsers();
    
    // Check if user already exists
    if (users.find(user => user.email === email)) {
      return {
        error: { message: 'User already exists' },
        data: { user: null }
      };
    }
    
    // Create new user
    const newUser = {
      id: generateId(),
      email,
      password,
      created_at: new Date().toISOString()
    };
    
    // Save user
    users.push(newUser);
    saveUsers(users);
    
    // Create session user (without password)
    const sessionUser = {
      id: newUser.id,
      email: newUser.email,
      created_at: newUser.created_at,
      aud: 'authenticated',
      role: 'authenticated'
    } as unknown as User;
    
    // Create and save session
    const session: MockSession = {
      user: sessionUser,
      access_token: generateToken(),
      expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    };
    saveSession(session);
    
    return {
      error: null,
      data: { user: sessionUser }
    };
  },
  
  // Sign in
  signIn: async (email: string, password: string) => {
    const users = getUsers();
    const user = users.find(user => user.email === email);
    
    // Check if user exists and password is correct
    if (!user || user.password !== password) {
      return {
        error: { message: 'Invalid login credentials' },
        data: { user: null, session: null }
      };
    }
    
    // Create session user (without password)
    const sessionUser = {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      aud: 'authenticated',
      role: 'authenticated'
    } as unknown as User;
    
    // Create and save session
    const session: MockSession = {
      user: sessionUser,
      access_token: generateToken(),
      expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    };
    saveSession(session);
    
    return {
      error: null,
      data: { user: sessionUser, session }
    };
  },
  
  // Sign out
  signOut: async () => {
    clearSession();
    return { error: null };
  },
  
  // Reset password
  resetPassword: async (email: string) => {
    const users = getUsers();
    const user = users.find(user => user.email === email);
    
    if (!user) {
      return {
        error: { message: 'User not found' },
        data: null
      };
    }
    
    // In a real app, this would send an email
    console.log(`Password reset requested for ${email}`);
    
    return {
      error: null,
      data: { message: 'Password reset email sent' }
    };
  },
  
  // Update password
  updatePassword: async (password: string) => {
    const session = getSession();
    if (!session) {
      return {
        error: { message: 'Not authenticated' },
        data: null
      };
    }
    
    const users = getUsers();
    const userIndex = users.findIndex(user => user.id === session.user.id);
    
    if (userIndex === -1) {
      return {
        error: { message: 'User not found' },
        data: null
      };
    }
    
    // Update password
    users[userIndex].password = password;
    saveUsers(users);
    
    return {
      error: null,
      data: { message: 'Password updated successfully' }
    };
  },
  
  // Subscribe to auth changes
  onAuthStateChange: (callback: (event: string, session: MockSession | null) => void) => {
    // Check initial session
    const initialSession = getSession();
    callback('INITIAL_SESSION', initialSession);
    
    // Create a custom event for auth changes
    const authChangeEvent = new CustomEvent('AUTH_STATE_CHANGE');
    
    // Add event listener
    const handleAuthChange = () => {
      const session = getSession();
      callback('SIGNED_IN', session);
    };
    
    window.addEventListener('AUTH_STATE_CHANGE', handleAuthChange);
    
    // Return unsubscribe function
    return {
      unsubscribe: () => {
        window.removeEventListener('AUTH_STATE_CHANGE', handleAuthChange);
      }
    };
  }
};
