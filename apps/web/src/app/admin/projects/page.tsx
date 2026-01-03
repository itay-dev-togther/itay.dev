import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminProjectsPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .schema('itay')
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Projects</h1>
        <Link
          href="/admin/projects/new"
          style={{
            padding: '0.6rem 1.2rem',
            backgroundColor: '#6366f1',
            color: '#fff',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          + New Project
        </Link>
      </div>

      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
      }}>
        {projects && projects.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Difficulty</th>
                <th style={thStyle}>GitHub</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{project.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      {project.description?.slice(0, 60)}...
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <StatusBadge status={project.status} />
                  </td>
                  <td style={tdStyle}>
                    <DifficultyBadge difficulty={project.difficulty} />
                  </td>
                  <td style={tdStyle}>
                    {project.github_repo_url ? (
                      <a
                        href={project.github_repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#6366f1', fontSize: '0.85rem' }}
                      >
                        View Repo
                      </a>
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Not linked</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <Link
                        href={`/admin/projects/${project.id}`}
                        style={{ color: '#6366f1', fontSize: '0.85rem', textDecoration: 'none' }}
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/projects/${project.id}/tickets`}
                        style={{ color: '#6366f1', fontSize: '0.85rem', textDecoration: 'none' }}
                      >
                        Tickets
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            <p style={{ marginBottom: '1rem' }}>No projects yet.</p>
            <Link
              href="/admin/projects/new"
              style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}
            >
              Create your first project
            </Link>
          </div>
        )}
      </div>
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

const thStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  textAlign: 'left',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
}

const tdStyle: React.CSSProperties = {
  padding: '1rem',
  fontSize: '0.9rem',
}
