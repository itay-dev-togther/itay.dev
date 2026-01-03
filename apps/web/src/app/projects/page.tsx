import { createClient } from '@/lib/supabase/server'
import { ProjectCard } from '@/components/projects/ProjectCard'
import type { Project } from '@itay-dev/shared'

export default async function ProjectsPage() {
  const supabase = await createClient()

  const { data: projects, error } = await supabase
    .schema('itay')
    .from('projects')
    .select('*')
    .in('status', ['active', 'completed'])
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
  }

  const activeCount = projects?.filter(p => p.status === 'active').length || 0
  const completedCount = projects?.filter(p => p.status === 'completed').length || 0

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '4rem 2rem',
        color: '#fff',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            marginBottom: '1rem',
            lineHeight: 1.2,
          }}>
            Open Source Projects
          </h1>
          <p style={{
            fontSize: '1.125rem',
            opacity: 0.9,
            maxWidth: 600,
            lineHeight: 1.6,
            marginBottom: '2rem',
          }}>
            Pick a project, claim a ticket, and start building your portfolio with real contributions.
            Every PR merged is proof of your skills.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{activeCount}</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Active Projects</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{completedCount}</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Completed</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>∞</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Learning Opportunities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Filter tabs (visual only for now) */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '1rem',
        }}>
          <button style={{
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#6366f1',
            backgroundColor: '#eef2ff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}>
            All Projects
          </button>
          <button style={{
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            fontWeight: 500,
            color: '#6b7280',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}>
            Beginner
          </button>
          <button style={{
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            fontWeight: 500,
            color: '#6b7280',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}>
            Intermediate
          </button>
          <button style={{
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            fontWeight: 500,
            color: '#6b7280',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}>
            Advanced
          </button>
        </div>

        {/* Grid */}
        {projects && projects.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.5rem',
          }}>
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project as Project} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            color: '#6b7280',
          }}>
            <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
              No projects available yet.
            </p>
            <p>Check back soon for new opportunities!</p>
          </div>
        )}
      </section>
    </div>
  )
}
