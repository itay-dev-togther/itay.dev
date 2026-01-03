import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/profile')
  }

  // Get user profile from itay schema
  const { data: profile } = await supabase
    .schema('itay')
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown'

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>Your Profile</h1>

      <div style={{
        display: 'flex',
        gap: '2rem',
        alignItems: 'flex-start',
        marginBottom: '3rem',
      }}>
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt={profile?.name || 'Profile'}
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
            }}
          />
        ) : (
          <div style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            backgroundColor: '#eee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            color: '#999',
          }}>
            {(profile?.name?.[0] || user.email?.[0] || '?').toUpperCase()}
          </div>
        )}

        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            {profile?.name || 'Anonymous'}
          </h2>
          <p style={{ color: '#666', marginBottom: '0.25rem' }}>
            {user.email}
          </p>
          <p style={{ color: '#999', fontSize: '0.875rem' }}>
            Member since {memberSince}
          </p>
          <span style={{
            display: 'inline-block',
            marginTop: '0.75rem',
            padding: '0.25rem 0.75rem',
            fontSize: '0.75rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            backgroundColor: profile?.role === 'admin' ? '#fef3c7' : '#e0e7ff',
            color: profile?.role === 'admin' ? '#92400e' : '#3730a3',
            borderRadius: '9999px',
          }}>
            {profile?.role || 'contributor'}
          </span>
        </div>
      </div>

      <div style={{
        padding: '2rem',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
      }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
          Contributions
        </h3>
        <p style={{ color: '#666' }}>
          No contributions yet. Start by claiming a ticket from a project!
        </p>
        <a
          href="/projects"
          style={{
            display: 'inline-block',
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#333',
            color: '#fff',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '0.875rem',
          }}
        >
          Browse Projects
        </a>
      </div>
    </div>
  )
}
