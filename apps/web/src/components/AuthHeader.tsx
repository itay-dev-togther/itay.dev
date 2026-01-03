'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export function AuthHeader() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <header style={headerStyle}>
        <a href="/" style={logoStyle}>Itay.dev</a>
        <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#eee' }} />
      </header>
    )
  }

  return (
    <header style={headerStyle}>
      <a href="/" style={logoStyle}>Itay.dev</a>

      <nav style={navStyle}>
        <a href="/projects" style={linkStyle}>Projects</a>
        {user ? (
          <>
            <a href="/dashboard" style={linkStyle}>Dashboard</a>
            <a href="/profile" style={linkStyle}>Profile</a>
            <div style={userMenuStyle}>
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata?.full_name || 'User'}
                  style={avatarStyle}
                />
              ) : (
                <div style={{ ...avatarStyle, backgroundColor: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {(user.user_metadata?.full_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                </div>
              )}
              <span style={{ fontSize: '0.875rem' }}>
                {user.user_metadata?.full_name || user.email}
              </span>
              <button onClick={handleSignOut} style={signOutButtonStyle}>
                Sign out
              </button>
            </div>
          </>
        ) : (
          <a href="/login" style={signInButtonStyle}>
            Sign in
          </a>
        )}
      </nav>
    </header>
  )
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1rem 2rem',
  borderBottom: '1px solid #eee',
}

const logoStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: 700,
  color: '#333',
  textDecoration: 'none',
}

const navStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
}

const linkStyle: React.CSSProperties = {
  color: '#666',
  textDecoration: 'none',
  fontSize: '0.875rem',
}

const userMenuStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
}

const avatarStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: '50%',
}

const signOutButtonStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  fontSize: '0.875rem',
  color: '#666',
  backgroundColor: 'transparent',
  border: '1px solid #ddd',
  borderRadius: '6px',
  cursor: 'pointer',
}

const signInButtonStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  fontSize: '0.875rem',
  color: '#fff',
  backgroundColor: '#333',
  border: 'none',
  borderRadius: '6px',
  textDecoration: 'none',
}
