'use client'

import { useState } from 'react'

interface GitHubUsernameFieldProps {
  initialUsername: string | null
}

export function GitHubUsernameField({ initialUsername }: GitHubUsernameFieldProps) {
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState(initialUsername || '')
  const [savedUsername, setSavedUsername] = useState(initialUsername)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validate = (value: string): string | null => {
    if (!value) return null // empty is ok, clears the field
    if (value.length > 39) return 'GitHub username must be 39 characters or less'
    if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(value)) {
      return 'Invalid format. Use letters, numbers, and hyphens only.'
    }
    return null
  }

  const handleSave = async () => {
    const trimmed = username.trim()
    const validationError = validate(trimmed)
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ github_username: trimmed || null }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update')
      }

      setSavedUsername(trimmed || null)
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setUsername(savedUsername || '')
    setError(null)
    setEditing(false)
  }

  if (!editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
        <span style={{ fontSize: '0.875rem', opacity: 0.8 }}>
          GitHub: {savedUsername ? (
            <a
              href={`https://github.com/${savedUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#fff', textDecoration: 'underline' }}
            >
              @{savedUsername}
            </a>
          ) : (
            <span style={{ fontStyle: 'italic', opacity: 0.6 }}>Not set</span>
          )}
        </span>
        <button
          onClick={() => setEditing(true)}
          style={{
            padding: '0.2rem 0.6rem',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: '#fff',
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {savedUsername ? 'Edit' : 'Add'}
        </button>
      </div>
    )
  }

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.875rem', opacity: 0.8 }}>GitHub:</span>
        <input
          type="text"
          value={username}
          onChange={(e) => { setUsername(e.target.value); setError(null) }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel() }}
          placeholder="your-github-username"
          autoFocus
          style={{
            padding: '0.3rem 0.6rem',
            fontSize: '0.85rem',
            backgroundColor: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.4)',
            borderRadius: '4px',
            color: '#fff',
            outline: 'none',
            width: '180px',
          }}
        />
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '0.3rem 0.6rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#16a34a',
            backgroundColor: 'rgba(255,255,255,0.9)',
            border: 'none',
            borderRadius: '4px',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? '...' : 'Save'}
        </button>
        <button
          onClick={handleCancel}
          style={{
            padding: '0.3rem 0.6rem',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: '#fff',
            backgroundColor: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
      {error && (
        <p style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '0.25rem' }}>{error}</p>
      )}
    </div>
  )
}
