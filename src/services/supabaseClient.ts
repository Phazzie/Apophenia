import { createClient, SupabaseClient } from '@supabase/supabase-js';

const isTestEnv = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
const supabaseUrl = isTestEnv ? process.env.VITE_SUPABASE_URL : import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = isTestEnv ? process.env.VITE_SUPABASE_ANON_KEY : import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create mock client for when auth is disabled
const createMockClient = (): SupabaseClient => {
  console.warn('Supabase credentials not configured. Auth features disabled.');
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => {
        return {
          data: { subscription: { unsubscribe: () => {} } },
          error: null
        };
      },
      signUp: async () => ({ data: null, error: new Error('Auth disabled') }),
      signInWithPassword: async () => ({ data: null, error: new Error('Auth disabled') }),
      signOut: async () => ({ data: null, error: null }),
    }
  } as unknown as SupabaseClient;
};

// Export either real or mock client
export const supabase: SupabaseClient = (!supabaseUrl || !supabaseAnonKey)
  ? createMockClient()
  : createClient(supabaseUrl, supabaseAnonKey);
