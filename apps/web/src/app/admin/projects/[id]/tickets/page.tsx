'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Ticket {
  id: string
  title: string
  description: string | null
  difficulty: string
  status: string
  created_at: string
}

interface Project {
  id: string
  name: string
}

export default function ProjectTicketsPage() {
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = useState<Project | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [projectId])

  const fetchData = async () => {
    try {
      const [projectRes, ticketsRes] = await Promise.all([
        fetch(`/api/admin/projects/${projectId}`),
        fetch(`/api/admin/projects/${projectId}/tickets`),
      ])

      if (projectRes.ok) {
        const { project } = await projectRes.json()
        setProject(project)
      }

      if (ticketsRes.ok) {
        const { tickets } = await ticketsRes.json()
        setTickets(tickets || [])
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      acceptance_criteria: formData.get('acceptance_criteria') as string,
      difficulty: formData.get('difficulty') as string,
    }

    try {
      const response = await fetch(`/api/admin/projects/${projectId}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to create ticket')
      }

      const { ticket } = await response.json()
      setTickets([ticket, ...tickets])
      setShowForm(false)
      ;(e.target as HTMLFormElement).reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setFormLoading(false)
    }
  }

  if (loading) {
    return <div style={{ padding: '2rem', color: '#6b7280' }}>Loading...</div>
  }

  return (
    <div>
      <div style={{ marginBottom: '0.5rem' }}>
        <Link
          href="/admin/projects"
          style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.85rem' }}
        >
          ← Back to Projects
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>
            {project?.name} - Tickets
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '0.6rem 1.2rem',
            backgroundColor: showForm ? '#6b7280' : '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          {showForm ? 'Cancel' : '+ Add Ticket'}
        </button>
      </div>

      {/* New Ticket Form */}
      {showForm && (
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
            New Ticket
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Title *</label>
              <input type="text" name="title" required style={inputStyle} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Description</label>
              <textarea name="description" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Acceptance Criteria</label>
              <textarea
                name="acceptance_criteria"
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="- [ ] Criteria 1&#10;- [ ] Criteria 2"
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Difficulty *</label>
              <select name="difficulty" required style={inputStyle}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
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

            <button
              type="submit"
              disabled={formLoading}
              style={{
                padding: '0.6rem 1.2rem',
                backgroundColor: formLoading ? '#a5b4fc' : '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: formLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {formLoading ? 'Creating...' : 'Create Ticket'}
            </button>
          </form>
        </div>
      )}

      {/* Tickets List */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
      }}>
        {tickets.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Difficulty</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Created</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td style={tdStyle}>
                    <Link
                      href={`/tickets/${ticket.id}`}
                      style={{ color: '#111827', textDecoration: 'none', fontWeight: 500 }}
                    >
                      {ticket.title}
                    </Link>
                  </td>
                  <td style={tdStyle}>
                    <DifficultyBadge difficulty={ticket.difficulty} />
                  </td>
                  <td style={tdStyle}>
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td style={{ ...tdStyle, color: '#6b7280', fontSize: '0.85rem' }}>
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            No tickets yet. Create one above!
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; color: string }> = {
    available: { bg: '#dcfce7', color: '#166534' },
    claimed: { bg: '#fef3c7', color: '#92400e' },
    in_review: { bg: '#e0e7ff', color: '#3730a3' },
    done: { bg: '#f3f4f6', color: '#6b7280' },
  }
  const style = config[status] || config.available

  return (
    <span style={{
      padding: '0.25rem 0.6rem',
      fontSize: '0.75rem',
      fontWeight: 600,
      backgroundColor: style.bg,
      color: style.color,
      borderRadius: '4px',
      textTransform: 'capitalize',
    }}>
      {status.replace('_', ' ')}
    </span>
  )
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const config: Record<string, { bg: string; color: string }> = {
    beginner: { bg: '#dcfce7', color: '#166534' },
    intermediate: { bg: '#fef3c7', color: '#92400e' },
    advanced: { bg: '#fee2e2', color: '#991b1b' },
  }
  const style = config[difficulty] || config.beginner

  return (
    <span style={{
      padding: '0.25rem 0.6rem',
      fontSize: '0.75rem',
      fontWeight: 600,
      backgroundColor: style.bg,
      color: style.color,
      borderRadius: '4px',
      textTransform: 'capitalize',
    }}>
      {difficulty}
    </span>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.9rem',
  fontWeight: 500,
  color: '#374151',
  marginBottom: '0.5rem',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  fontSize: '0.95rem',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  backgroundColor: '#fff',
}

const thStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  textAlign: 'left',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
}

const tdStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  fontSize: '0.9rem',
}
