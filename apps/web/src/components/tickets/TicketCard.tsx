'use client'

import Link from 'next/link'
import type { Ticket } from '@itay-dev/shared'

interface TicketCardProps {
  ticket: Ticket
}

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  available: { bg: '#dcfce7', color: '#166534', label: 'Available' },
  claimed: { bg: '#fef3c7', color: '#92400e', label: 'Claimed' },
  in_review: { bg: '#e0e7ff', color: '#3730a3', label: 'In Review' },
  done: { bg: '#f3f4f6', color: '#6b7280', label: 'Done' },
}

const difficultyConfig: Record<string, { bg: string; color: string }> = {
  beginner: { bg: '#dcfce7', color: '#166534' },
  intermediate: { bg: '#fef3c7', color: '#92400e' },
  advanced: { bg: '#fee2e2', color: '#991b1b' },
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
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = '#a5b4fc'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.1)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = '#e5e7eb'
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <h4 style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: '#111827',
          margin: 0,
          flex: 1,
        }}>
          {ticket.title}
        </h4>
        <span style={{
          padding: '0.25rem 0.6rem',
          fontSize: '0.7rem',
          fontWeight: 600,
          backgroundColor: status.bg,
          color: status.color,
          borderRadius: '9999px',
          marginLeft: '0.75rem',
          whiteSpace: 'nowrap',
        }}>
          {status.label}
        </span>
      </div>

      {/* Description */}
      {ticket.description && (
        <p style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          lineHeight: 1.5,
          marginBottom: '1rem',
        }}>
          {ticket.description.length > 120
            ? ticket.description.slice(0, 120) + '...'
            : ticket.description}
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          padding: '0.25rem 0.6rem',
          fontSize: '0.75rem',
          fontWeight: 500,
          backgroundColor: difficulty.bg,
          color: difficulty.color,
          borderRadius: '6px',
          textTransform: 'capitalize',
        }}>
          {ticket.difficulty}
        </span>

        {isAvailable && (
          <span style={{
            fontSize: '0.8rem',
            color: '#6366f1',
            fontWeight: 500,
          }}>
            View & Claim →
          </span>
        )}

        {ticket.status === 'done' && (
          <span style={{ fontSize: '0.8rem', color: '#10b981' }}>
            ✓ Completed
          </span>
        )}
      </div>
      </div>
    </Link>
  )
}
