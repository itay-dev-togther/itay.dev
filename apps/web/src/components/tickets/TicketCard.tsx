'use client'

import Link from 'next/link'
import type { Ticket } from '@itay-dev/shared'

interface TicketCardProps {
  ticket: Ticket
}

const statusConfig: Record<string, { bg: string; color: string; label: string; icon: React.ReactNode }> = {
  available: {
    bg: '#dcfce7',
    color: '#166534',
    label: 'Available',
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  claimed: {
    bg: '#fef3c7',
    color: '#92400e',
    label: 'Claimed',
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </svg>
    ),
  },
  in_review: {
    bg: '#e0e7ff',
    color: '#3730a3',
    label: 'In Review',
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  done: {
    bg: '#f3f4f6',
    color: '#6b7280',
    label: 'Done',
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
}

const difficultyConfig: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  beginner: {
    bg: '#dcfce7',
    color: '#166534',
    icon: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  intermediate: {
    bg: '#fef3c7',
    color: '#92400e',
    icon: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="12" r="3" />
      </svg>
    ),
  },
  advanced: {
    bg: '#fee2e2',
    color: '#991b1b',
    icon: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="6" cy="12" r="3" />
        <circle cx="12" cy="12" r="3" />
        <circle cx="18" cy="12" r="3" />
      </svg>
    ),
  },
}

export function TicketCard({ ticket }: TicketCardProps) {
  const status = statusConfig[ticket.status] || statusConfig.available
  const difficulty = difficultyConfig[ticket.difficulty] || difficultyConfig.beginner
  const isAvailable = ticket.status === 'available'

  return (
    <Link href={`/tickets/${ticket.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          padding: '1.25rem',
          backgroundColor: '#fff',
          border: isAvailable ? '1px solid #c7d2fe' : '1px solid #e5e7eb',
          borderRadius: '14px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = '#a5b4fc'
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(99, 102, 241, 0.12)'
          e.currentTarget.style.transform = 'translateY(-3px)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = isAvailable ? '#c7d2fe' : '#e5e7eb'
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        {/* Available indicator */}
        {isAvailable && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 4,
            height: '100%',
            background: 'linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%)',
          }} />
        )}

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '0.75rem',
          gap: '0.75rem',
        }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: '#111827',
            margin: 0,
            flex: 1,
            lineHeight: 1.4,
          }}>
            {ticket.title}
          </h4>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.3rem 0.6rem',
            fontSize: '0.7rem',
            fontWeight: 600,
            backgroundColor: status.bg,
            color: status.color,
            borderRadius: '9999px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            {status.icon}
            {status.label}
          </span>
        </div>

        {/* Description */}
        {ticket.description && (
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            lineHeight: 1.55,
            marginBottom: '1rem',
          }}>
            {ticket.description.length > 110
              ? ticket.description.slice(0, 110) + '...'
              : ticket.description}
          </p>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 0.65rem',
            fontSize: '0.75rem',
            fontWeight: 500,
            backgroundColor: difficulty.bg,
            color: difficulty.color,
            borderRadius: '8px',
            textTransform: 'capitalize',
          }}>
            {difficulty.icon}
            {ticket.difficulty}
          </span>

          {isAvailable && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.8rem',
              color: '#6366f1',
              fontWeight: 600,
            }}>
              Claim
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          )}

          {ticket.status === 'done' && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.8rem',
              color: '#10b981',
              fontWeight: 500,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Completed
            </span>
          )}

          {(ticket.status === 'claimed' || ticket.status === 'in_review') && (
            <span style={{
              fontSize: '0.8rem',
              color: '#9ca3af',
              fontWeight: 500,
            }}>
              View Progress
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
