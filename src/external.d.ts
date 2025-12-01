declare module '@supabase/supabase-js' {
  export interface Session {
    user?: User | null;
  }

  export interface User {
    id: string;
    email?: string;
  }

  export interface SupabaseClient {
    auth: {
      getSession: () => Promise<{ data: { session: Session | null } }>;
      onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
        data: { subscription: { unsubscribe: () => void } };
      };
      signUp: (credentials: { email: string; password: string }) => Promise<{ error?: Error | null }>;
      signInWithPassword: (credentials: { email: string; password: string }) => Promise<{ error?: Error | null }>;
      signOut: () => Promise<{ error?: Error | null }>;
    };
  }

  export function createClient<
    Database = unknown,
    SchemaName extends string & keyof Database = string & keyof Database,
    Schema extends Database[SchemaName] = Database[SchemaName]
  >(url: string, anonKey: string): SupabaseClient;

  export type SupabaseClientOptions<_SchemaName extends string> = Record<string, unknown>;
}

declare module 'vitest' {
  export const vi: {
    importActual: <T = unknown>(path: string) => Promise<T>;
    [key: string]: any;
  };
  export const beforeEach: any;
}
