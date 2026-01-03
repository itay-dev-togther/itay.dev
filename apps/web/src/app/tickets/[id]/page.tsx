import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Ticket, Project } from '@itay-dev/shared'
import { ClaimButton } from '@/components/tickets/ClaimButton'

interface TicketDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch ticket with project
  const { data: ticket, error: ticketError } = await supabase
    .schema('itay')
    .from('tickets')
    .select('*')
    .eq('id', id)
    .single()

  if (ticketError || !ticket) {
    notFound()
  }

  // Fetch project
  const { data: project } = await supabase
    .schema('itay')
    .from('projects')
    .select('*')
    .eq('id', ticket.project_id)
    .single()

  const typedTicket = ticket as Ticket
  const typedProject = project as Project | null

  const statusConfig: Record<string, { bg: string; color: string; label: string; description: string }> = {
    available: { bg: '#dcfce7', color: '#166534', label: 'Available', description: 'This ticket is open for contribution' },
    claimed: { bg: '#fef3c7', color: '#92400e', label: 'Claimed', description: 'Someone is working on this' },
    in_review: { bg: '#e0e7ff', color: '#3730a3', label: 'In Review', description: 'PR submitted, awaiting review' },
    done: { bg: '#f3f4f6', color: '#6b7280', label: 'Done', description: 'This ticket has been completed' },
  }

  const difficultyConfig: Record<string, { bg: string; color: string; label: string; estimate: string }> = {
    beginner: { bg: '#dcfce7', color: '#166534', label: 'Beginner', estimate: '1-2 hours' },
    intermediate: { bg: '#fef3c7', color: '#92400e', label: 'Intermediate', estimate: '2-4 hours' },
    advanced: { bg: '#fee2e2', color: '#991b1b', label: 'Advanced', estimate: '4+ hours' },
  }

  const status = statusConfig[typedTicket.status] || statusConfig.available
  const difficulty = difficultyConfig[typedTicket.difficulty] || difficultyConfig.beginner

  const isAvailable = typedTicket.status === 'available'
  const isLoggedIn = !!user

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      {/* Header */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2.5rem 2rem',
        color: '#fff',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            <Link href="/projects" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
              Projects
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>/</span>
            {typedProject && (
              <>
                <Link
                  href={`/projects/${typedProject.id}`}
                  style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
                >
                  {typedProject.name}
                </Link>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>/</span>
              </>
            )}
            <span style={{ color: '#fff' }}>Ticket</span>
          </div>

          {/* Status & Difficulty badges */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{
              padding: '0.35rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              backgroundColor: status.bg,
              color: status.color,
              borderRadius: '9999px',
            }}>
              {status.label}
            </span>
            <span style={{
              padding: '0.35rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              backgroundColor: difficulty.bg,
              color: difficulty.color,
              borderRadius: '9999px',
            }}>
              {difficulty.label} · ~{difficulty.estimate}
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            lineHeight: 1.3,
            marginBottom: '0.5rem',
          }}>
            {typedTicket.title}
          </h1>

          <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            {status.description}
          </p>
        </div>
      </section>

      {/* Content */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
          {/* Main Content */}
          <div>
            {/* Description */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              padding: '1.5rem',
              marginBottom: '1.5rem',
            }}>
              <h2 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '1rem',
              }}>
                Description
              </h2>
              <p style={{
                fontSize: '0.95rem',
                color: '#4b5563',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}>
                {typedTicket.description || 'No description provided.'}
              </p>
            </div>

            {/* Acceptance Criteria */}
            {typedTicket.acceptance_criteria && (
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                padding: '1.5rem',
                marginBottom: '1.5rem',
              }}>
                <h2 style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '1rem',
                }}>
                  Acceptance Criteria
                </h2>
                <div style={{
                  fontSize: '0.95rem',
                  color: '#4b5563',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                }}>
                  {typedTicket.acceptance_criteria}
                </div>
              </div>
            )}

            {/* PR Link if exists */}
            {typedTicket.pr_url && (
              <div style={{
                backgroundColor: '#f0fdf4',
                borderRadius: '12px',
                border: '1px solid #bbf7d0',
                padding: '1.5rem',
              }}>
                <h2 style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#166534',
                  marginBottom: '0.75rem',
                }}>
                  Pull Request
                </h2>
                <a
                  href={typedTicket.pr_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#166534',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  PR #{typedTicket.pr_number} →
                </a>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Claim Card */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              padding: '1.5rem',
              marginBottom: '1.5rem',
            }}>
              {isAvailable ? (
                <>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#111827',
                    marginBottom: '0.75rem',
                  }}>
                    Ready to contribute?
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    marginBottom: '1rem',
                    lineHeight: 1.5,
                  }}>
                    Claim this ticket to start working on it. You&apos;ll get a dedicated branch.
                  </p>
                  {isLoggedIn ? (
                    <ClaimButton ticketId={typedTicket.id} />
                  ) : (
                    <Link
                      href="/login"
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '0.75rem 1rem',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#fff',
                        backgroundColor: '#6366f1',
                        border: 'none',
                        borderRadius: '8px',
                        textAlign: 'center',
                        textDecoration: 'none',
                      }}
                    >
                      Sign in to Claim
                    </Link>
                  )}
                </>
              ) : typedTicket.status === 'claimed' || typedTicket.status === 'in_review' ? (
                <>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#92400e',
                    marginBottom: '0.5rem',
                  }}>
                    In Progress
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    lineHeight: 1.5,
                  }}>
                    This ticket is currently being worked on.
                  </p>
                  {typedTicket.branch_name && (
                    <p style={{
                      fontSize: '0.8rem',
                      color: '#9ca3af',
                      marginTop: '0.75rem',
                      fontFamily: 'monospace',
                    }}>
                      Branch: {typedTicket.branch_name}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#166534',
                    marginBottom: '0.5rem',
                  }}>
                    Completed
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    lineHeight: 1.5,
                  }}>
                    This ticket has been successfully completed and merged.
                  </p>
                </>
              )}
            </div>

            {/* Project Info */}
            {typedProject && (
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                padding: '1.5rem',
              }}>
                <h3 style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.75rem',
                }}>
                  Project
                </h3>
                <Link
                  href={`/projects/${typedProject.id}`}
                  style={{
                    display: 'block',
                    color: '#111827',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  {typedProject.name}
                </Link>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {typedProject.tech_stack.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '4px',
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
