'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fafafa',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: 500,
        textAlign: 'center',
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '3rem 2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
      }}>
        <div style={{
          width: 64,
          height: 64,
          margin: '0 auto 1.5rem',
          borderRadius: '50%',
          backgroundColor: '#fef2f2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#111827',
          marginBottom: '0.75rem',
        }}>
          Something went wrong
        </h1>

        <p style={{
          fontSize: '1rem',
          color: '#6b7280',
          marginBottom: '2rem',
          lineHeight: 1.6,
        }}>
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#fff',
              backgroundColor: '#6366f1',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>

          <a
            href="/"
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#374151',
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              textDecoration: 'none',
            }}
          >
            Go Home
          </a>
        </div>

        {error.digest && (
          <p style={{
            marginTop: '2rem',
            fontSize: '0.75rem',
            color: '#9ca3af',
          }}>
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
