import { createContext } from 'preact';
import { useState, useEffect, useContext } from 'preact/hooks';
import { supabase } from '../lib/supabaseClient.js';
import { isDemoMode } from '../config/runtimeConfig.js';

const AuthContext = createContext({});

// Demo user configuration for development mode
const createDemoUser = () => ({
  id: 'demo-user-id',
  email: 'demo@alphastocks.ai',
  app_metadata: {},
  user_metadata: { display_name: 'Demo Trader' },
  aud: 'authenticated',
  created_at: new Date().toISOString()
});

const createDemoSession = (user) => ({
  user,
  access_token: 'demo-token',
  refresh_token: 'demo-refresh'
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we're in demo mode
    if (isDemoMode()) {
      // Use demo mode - auto-login with demo user
      const demoUser = createDemoUser();
      const demoSession = createDemoSession(demoUser);
      setSession(demoSession);
      setUser(demoUser);
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

