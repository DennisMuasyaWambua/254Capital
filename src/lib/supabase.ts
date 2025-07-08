import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log environment variables for debugging (without exposing full key)
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key available:', !!supabaseAnonKey);

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create the Supabase client with optimized settings
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: (...args) => {
      // Add a timestamp to prevent caching issues
      const [url, config] = args;
      const urlWithTimestamp = typeof url === 'string' && !url.includes('?') 
        ? `${url}?_t=${Date.now()}` 
        : url;
      return fetch(urlWithTimestamp, config);
    }
  },
  realtime: {
    timeout: 60000
  }
});

// Test the connection
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth state changed:', event, session ? 'User session exists' : 'No user session');
});

export { supabase };
