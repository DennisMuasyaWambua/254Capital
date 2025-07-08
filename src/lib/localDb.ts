// Local database implementation using localStorage for persistence
import { v4 as uuidv4 } from 'uuid';
import bcryptjs from 'bcryptjs';

// Database keys
const USERS_KEY = '254_capital_users';
const SESSIONS_KEY = '254_capital_sessions';
const CURRENT_SESSION_KEY = '254_capital_current_session';

// Types
export interface User {
  id: string;
  email: string;
  created_at: string;
}

interface UserWithPassword extends User {
  password: string;
}

export interface Session {
  id: string;
  user_id: string;
  expires_at: string;
}

export interface SessionWithUser {
  id: string;
  user: User;
  expires_at: string;
}

// Helper functions for database operations
function getUsers(): UserWithPassword[] {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
}

function saveUsers(users: UserWithPassword[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSessions(): Session[] {
  const sessions = localStorage.getItem(SESSIONS_KEY);
  return sessions ? JSON.parse(sessions) : [];
}

function saveSessions(sessions: Session[]): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

// Authentication functions
export async function signUp(email: string, password: string) {
  try {
    const users = getUsers();
    
    // Check if user already exists
    if (users.find(user => user.email === email)) {
      return {
        error: { message: 'User already exists' },
        data: { user: null }
      };
    }
    
    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);
    
    // Create new user
    const newUser: UserWithPassword = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      created_at: new Date().toISOString()
    };
    
    // Save user
    users.push(newUser);
    saveUsers(users);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    
    return {
      error: null,
      data: { user: userWithoutPassword }
    };
  } catch (error: any) {
    return {
      error: { message: error.message || 'Failed to create account' },
      data: { user: null }
    };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const users = getUsers();
    
    // Find user
    const user = users.find(user => user.email === email);
    if (!user) {
      return {
        error: { message: 'Invalid login credentials' },
        data: { user: null, session: null }
      };
    }
    
    // Check password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        error: { message: 'Invalid login credentials' },
        data: { user: null, session: null }
      };
    }
    
    // Create session
    const session: Session = {
      id: uuidv4(),
      user_id: user.id,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };
    
    // Save session
    const sessions = getSessions();
    sessions.push(session);
    saveSessions(sessions);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    // Create session with user
    const sessionWithUser = {
      id: session.id,
      user: userWithoutPassword,
      expires_at: session.expires_at
    };
    
    // Store current session in localStorage for direct access
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(sessionWithUser));
    
    console.log('User signed in successfully:', userWithoutPassword.email);
    console.log('Session created:', sessionWithUser.id);
    
    return {
      error: null,
      data: { 
        user: userWithoutPassword,
        session: sessionWithUser
      }
    };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return {
      error: { message: error.message || 'Failed to sign in' },
      data: { user: null, session: null }
    };
  }
}

export function getSession() {
  try {
    // First check for current session in localStorage
    const currentSessionStr = localStorage.getItem(CURRENT_SESSION_KEY);
    if (currentSessionStr) {
      const currentSession = JSON.parse(currentSessionStr);
      
      // Check if session is expired
      if (new Date(currentSession.expires_at) > new Date()) {
        // Session is valid, return it
        return { data: { session: currentSession } };
      } else {
        // Session is expired, clear it
        localStorage.removeItem(CURRENT_SESSION_KEY);
      }
    }
    
    // If no current session or it's expired, check for valid sessions
    const sessions = getSessions();
    const users = getUsers();
    
    // Find valid session (not expired)
    const validSessions = sessions.filter(session => 
      new Date(session.expires_at) > new Date()
    );
    
    if (validSessions.length === 0) {
      return { data: { session: null } };
    }
    
    // Use the most recent session
    const session = validSessions[validSessions.length - 1];
    
    // Find user for this session
    const user = users.find(user => user.id === session.user_id);
    if (!user) {
      return { data: { session: null } };
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    // Create session with user
    const sessionWithUser = {
      id: session.id,
      user: userWithoutPassword,
      expires_at: session.expires_at
    };
    
    // Store current session
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(sessionWithUser));
    
    return { 
      data: { session: sessionWithUser }
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return { data: { session: null } };
  }
}

export function signOut() {
  try {
    // Clear current session
    localStorage.removeItem(CURRENT_SESSION_KEY);
    
    // Clear all sessions
    saveSessions([]);
    
    console.log('User signed out successfully');
    return { error: null };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return { error: { message: error.message || 'Failed to sign out' } };
  }
}

export function resetPasswordForEmail(email: string, options?: { redirectTo: string }) {
  try {
    const users = getUsers();
    
    // Check if user exists
    const user = users.find(user => user.email === email);
    if (!user) {
      return {
        error: { message: 'User not found' },
        data: {}
      };
    }
    
    // In a real app, this would send an email with a reset link
    console.log(`Password reset requested for ${email}. Redirect to: ${options?.redirectTo}`);
    
    return {
      error: null,
      data: {}
    };
  } catch (error: any) {
    return {
      error: { message: error.message || 'Failed to reset password' },
      data: {}
    };
  }
}

export async function updateUser({ password }: { password: string }) {
  try {
    const sessions = getSessions();
    const users = getUsers();
    
    // Find valid session
    const validSessions = sessions.filter(session => 
      new Date(session.expires_at) > new Date()
    );
    
    if (validSessions.length === 0) {
      return {
        error: { message: 'Not authenticated' },
        data: { user: null }
      };
    }
    
    // Use the most recent session
    const session = validSessions[validSessions.length - 1];
    
    // Find user for this session
    const userIndex = users.findIndex(user => user.id === session.user_id);
    if (userIndex === -1) {
      return {
        error: { message: 'User not found' },
        data: { user: null }
      };
    }
    
    // Update password
    if (password) {
      users[userIndex].password = await bcryptjs.hash(password, 10);
      saveUsers(users);
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = users[userIndex];
    
    return {
      error: null,
      data: { user: userWithoutPassword }
    };
  } catch (error: any) {
    return {
      error: { message: error.message || 'Failed to update user' },
      data: { user: null }
    };
  }
}

// Auth state change listener
export function onAuthStateChange(callback: (event: string, session: SessionWithUser | null) => void) {
  // Initial session check
  const initialSession = getSession().data.session;
  callback('INITIAL_SESSION', initialSession);
  
  // Listen for storage changes
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === CURRENT_SESSION_KEY || event.key === SESSIONS_KEY) {
      const currentSession = getSession().data.session;
      callback(currentSession ? 'SIGNED_IN' : 'SIGNED_OUT', currentSession);
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  // Create a custom event for auth changes that can be triggered programmatically
  const checkAuthState = () => {
    const currentSession = getSession().data.session;
    callback(currentSession ? 'SIGNED_IN' : 'SIGNED_OUT', currentSession);
  };
  
  // Check auth state every 5 seconds (for development purposes)
  const interval = setInterval(checkAuthState, 5000);
  
  // Return unsubscribe function
  return {
    data: {
      subscription: {
        unsubscribe: () => {
          window.removeEventListener('storage', handleStorageChange);
          clearInterval(interval);
        }
      }
    }
  };
}
