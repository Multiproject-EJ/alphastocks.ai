import { createClient, SupabaseClient } from '@supabase/supabase-js'

type SupabaseBrowserClient = SupabaseClient | null

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseClient: SupabaseBrowserClient =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export const hasSupabaseConfig = Boolean(supabaseClient)
