import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Ticket, Project, Contribution } from '@itay-dev/shared'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .schema('itay')
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user's claimed/in-progress tickets
  const { data: activeTickets } = await supabase
    .schema('itay')
    .from('tickets')
    .select('*, projects(*)')
    .eq('claimed_by', user.id)
    .in('status', ['claimed', 'in_review'])
    .order('claimed_at', { ascending: false })

  // Get user's completed contributions
  const { data: contributions } = await supabase
    .schema('itay')
    .from('contributions')
    .select('*, tickets(*), projects(*)')
    .eq('user_id', user.id)
    .order('merged_at', { ascending: false })

  const typedActiveTickets = (activeTickets || []) as (Ticket & { projects: Project })[]
  const typedContributions = (contributions || []) as (Contribution & { tickets: Ticket; projects: Project })[]

  const totalLinesAdded = typedContributions.reduce((sum, c) => sum + (c.lines_added || 0), 0)
  const totalLinesRemoved = typedContributions.reduce((sum, c) => sum + (c.lines_removed || 0), 0)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      {/* Header */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '3rem 2rem',
        color: '#fff',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
          }}>
            Welcome back{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}!
          </h1>
          <p style={{ fontSize: '1rem', opacity: 0.9 }}>
            Track your contributions and manage your claimed tickets.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '2.5rem', marginTop: '2rem' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{typedActiveTickets.length}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>In Progress</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{typedContributions.length}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Contributions</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>+{totalLinesAdded.toLocaleString()}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Lines Added</div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '2.5rem 2rem' }}>
        {/* Active Tickets */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#111827',
            }}>
              Your Active Tickets
            </h2>
            <Link
              href="/projects"
              style={{
                fontSize: '0.9rem',
                color: '#6366f1',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Find more tickets →
            </Link>
          </div>

          {typedActiveTickets.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {typedActiveTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/tickets/${ticket.id}`}
                  style={{
                    textDecoration: 'none',
                    display: 'block',
                    padding: '1.25rem',
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          backgroundColor: ticket.status === 'in_review' ? '#e0e7ff' : '#fef3c7',
                          color: ticket.status === 'in_review' ? '#3730a3' : '#92400e',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                        }}>
                          {ticket.status === 'in_review' ? 'In Review' : 'Claimed'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                          {ticket.projects?.name}
                        </span>
                      </div>
                      <h3 style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#111827',
                        margin: 0,
                      }}>
                        {ticket.title}
                      </h3>
                      {ticket.branch_name && (
                        <p style={{
                          fontSize: '0.8rem',
                          color: '#9ca3af',
                          marginTop: '0.5rem',
                          fontFamily: 'monospace',
                        }}>
                          {ticket.branch_name}
                        </p>
                      )}
                    </div>
                    <span style={{ color: '#6366f1', fontSize: '0.9rem' }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '3rem 2rem',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              textAlign: 'center',
            }}>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                You haven&apos;t claimed any tickets yet.
              </p>
              <Link
                href="/projects"
                style={{
                  display: 'inline-block',
                  padding: '0.6rem 1.2rem',
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
          )}
        </div>

        {/* Contributions */}
        <div>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#111827',
            marginBottom: '1.25rem',
          }}>
            Your Contributions
          </h2>

          {typedContributions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {typedContributions.map((contribution) => (
                <div
                  key={contribution.id}
                  style={{
                    padding: '1rem 1.25rem',
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: '#10b981', fontSize: '0.9rem' }}>✓</span>
                      <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                        {contribution.projects?.name}
                      </span>
                    </div>
                    <h4 style={{
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      color: '#374151',
                      margin: 0,
                    }}>
                      {contribution.tickets?.title}
                    </h4>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      <span style={{ color: '#10b981' }}>+{contribution.lines_added}</span>
                      {' / '}
                      <span style={{ color: '#ef4444' }}>-{contribution.lines_removed}</span>
                    </div>
                    {contribution.pr_url && (
                      <a
                        href={contribution.pr_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.75rem',
                          color: '#6366f1',
                          textDecoration: 'none',
                        }}
                      >
                        PR #{contribution.pr_number}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '2.5rem 2rem',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              textAlign: 'center',
              color: '#6b7280',
            }}>
              <p>Complete a ticket to see your contributions here!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
