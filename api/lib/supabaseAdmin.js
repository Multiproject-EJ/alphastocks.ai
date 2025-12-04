import { createClient } from '@supabase/supabase-js';

let cachedClient = null;

export function getSupabaseAdminClient() {
  if (cachedClient) return cachedClient;

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase admin credentials');
  }

  cachedClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  return cachedClient;
}
