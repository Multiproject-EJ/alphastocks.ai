const sanitize = (value) => (typeof value === 'string' ? value.trim() : '');

const resolveSupabaseConfig = (env) => {
  const url = sanitize(env.VITE_SUPABASE_URL);
  const anonKey = sanitize(env.VITE_SUPABASE_ANON_KEY);

  if (!url || !anonKey) {
    return null;
  }

  return {
    url,
    anonKey
  };
};

const createRuntimeConfig = () => {
  const env = import.meta.env ?? {};
  const supabase = resolveSupabaseConfig(env);

  if (typeof window === 'object') {
    window.__ALPHASTOCKS_RUNTIME__ = window.__ALPHASTOCKS_RUNTIME__ || {};
    window.__ALPHASTOCKS_RUNTIME__.supabase = supabase;
    window.__ALPHASTOCKS_RUNTIME__.mode = supabase ? 'supabase' : 'demo';
  }

  return {
    mode: supabase ? 'supabase' : 'demo',
    isDemoMode: !supabase,
    supabase,
    env: {
      supabaseUrl: supabase?.url ?? '',
      supabaseAnonKey: supabase?.anonKey ?? ''
    }
  };
};

const runtimeConfig = createRuntimeConfig();

export const getRuntimeConfig = () => runtimeConfig;

export const requireSupabaseConfig = () => {
  if (!runtimeConfig.supabase) {
    throw new Error(
      'Supabase configuration missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment before requiring live data.'
    );
  }

  return runtimeConfig.supabase;
};

export const isDemoMode = () => runtimeConfig.isDemoMode;
