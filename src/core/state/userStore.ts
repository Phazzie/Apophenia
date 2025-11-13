/**
 * USER STORE
 *
 * Manages user authentication state via Supabase.
 * Tracks session, user info, and provides auth actions.
 *
 * Features:
 * - Zustand store (no persistence - handled by Supabase)
 * - Explicit initialization (no module-level side effects)
 * - Sign up, sign in, sign out actions
 * - Auth state change listener
 *
 * IMPORTANT: Call `initializeUserAuth()` once at app startup!
 */

import { create } from 'zustand';
import { supabase } from '../../services/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

interface UserState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  session: null,
  user: null,
  loading: true,
  initialized: false,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setUser: (user) => set({ user }),
  signUp: async (email, password) => {
    set({ loading: true });
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    set({ loading: false });
  },
  signIn: async (email, password) => {
    set({ loading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    set({ loading: false });
  },
  signOut: async () => {
    set({ loading: true });
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ session: null, user: null, loading: false });
  },
}));

/**
 * Initialize user authentication.
 * Call this ONCE at app startup (e.g., in main.tsx or App.tsx).
 *
 * Sets up:
 * - Initial session retrieval
 * - Auth state change listener
 */
export async function initializeUserAuth(): Promise<void> {
  const state = useUserStore.getState();

  // Prevent double initialization
  if (state.initialized) {
    console.warn('User auth already initialized');
    return;
  }

  console.log('Initializing user authentication...');

  try {
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();
    useUserStore.getState().setSession(session);
    useUserStore.setState({ loading: false, initialized: true });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      useUserStore.getState().setSession(session);
      useUserStore.setState({ loading: false });
    });

    console.log('User authentication initialized', session ? '(logged in)' : '(logged out)');
  } catch (error) {
    console.error('Failed to initialize user authentication:', error);
    useUserStore.setState({ loading: false, initialized: true });
  }
}
