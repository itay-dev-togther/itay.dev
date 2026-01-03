'use client'

import Link from 'next/link'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
    }}>
      <div style={{
        maxWidth: 400,
        textAlign: 'center',
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '2rem',
        border: '1px solid #e5e7eb',
      }}>
        <div style={{
          width: 48,
          height: 48,
          margin: '0 auto 1rem',
          borderRadius: '50%',
          backgroundColor: '#fef2f2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h2 style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: '#111827',
          marginBottom: '0.5rem',
        }}>
          Something went wrong
        </h2>

        <p style={{
          fontSize: '0.9rem',
          color: '#6b7280',
          marginBottom: '1.5rem',
        }}>
          Failed to load admin content.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{
              padding: '0.6rem 1.2rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#fff',
              backgroundColor: '#6366f1',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>

          <Link
            href="/admin"
            style={{
              padding: '0.6rem 1.2rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#374151',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              textDecoration: 'none',
            }}
          >
            Back to Admin
          </Link>
        </div>
      </div>
    </div>
  )
}
