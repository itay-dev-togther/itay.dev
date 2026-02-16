'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import Link from 'next/link'

interface ClaimButtonProps {
  ticketId: string
}

export function ClaimButton({ ticketId }: ClaimButtonProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsGithub, setNeedsGithub] = useState(false)

  const handleClaim = async () => {
    setLoading(true)
    setError(null)
    setNeedsGithub(false)

    try {
      const response = await fetch('/api/tickets/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticket_id: ticketId }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.redirect) {
          setNeedsGithub(true)
          return
        }
        throw new Error(data.error || 'Failed to claim ticket')
      }

      // Show success toast
      showToast('Ticket claimed! Check your instructions below.', 'success')

      // Refresh the page to show updated status
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleClaim}
        disabled={loading}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          fontSize: '0.9rem',
          fontWeight: 600,
          color: '#fff',
          backgroundColor: loading ? '#a5b4fc' : '#6366f1',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseOver={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = '#4f46e5'
        }}
        onMouseOut={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = '#6366f1'
        }}
      >
        {loading ? 'Claiming...' : 'Claim This Ticket'}
      </button>
      {needsGithub && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: '#92400e',
        }}>
          Please set your GitHub username first.{' '}
          <Link href="/profile" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'underline' }}>
            Go to Profile Settings
          </Link>
        </div>
      )}
      {error && (
        <p style={{
          marginTop: '0.75rem',
          fontSize: '0.85rem',
          color: '#dc2626',
        }}>
          {error}
        </p>
      )}
    </div>
  )
}
