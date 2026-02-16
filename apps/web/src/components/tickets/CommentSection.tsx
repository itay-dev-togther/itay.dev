'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Comment {
  id: string
  ticket_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  user?: {
    id: string
    name: string | null
    avatar_url: string | null
    github_username: string | null
  }
}

interface CommentSectionProps {
  ticketId: string
  currentUserId: string | null
}

export function CommentSection({ ticketId, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/comments`)
      const data = await res.json()
      if (res.ok) {
        setComments(data.comments)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [ticketId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmit = async () => {
    if (!newComment.trim() || submitting) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setComments(prev => [...prev, data.comment])
        setNewComment('')
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return

    try {
      const res = await fetch(`/api/tickets/${ticketId}/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setComments(prev => prev.map(c => c.id === commentId ? data.comment : c))
        setEditingId(null)
        setEditContent('')
      }
    } catch {
      // silently fail
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/comments/${commentId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId))
      }
    } catch {
      // silently fail
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHr = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHr / 24)

    if (diffMin < 1) return 'just now'
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHr < 24) return `${diffHr}h ago`
    if (diffDay < 7) return `${diffDay}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      padding: '1.5rem',
    }}>
      <h2 style={{
        fontSize: '1rem',
        fontWeight: 600,
        color: '#374151',
        marginBottom: '1rem',
      }}>
        Discussion ({comments.length})
      </h2>

      {loading ? (
        <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1rem' }}>
          No comments yet. Start the discussion!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {comments.map((comment) => {
            const isOwn = currentUserId === comment.user_id
            const isEditing = editingId === comment.id

            return (
              <div key={comment.id} style={{
                display: 'flex',
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
              }}>
                {/* Avatar */}
                {comment.user?.avatar_url ? (
                  <img
                    src={comment.user.avatar_url}
                    alt=""
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#6b7280',
                    flexShrink: 0,
                  }}>
                    {(comment.user?.name?.[0] || '?').toUpperCase()}
                  </div>
                )}

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.25rem',
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>
                      {comment.user?.name || 'Anonymous'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      {formatTime(comment.created_at)}
                    </span>
                    {comment.updated_at !== comment.created_at && (
                      <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontStyle: 'italic' }}>
                        (edited)
                      </span>
                    )}
                  </div>

                  {isEditing ? (
                    <div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          fontSize: '0.875rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          resize: 'vertical',
                          minHeight: '60px',
                          fontFamily: 'inherit',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button
                          onClick={() => handleEdit(comment.id)}
                          style={{
                            padding: '0.3rem 0.75rem',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: '#fff',
                            backgroundColor: '#6366f1',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setEditContent('') }}
                          style={{
                            padding: '0.3rem 0.75rem',
                            fontSize: '0.8rem',
                            color: '#6b7280',
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
                  ) : (
                    <>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#4b5563',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}>
                        {comment.content}
                      </p>

                      {isOwn && (
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.35rem' }}>
                          <button
                            onClick={() => { setEditingId(comment.id); setEditContent(comment.content) }}
                            style={{
                              fontSize: '0.75rem',
                              color: '#6b7280',
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(comment.id)}
                            style={{
                              fontSize: '0.75rem',
                              color: '#dc2626',
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* New Comment Form */}
      {currentUserId ? (
        <div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.875rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              resize: 'vertical',
              minHeight: '80px',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '0.5rem',
          }}>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              Ctrl+Enter to submit
            </span>
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim() || submitting}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#fff',
                backgroundColor: !newComment.trim() || submitting ? '#a5b4fc' : '#6366f1',
                border: 'none',
                borderRadius: '8px',
                cursor: !newComment.trim() || submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Posting...' : 'Comment'}
            </button>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          <Link href="/login" style={{ color: '#6366f1', fontWeight: 600 }}>Sign in</Link> to join the discussion.
        </p>
      )}
    </div>
  )
}
