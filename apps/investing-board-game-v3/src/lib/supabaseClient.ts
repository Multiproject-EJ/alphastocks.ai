import { createClient, SupabaseClient } from '@supabase/supabase-js'

type SupabaseBrowserClient = SupabaseClient | null

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create the Supabase client with auth persistence enabled
// This shares the auth session with ProTools via localStorage
export const supabaseClient: SupabaseBrowserClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          // Use the same storage key prefix as ProTools workspace
          // to share authentication state across apps
          storageKey: 'supabase.auth.token',
        },
      })
    : null

export const hasSupabaseConfig = Boolean(supabaseClient)
