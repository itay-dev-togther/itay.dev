'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface TicketTemplate {
  title: string
  description: string
  acceptance_criteria: string
  difficulty: string
}

export default function NewTemplatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState('beginner')
  const [techStack, setTechStack] = useState('')
  const [tickets, setTickets] = useState<TicketTemplate[]>([])

  const addTicket = () => {
    setTickets([...tickets, {
      title: '',
      description: '',
      acceptance_criteria: '',
      difficulty: 'beginner',
    }])
  }

  const updateTicket = (index: number, field: keyof TicketTemplate, value: string) => {
    const updated = [...tickets]
    updated[index] = { ...updated[index], [field]: value }
    setTickets(updated)
  }

  const removeTicket = (index: number) => {
    setTickets(tickets.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          difficulty,
          tech_stack: techStack.split(',').map(s => s.trim()).filter(Boolean),
          default_tickets: tickets.filter(t => t.title.trim()),
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to create template')
      }

      router.push('/admin/templates')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '0.5rem' }}>
        <Link
          href="/admin/templates"
          style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.85rem' }}
        >
          ← Back to Templates
        </Link>
      </div>

      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>
        New Template
      </h1>

      <form onSubmit={handleSubmit}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>
            Template Details
          </h2>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., React CRUD App"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe what projects from this template will look like..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Difficulty *</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                style={inputStyle}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Tech Stack</label>
              <input
                type="text"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                placeholder="React, TypeScript, Tailwind (comma-separated)"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
              Default Tickets ({tickets.length})
            </h2>
            <button
              type="button"
              onClick={addTicket}
              style={{
                padding: '0.4rem 0.75rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              + Add Ticket
            </button>
          </div>

          {tickets.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>
              No default tickets yet. Add tickets that will be created with each generated project.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tickets.map((ticket, index) => (
                <div
                  key={index}
                  style={{
                    padding: '1rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280' }}>
                      Ticket {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeTicket(index)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                      }}
                    >
                      Remove
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Title *</label>
                      <input
                        type="text"
                        value={ticket.title}
                        onChange={(e) => updateTicket(index, 'title', e.target.value)}
                        placeholder="e.g., Set up project structure"
                        style={{ ...inputStyle, padding: '0.5rem 0.6rem', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Difficulty</label>
                      <select
                        value={ticket.difficulty}
                        onChange={(e) => updateTicket(index, 'difficulty', e.target.value)}
                        style={{ ...inputStyle, padding: '0.5rem 0.6rem', fontSize: '0.85rem' }}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Description</label>
                    <textarea
                      value={ticket.description}
                      onChange={(e) => updateTicket(index, 'description', e.target.value)}
                      rows={2}
                      placeholder="Describe what this ticket involves..."
                      style={{ ...inputStyle, padding: '0.5rem 0.6rem', fontSize: '0.85rem', resize: 'vertical' }}
                    />
                  </div>

                  <div>
                    <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Acceptance Criteria</label>
                    <textarea
                      value={ticket.acceptance_criteria}
                      onChange={(e) => updateTicket(index, 'acceptance_criteria', e.target.value)}
                      rows={3}
                      placeholder="- [ ] Criteria 1&#10;- [ ] Criteria 2"
                      style={{ ...inputStyle, padding: '0.5rem 0.6rem', fontSize: '0.85rem', resize: 'vertical' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.6rem 1.5rem',
              backgroundColor: loading ? '#a5b4fc' : '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Creating...' : 'Create Template'}
          </button>
          <Link
            href="/admin/templates"
            style={{
              padding: '0.6rem 1.5rem',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: 500,
  color: '#374151',
  marginBottom: '0.4rem',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  fontSize: '0.9rem',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  backgroundColor: '#fff',
}
