import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

interface UserState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  signUp: (email, password) => Promise<void>;
  signIn: (email, password) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  session: null,
  user: null,
  loading: true,
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

// Initialize the store and listen for auth changes
supabase.auth.getSession().then(({ data: { session } }) => {
  useUserStore.getState().setSession(session);
  useUserStore.setState({ loading: false });
});

supabase.auth.onAuthStateChange((_event, session) => {
  useUserStore.getState().setSession(session);
  useUserStore.setState({ loading: false });
});