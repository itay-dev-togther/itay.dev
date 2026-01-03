import { createClient } from '@/lib/supabase/server'
import { TicketCard } from '@/components/tickets/TicketCard'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Project, Ticket } from '@itay-dev/shared'

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch project
  const { data: project, error: projectError } = await supabase
    .schema('itay')
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (projectError || !project) {
    notFound()
  }

  // Fetch tickets for this project
  const { data: tickets, error: ticketsError } = await supabase
    .schema('itay')
    .from('tickets')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: true })

  if (ticketsError) {
    console.error('Error fetching tickets:', ticketsError)
  }

  const typedProject = project as Project
  const typedTickets = (tickets || []) as Ticket[]

  // Group tickets by status
  const availableTickets = typedTickets.filter(t => t.status === 'available')
  const claimedTickets = typedTickets.filter(t => t.status === 'claimed')
  const inReviewTickets = typedTickets.filter(t => t.status === 'in_review')
  const doneTickets = typedTickets.filter(t => t.status === 'done')

  const difficultyConfig: Record<string, { bg: string; color: string; label: string }> = {
    beginner: { bg: '#dcfce7', color: '#166534', label: 'Beginner Friendly' },
    intermediate: { bg: '#fef3c7', color: '#92400e', label: 'Intermediate' },
    advanced: { bg: '#fee2e2', color: '#991b1b', label: 'Advanced' },
  }

  const difficulty = difficultyConfig[typedProject.difficulty] || difficultyConfig.beginner

  const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
    active: { bg: '#dcfce7', color: '#166534', label: 'Active' },
    completed: { bg: '#e0e7ff', color: '#3730a3', label: 'Completed' },
    paused: { bg: '#f3f4f6', color: '#6b7280', label: 'Paused' },
    draft: { bg: '#fef3c7', color: '#92400e', label: 'Draft' },
  }

  const status = statusConfig[typedProject.status] || statusConfig.active

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      {/* Header */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '3rem 2rem',
        color: '#fff',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <Link
            href="/projects"
            style={{
              color: 'rgba(255,255,255,0.8)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
            }}
          >
            ← Back to Projects
          </Link>

          {/* Status & Difficulty badges */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{
              padding: '0.35rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              borderRadius: '9999px',
            }}>
              {status.label}
            </span>
            <span style={{
              padding: '0.35rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              borderRadius: '9999px',
            }}>
              {difficulty.label}
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            marginBottom: '1rem',
            lineHeight: 1.2,
          }}>
            {typedProject.name}
          </h1>

          {/* Description */}
          {typedProject.description && (
            <p style={{
              fontSize: '1.125rem',
              opacity: 0.9,
              maxWidth: 800,
              lineHeight: 1.6,
              marginBottom: '1.5rem',
            }}>
              {typedProject.description}
            </p>
          )}

          {/* Tech Stack */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {typedProject.tech_stack.map((tech) => (
              <span
                key={tech}
                style={{
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.85rem',
                  color: '#fff',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  fontWeight: 500,
                }}
              >
                {tech}
              </span>
            ))}
          </div>

          {/* GitHub Link */}
          {typedProject.github_repo_url && (
            <a
              href={typedProject.github_repo_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.2rem',
                backgroundColor: '#fff',
                color: '#111827',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View on GitHub
            </a>
          )}

          {/* Stats */}
          <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{availableTickets.length}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Available</div>
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{claimedTickets.length + inReviewTickets.length}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>In Progress</div>
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{doneTickets.length}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Completed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tickets Section */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 2rem' }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          color: '#111827',
          marginBottom: '2rem',
        }}>
          Tickets
        </h2>

        {/* Available Tickets */}
        {availableTickets.length > 0 && (
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#166534',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#22c55e',
                borderRadius: '50%',
              }} />
              Available ({availableTickets.length})
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1rem',
            }}>
              {availableTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          </div>
        )}

        {/* Claimed / In Progress Tickets */}
        {(claimedTickets.length > 0 || inReviewTickets.length > 0) && (
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#92400e',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#f59e0b',
                borderRadius: '50%',
              }} />
              In Progress ({claimedTickets.length + inReviewTickets.length})
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1rem',
            }}>
              {[...claimedTickets, ...inReviewTickets].map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          </div>
        )}

        {/* Done Tickets */}
        {doneTickets.length > 0 && (
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#6b7280',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#9ca3af',
                borderRadius: '50%',
              }} />
              Completed ({doneTickets.length})
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1rem',
            }}>
              {doneTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          </div>
        )}

        {/* No tickets */}
        {typedTickets.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            color: '#6b7280',
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
          }}>
            <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
              No tickets available yet.
            </p>
            <p>Check back soon for new contribution opportunities!</p>
          </div>
        )}
      </section>
    </div>
  )
}
