'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Template {
  id: string
  name: string
  description: string | null
  difficulty: string
  tech_stack: string[]
  default_tickets: TicketTemplate[]
}

interface TicketTemplate {
  title: string
  description: string
  acceptance_criteria: string
  difficulty: string
}

interface GeneratedContent {
  name: string
  description: string
  tickets: TicketTemplate[]
}

export default function GenerateProjectPage() {
  const params = useParams()
  const templateId = params.id as string
  const router = useRouter()

  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [projectName, setProjectName] = useState('')
  const [customGoals, setCustomGoals] = useState('')
  const [variations, setVariations] = useState('')

  // Generated content state
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [editedContent, setEditedContent] = useState<GeneratedContent | null>(null)

  useEffect(() => {
    fetchTemplate()
  }, [templateId])

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`/api/admin/templates/${templateId}`)
      if (!response.ok) {
        throw new Error('Template not found')
      }
      const { template } = await response.json()
      setTemplate(template)
      setProjectName(`${template.name} - New Project`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load template')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!template) return

    setGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/templates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          projectName,
          customGoals,
          variations,
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to generate project')
      }

      const { content } = await response.json()
      setGeneratedContent(content)
      setEditedContent(content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setGenerating(false)
    }
  }

  const updateTicket = (index: number, field: keyof TicketTemplate, value: string) => {
    if (!editedContent) return
    const updated = { ...editedContent }
    updated.tickets = [...updated.tickets]
    updated.tickets[index] = { ...updated.tickets[index], [field]: value }
    setEditedContent(updated)
  }

  const removeTicket = (index: number) => {
    if (!editedContent) return
    const updated = { ...editedContent }
    updated.tickets = updated.tickets.filter((_, i) => i !== index)
    setEditedContent(updated)
  }

  const handleCreate = async () => {
    if (!editedContent || !template) return

    setCreating(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editedContent.name,
          description: editedContent.description,
          difficulty: template.difficulty,
          tech_stack: template.tech_stack,
          template_id: templateId,
          tickets: editedContent.tickets,
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to create project')
      }

      const { project } = await response.json()
      router.push(`/admin/projects/${project.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return <div style={{ padding: '2rem', color: '#6b7280' }}>Loading...</div>
  }

  if (!template) {
    return <div style={{ padding: '2rem', color: '#dc2626' }}>Template not found</div>
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

      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Generate Project from Template
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        Using template: <strong>{template.name}</strong>
      </p>

      {!generatedContent ? (
        // Step 1: Input form
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '1.5rem',
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>
            Customize Your Project
          </h2>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Project Name *</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., Task Manager App"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Specific Goals / Features</label>
            <textarea
              value={customGoals}
              onChange={(e) => setCustomGoals(e.target.value)}
              rows={3}
              placeholder="Describe any specific features or goals for this project..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              AI will tailor the project description and tickets based on these goals
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Variations / Customizations</label>
            <textarea
              value={variations}
              onChange={(e) => setVariations(e.target.value)}
              rows={2}
              placeholder="Any variations from the template (e.g., different styling, extra pages)..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
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
            onClick={handleGenerate}
            disabled={generating || !projectName.trim()}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: generating ? '#a5b4fc' : '#22c55e',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: generating || !projectName.trim() ? 'not-allowed' : 'pointer',
              fontSize: '0.95rem',
            }}
          >
            {generating ? 'Generating with AI...' : 'Generate Project'}
          </button>
        </div>
      ) : (
        // Step 2: Review and edit generated content
        <div>
          <div style={{
            backgroundColor: '#dcfce7',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <span style={{ fontSize: '1.25rem' }}>✨</span>
            <span style={{ color: '#166534', fontWeight: 500 }}>
              AI generated your project! Review and edit below, then create.
            </span>
          </div>

          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>
              Project Details
            </h2>

            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Name</label>
              <input
                type="text"
                value={editedContent?.name || ''}
                onChange={(e) => setEditedContent(prev => prev ? { ...prev, name: e.target.value } : null)}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Description</label>
              <textarea
                value={editedContent?.description || ''}
                onChange={(e) => setEditedContent(prev => prev ? { ...prev, description: e.target.value } : null)}
                rows={5}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Difficulty</label>
                <input
                  type="text"
                  value={template.difficulty}
                  disabled
                  style={{ ...inputStyle, backgroundColor: '#f3f4f6' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Tech Stack</label>
                <input
                  type="text"
                  value={template.tech_stack.join(', ')}
                  disabled
                  style={{ ...inputStyle, backgroundColor: '#f3f4f6' }}
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
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>
              Generated Tickets ({editedContent?.tickets.length || 0})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {editedContent?.tickets.map((ticket, index) => (
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
                      <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Title</label>
                      <input
                        type="text"
                        value={ticket.title}
                        onChange={(e) => updateTicket(index, 'title', e.target.value)}
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
                      style={{ ...inputStyle, padding: '0.5rem 0.6rem', fontSize: '0.85rem', resize: 'vertical' }}
                    />
                  </div>

                  <div>
                    <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Acceptance Criteria</label>
                    <textarea
                      value={ticket.acceptance_criteria}
                      onChange={(e) => updateTicket(index, 'acceptance_criteria', e.target.value)}
                      rows={3}
                      style={{ ...inputStyle, padding: '0.5rem 0.6rem', fontSize: '0.85rem', resize: 'vertical' }}
                    />
                  </div>
                </div>
              ))}
            </div>
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
              onClick={handleCreate}
              disabled={creating}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: creating ? '#a5b4fc' : '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: creating ? 'not-allowed' : 'pointer',
                fontSize: '0.95rem',
              }}
            >
              {creating ? 'Creating Project...' : 'Create Project'}
            </button>
            <button
              onClick={() => {
                setGeneratedContent(null)
                setEditedContent(null)
              }}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Regenerate
            </button>
            <Link
              href="/admin/templates"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#fff',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Cancel
            </Link>
          </div>
        </div>
      )}
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
