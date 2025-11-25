'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

// Constants for cross-tab communication
const AUTH_CHANNEL_NAME = 'schnittwerk-auth'
const LOGOUT_EVENT = 'logout'
const LOGIN_EVENT = 'login'

interface AuthContextValue {
  user: User | null
  session: Session | null
  isLoading: boolean
  isSessionExpired: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = React.useState<User | null>(null)
  const [session, setSession] = React.useState<Session | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSessionExpired, setIsSessionExpired] = React.useState(false)

  const supabase = React.useMemo(() => createClient(), [])
  const channelRef = React.useRef<BroadcastChannel | null>(null)

  // Initialize BroadcastChannel for tab sync
  React.useEffect(() => {
    // BroadcastChannel API - supported in all modern browsers including Safari 15.4+
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channelRef.current = new BroadcastChannel(AUTH_CHANNEL_NAME)

      channelRef.current.onmessage = (event) => {
        if (event.data?.type === LOGOUT_EVENT) {
          // Another tab logged out - update local state and redirect
          setUser(null)
          setSession(null)
          setIsSessionExpired(false)

          // Only redirect if on protected route
          const protectedPaths = ['/dashboard', '/admin', '/profile', '/konto']
          const isProtected = protectedPaths.some((path) => pathname.startsWith(path))
          if (isProtected) {
            router.push('/login')
            router.refresh()
          }
        } else if (event.data?.type === LOGIN_EVENT) {
          // Another tab logged in - refresh to get new session
          router.refresh()
        }
      }
    }

    return () => {
      channelRef.current?.close()
    }
  }, [router, pathname])

  // Fallback for older browsers: localStorage event listener
  React.useEffect(() => {
    if (typeof window === 'undefined') return

    // Skip if BroadcastChannel is supported (primary method is used)
    const hasBroadcastChannel = 'BroadcastChannel' in window
    if (hasBroadcastChannel) return

    // Fallback for browsers without BroadcastChannel
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'auth-logout-event' && event.newValue) {
        setUser(null)
        setSession(null)
        setIsSessionExpired(false)

        const protectedPaths = ['/dashboard', '/admin', '/profile', '/konto']
        const isProtected = protectedPaths.some((path) => pathname.startsWith(path))
        if (isProtected) {
          router.push('/login')
          router.refresh()
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [router, pathname])

  // Listen for Supabase auth state changes
  React.useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        setSession(initialSession)
        setUser(initialSession?.user ?? null)

        // Check if session is expired
        if (initialSession?.expires_at) {
          const expiresAt = new Date(initialSession.expires_at * 1000)
          if (expiresAt <= new Date()) {
            setIsSessionExpired(true)
          }
        }
      } catch (error) {
        console.error('Failed to get initial session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (event === 'SIGNED_OUT') {
          setIsSessionExpired(false)
          // Broadcast logout to other tabs
          broadcastAuthEvent(LOGOUT_EVENT)
        } else if (event === 'SIGNED_IN') {
          setIsSessionExpired(false)
          // Broadcast login to other tabs
          broadcastAuthEvent(LOGIN_EVENT)
        } else if (event === 'TOKEN_REFRESHED') {
          setIsSessionExpired(false)
        } else if (event === 'USER_UPDATED') {
          // User was updated, session is still valid
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Broadcast auth event to other tabs
  const broadcastAuthEvent = (type: string) => {
    // Try BroadcastChannel first
    if (channelRef.current) {
      channelRef.current.postMessage({ type })
    }

    // Fallback: localStorage event for older browsers
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-logout-event', Date.now().toString())
      // Clean up immediately - we just need to trigger the event
      setTimeout(() => localStorage.removeItem('auth-logout-event'), 100)
    }
  }

  // Sign out and broadcast to other tabs
  const signOut = React.useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setIsSessionExpired(false)

      // Broadcast to other tabs
      broadcastAuthEvent(LOGOUT_EVENT)

      // Redirect to home
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Sign out failed:', error)
      // Even if sign out fails, clear local state and redirect
      setUser(null)
      setSession(null)
      broadcastAuthEvent(LOGOUT_EVENT)
      router.push('/')
      router.refresh()
    }
  }, [supabase, router])

  // Refresh session manually
  const refreshSession = React.useCallback(async () => {
    try {
      const { data: { session: newSession }, error } = await supabase.auth.refreshSession()
      if (error) {
        // Session refresh failed - session is expired
        setIsSessionExpired(true)
        return
      }
      if (newSession) {
        setSession(newSession)
        setUser(newSession.user)
        setIsSessionExpired(false)
      }
    } catch (error) {
      console.error('Session refresh failed:', error)
      setIsSessionExpired(true)
    }
  }, [supabase])

  // Periodically check session validity
  React.useEffect(() => {
    // Check every 5 minutes if session is still valid
    const checkInterval = setInterval(() => {
      if (session?.expires_at) {
        const expiresAt = new Date(session.expires_at * 1000)
        const now = new Date()
        // If session expires in less than 5 minutes, try to refresh
        const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)

        if (expiresAt <= now) {
          setIsSessionExpired(true)
        } else if (expiresAt <= fiveMinutesFromNow) {
          // Proactively refresh session before it expires
          refreshSession()
        }
      }
    }, 60 * 1000) // Check every minute

    return () => clearInterval(checkInterval)
  }, [session, refreshSession])

  const value: AuthContextValue = {
    user,
    session,
    isLoading,
    isSessionExpired,
    signOut,
    refreshSession,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
