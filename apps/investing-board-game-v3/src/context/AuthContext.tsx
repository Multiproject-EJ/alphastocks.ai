import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabaseClient, hasSupabaseConfig } from '@/lib/supabaseClient'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  isAuthenticated: false,
})

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If Supabase is not configured, skip auth initialization
    if (!supabaseClient || !hasSupabaseConfig) {
      setLoading(false)
      return
    }

    // Get initial session - this will pick up shared auth from ProTools
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth state changes (login/logout from ProTools or this app)
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    if (!supabaseClient) return
    await supabaseClient.auth.signOut()
    setUser(null)
    setSession(null)
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signOut,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
