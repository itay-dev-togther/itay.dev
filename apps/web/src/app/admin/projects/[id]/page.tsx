'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  description: string | null
  difficulty: string
  tech_stack: string[]
  status: string
  github_repo_url: string | null
  github_repo_name: string | null
  created_at: string
}

export default function EditProjectPage() {
  const params = useParams()
  const projectId = params.id as string
  const router = useRouter()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState('beginner')
  const [techStack, setTechStack] = useState('')
  const [status, setStatus] = useState('draft')

  useEffect(() => {
    fetchProject()
  }, [projectId])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}`)
      if (!response.ok) {
        throw new Error('Project not found')
      }
      const { project } = await response.json()
      setProject(project)
      setName(project.name)
      setDescription(project.description || '')
      setDifficulty(project.difficulty)
      setTechStack(project.tech_stack?.join(', ') || '')
      setStatus(project.status)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          difficulty,
          tech_stack: techStack.split(',').map(s => s.trim()).filter(Boolean),
          status,
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to update project')
      }

      const { project: updated } = await response.json()
      setProject(updated)
      setSuccess('Project saved successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!confirm('Publish this project? This will create a GitHub repository and make it visible to contributors.')) {
      return
    }

    setPublishing(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/admin/projects/${projectId}/publish`, {
        method: 'POST',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to publish project')
      }

      const { project: updated } = await response.json()
      setProject(updated)
      setStatus(updated.status)
      setSuccess('Project published successfully! GitHub repository created.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setPublishing(false)
    }
  }

  const handleUnpublish = async () => {
    if (!confirm('Unpublish this project? It will be hidden from contributors.')) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paused' }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to unpublish project')
      }

      const { project: updated } = await response.json()
      setProject(updated)
      setStatus(updated.status)
      setSuccess('Project unpublished.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ padding: '2rem', color: '#6b7280' }}>Loading...</div>
  }

  if (!project) {
    return <div style={{ padding: '2rem', color: '#dc2626' }}>Project not found</div>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Edit Project
          </h1>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <StatusBadge status={project.status} />
            {project.github_repo_url && (
              <a
                href={project.github_repo_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.85rem', color: '#6366f1' }}
              >
                View on GitHub →
              </a>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link
            href={`/admin/projects/${projectId}/tickets`}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '0.85rem',
            }}
          >
            Manage Tickets
          </Link>

          {project.status === 'draft' && (
            <button
              onClick={handlePublish}
              disabled={publishing}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: publishing ? '#86efac' : '#22c55e',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: publishing ? 'not-allowed' : 'pointer',
              }}
            >
              {publishing ? 'Publishing...' : 'Publish Project'}
            </button>
          )}

          {project.status === 'active' && (
            <button
              onClick={handleUnpublish}
              disabled={saving}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              Unpublish
            </button>
          )}

          {project.status === 'paused' && (
            <button
              onClick={handlePublish}
              disabled={publishing}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: publishing ? '#86efac' : '#22c55e',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: publishing ? 'not-allowed' : 'pointer',
              }}
            >
              {publishing ? 'Publishing...' : 'Republish'}
            </button>
          )}
        </div>
      </div>

      {success && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#dcfce7',
          color: '#166534',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
        }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSave}>
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
            <label style={labelStyle}>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Difficulty</label>
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
              <label style={labelStyle}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={inputStyle}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Tech Stack</label>
            <input
              type="text"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="React, TypeScript, Tailwind (comma-separated)"
              style={inputStyle}
            />
          </div>

          {project.github_repo_name && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>GitHub Repository</label>
              <input
                type="text"
                value={project.github_repo_name}
                disabled
                style={{ ...inputStyle, backgroundColor: '#f3f4f6' }}
              />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '0.6rem 1.5rem',
              backgroundColor: saving ? '#a5b4fc' : '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href="/admin/projects"
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

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; color: string }> = {
    draft: { bg: '#fef3c7', color: '#92400e' },
    active: { bg: '#dcfce7', color: '#166534' },
    completed: { bg: '#e0e7ff', color: '#3730a3' },
    paused: { bg: '#f3f4f6', color: '#6b7280' },
  }
  const style = config[status] || config.draft

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
      {status}
    </span>
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
