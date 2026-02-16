'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'

interface ClaimedTicketInstructionsProps {
  branchName: string
  repoUrl: string // e.g., "https://github.com/org/repo"
  isOwner: boolean // whether current user is the assignee
  ticketId: string
  ticketStatus: string
}

export function ClaimedTicketInstructions({
  branchName,
  repoUrl,
  isOwner,
  ticketId,
  ticketStatus,
}: ClaimedTicketInstructionsProps) {
  const { showToast } = useToast()
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)
  const [releasing, setReleasing] = useState(false)

  // Convert GitHub URL to various formats
  const repoPath = repoUrl.replace('https://github.com/', '')
  const gitCloneUrl = `${repoUrl}.git`
  const githubDevUrl = `https://github.dev/${repoPath}/tree/${branchName}`
  const vscodeCloneUrl = `vscode://vscode.git/clone?url=${encodeURIComponent(gitCloneUrl)}`

  const cloneCommand = `git clone -b ${branchName} ${gitCloneUrl}`
  const checkoutCommand = `git fetch origin && git checkout ${branchName}`

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCommand(label)
      showToast('Copied to clipboard!', 'success')
      setTimeout(() => setCopiedCommand(null), 2000)
    } catch {
      showToast('Failed to copy', 'error')
    }
  }

  if (!isOwner) {
    // Just show basic info for non-owners
    return (
      <div>
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
        <p style={{
          fontSize: '0.8rem',
          color: '#9ca3af',
          marginTop: '0.75rem',
          fontFamily: 'monospace',
        }}>
          Branch: {branchName}
        </p>
      </div>
    )
  }

  return (
    <div>
      <h3 style={{
        fontSize: '1rem',
        fontWeight: 600,
        color: '#166534',
        marginBottom: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        You claimed this ticket!
      </h3>

      <p style={{
        fontSize: '0.875rem',
        color: '#6b7280',
        marginBottom: '1.25rem',
        lineHeight: 1.5,
      }}>
        A branch has been created for you. Get started:
      </p>

      {/* Quick Actions */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.25rem',
      }}>
        <a
          href={githubDevUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            padding: '0.6rem 0.75rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#fff',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            border: 'none',
            borderRadius: '8px',
            textDecoration: 'none',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          GitHub.dev
        </a>
        <a
          href={vscodeCloneUrl}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            padding: '0.6rem 0.75rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#0078d4',
            backgroundColor: '#e7f3ff',
            border: '1px solid #b3d7ff',
            borderRadius: '8px',
            textDecoration: 'none',
            transition: 'background-color 0.15s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#d0e8ff'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#e7f3ff'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.584 2.2 10.4 9.094l-4.23-3.238L2 7.396l4.476 4.603L2 16.605l4.17 1.537 4.231-3.238 7.183 6.895L22 19.396V4.6l-4.416-2.4zM6.173 7.396l2.64 2.603-2.64 2.604v-5.207zm11.41 9.206-5.167-4.603 5.167-4.603v9.206z"/>
          </svg>
          VS Code
        </a>
      </div>

      {/* Branch Info */}
      <div style={{
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        padding: '0.875rem',
        marginBottom: '0.75rem',
      }}>
        <div style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          color: '#9ca3af',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.4rem',
        }}>
          Your Branch
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <code style={{
            fontSize: '0.8rem',
            color: '#374151',
            fontFamily: 'monospace',
          }}>
            {branchName}
          </code>
          <button
            onClick={() => copyToClipboard(branchName, 'branch')}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.25rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: copiedCommand === 'branch' ? '#166534' : '#9ca3af',
              transition: 'color 0.15s',
            }}
          >
            {copiedCommand === 'branch' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Clone Command */}
      <div style={{
        backgroundColor: '#1f2937',
        borderRadius: '8px',
        padding: '0.875rem',
        marginBottom: '0.75rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}>
          <div>
            <div style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.4rem',
            }}>
              Clone
            </div>
            <code style={{
              fontSize: '0.75rem',
              color: '#e5e7eb',
              fontFamily: 'monospace',
              wordBreak: 'break-all',
            }}>
              {cloneCommand}
            </code>
          </div>
          <button
            onClick={() => copyToClipboard(cloneCommand, 'clone')}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.35rem',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              color: copiedCommand === 'clone' ? '#86efac' : '#9ca3af',
              transition: 'color 0.15s, background-color 0.15s',
              flexShrink: 0,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
            }}
          >
            {copiedCommand === 'clone' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Checkout Command (if already cloned) */}
      <details style={{ fontSize: '0.8rem' }}>
        <summary style={{
          color: '#6b7280',
          cursor: 'pointer',
          padding: '0.25rem 0',
        }}>
          Already cloned the repo?
        </summary>
        <div style={{
          backgroundColor: '#1f2937',
          borderRadius: '8px',
          padding: '0.75rem',
          marginTop: '0.5rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}>
            <code style={{
              fontSize: '0.75rem',
              color: '#e5e7eb',
              fontFamily: 'monospace',
              wordBreak: 'break-all',
            }}>
              {checkoutCommand}
            </code>
            <button
              onClick={() => copyToClipboard(checkoutCommand, 'checkout')}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.35rem',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                color: copiedCommand === 'checkout' ? '#86efac' : '#9ca3af',
                flexShrink: 0,
              }}
            >
              {copiedCommand === 'checkout' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </details>

      {/* Release Ticket */}
      {ticketStatus === 'claimed' && (
        <ReleaseButton ticketId={ticketId} releasing={releasing} setReleasing={setReleasing} showToast={showToast} />
      )}
    </div>
  )
}

function ReleaseButton({
  ticketId,
  releasing,
  setReleasing,
  showToast,
}: {
  ticketId: string
  releasing: boolean
  setReleasing: (v: boolean) => void
  showToast: (msg: string, type: 'success' | 'error') => void
}) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)

  const handleRelease = async () => {
    setReleasing(true)
    try {
      const res = await fetch('/api/tickets/unclaim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: ticketId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to release')
      showToast('Ticket released successfully', 'success')
      router.refresh()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to release', 'error')
    } finally {
      setReleasing(false)
      setConfirming(false)
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        style={{
          marginTop: '1.25rem',
          width: '100%',
          padding: '0.5rem',
          fontSize: '0.8rem',
          color: '#6b7280',
          backgroundColor: 'transparent',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        Release this ticket
      </button>
    )
  }

  return (
    <div style={{
      marginTop: '1.25rem',
      padding: '0.75rem',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
    }}>
      <p style={{ fontSize: '0.8rem', color: '#991b1b', marginBottom: '0.5rem' }}>
        Release this ticket back to available?
      </p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={handleRelease}
          disabled={releasing}
          style={{
            flex: 1,
            padding: '0.4rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#fff',
            backgroundColor: '#dc2626',
            border: 'none',
            borderRadius: '6px',
            cursor: releasing ? 'not-allowed' : 'pointer',
          }}
        >
          {releasing ? 'Releasing...' : 'Yes, release'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          style={{
            flex: 1,
            padding: '0.4rem',
            fontSize: '0.8rem',
            color: '#374151',
            backgroundColor: '#f3f4f6',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
