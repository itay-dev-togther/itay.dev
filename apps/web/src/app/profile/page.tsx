import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { GitHubUsernameField } from '@/components/profile/GitHubUsernameField'

interface Contribution {
  id: string
  pr_url: string
  pr_number: number
  merged_at: string
  lines_added: number
  lines_removed: number
  created_at: string
  ticket: {
    id: string
    title: string
  } | null
  project: {
    id: string
    name: string
  } | null
}

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

  // Get user's contributions with ticket and project info
  const { data: contributions } = await supabase
    .schema('itay')
    .from('contributions')
    .select(`
      id,
      pr_url,
      pr_number,
      merged_at,
      lines_added,
      lines_removed,
      created_at,
      ticket:tickets(id, title),
      project:projects(id, name)
    `)
    .eq('user_id', user.id)
    .order('merged_at', { ascending: false })

  const typedContributions = (contributions || []) as unknown as Contribution[]

  // Calculate stats
  const stats = {
    totalPRs: typedContributions.length,
    totalLinesAdded: typedContributions.reduce((sum, c) => sum + (c.lines_added || 0), 0),
    totalLinesRemoved: typedContributions.reduce((sum, c) => sum + (c.lines_removed || 0), 0),
    projectsContributed: new Set(typedContributions.map(c => c.project?.id).filter(Boolean)).size,
  }

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      {/* Header */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '3rem 2rem',
        color: '#fff',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            gap: '2rem',
            alignItems: 'center',
          }}>
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt={profile?.name || 'Profile'}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  border: '4px solid rgba(255,255,255,0.3)',
                }}
              />
            ) : (
              <div style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: 600,
                border: '4px solid rgba(255,255,255,0.3)',
              }}>
                {(profile?.name?.[0] || user.email?.[0] || '?').toUpperCase()}
              </div>
            )}

            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {profile?.name || 'Anonymous'}
              </h1>
              <p style={{ opacity: 0.8, marginBottom: '0.5rem' }}>
                {user.email}
              </p>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                  Member since {memberSince}
                </span>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '9999px',
                }}>
                  {profile?.role || 'contributor'}
                </span>
              </div>
              <GitHubUsernameField initialUsername={profile?.github_username || null} />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 2rem' }}>
        <div className="stats-grid" style={{
          display: 'grid',
          gap: '1rem',
          marginTop: '-2rem',
        }}>
          <style>{`
            .stats-grid {
              grid-template-columns: repeat(4, 1fr);
            }
            @media (max-width: 768px) {
              .stats-grid {
                grid-template-columns: repeat(2, 1fr);
              }
            }
          `}</style>
          {[
            { label: 'PRs Merged', value: stats.totalPRs, icon: '🎯' },
            { label: 'Lines Added', value: `+${stats.totalLinesAdded.toLocaleString()}`, icon: '📈' },
            { label: 'Lines Removed', value: `-${stats.totalLinesRemoved.toLocaleString()}`, icon: '📉' },
            { label: 'Projects', value: stats.projectsContributed, icon: '📁' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '1.25rem',
                textAlign: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{stat.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contributions */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: '#111827' }}>
          Contribution History
        </h2>

        {typedContributions.length === 0 ? (
          <div style={{
            padding: '3rem 2rem',
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>
              No contributions yet
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Start by claiming a ticket from a project and submitting a PR!
            </p>
            <Link
              href="/projects"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6366f1',
                color: '#fff',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              Browse Projects
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {typedContributions.map((contribution) => (
              <div
                key={contribution.id}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  padding: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>✅</span>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>
                      {contribution.ticket?.title || 'Unknown ticket'}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    {contribution.project && (
                      <Link
                        href={`/projects/${contribution.project.id}`}
                        style={{ color: '#6366f1', textDecoration: 'none' }}
                      >
                        {contribution.project.name}
                      </Link>
                    )}
                    <span>
                      PR #{contribution.pr_number}
                    </span>
                    <span>
                      {new Date(contribution.merged_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#22c55e', fontWeight: 600, fontSize: '0.875rem' }}>
                      +{contribution.lines_added}
                    </span>
                    <span style={{ color: '#6b7280', margin: '0 0.25rem' }}>/</span>
                    <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.875rem' }}>
                      -{contribution.lines_removed}
                    </span>
                  </div>
                  <a
                    href={contribution.pr_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    View PR →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
