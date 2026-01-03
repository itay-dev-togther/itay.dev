'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      difficulty: formData.get('difficulty') as string,
      tech_stack: (formData.get('tech_stack') as string).split(',').map(s => s.trim()).filter(Boolean),
      status: formData.get('status') as string,
    }

    try {
      const response = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to create project')
      }

      router.push('/admin/projects')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>
        New Project
      </h1>

      <form onSubmit={handleSubmit}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '1.5rem',
        }}>
          <FormField label="Project Name" required>
            <input
              type="text"
              name="name"
              required
              style={inputStyle}
              placeholder="My Awesome Project"
            />
          </FormField>

          <FormField label="Description">
            <textarea
              name="description"
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="What is this project about?"
            />
          </FormField>

          <FormField label="Difficulty" required>
            <select name="difficulty" required style={inputStyle}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </FormField>

          <FormField label="Tech Stack" hint="Comma-separated (e.g., React, TypeScript, Node.js)">
            <input
              type="text"
              name="tech_stack"
              style={inputStyle}
              placeholder="React, TypeScript, Supabase"
            />
          </FormField>

          <FormField label="Status" required>
            <select name="status" required style={inputStyle}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </FormField>

          {error && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.9rem',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: loading ? '#a5b4fc' : '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#fff',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{
        display: 'block',
        fontSize: '0.9rem',
        fontWeight: 500,
        color: '#374151',
        marginBottom: '0.5rem',
      }}>
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
      </label>
      {children}
      {hint && (
        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
          {hint}
        </p>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  fontSize: '0.95rem',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  backgroundColor: '#fff',
}
