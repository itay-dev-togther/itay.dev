import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectFilters } from '@/components/projects/ProjectFilters'
import { SearchBar } from '@/components/projects/SearchBar'
import { Pagination } from '@/components/ui/Pagination'
import type { Project } from '@itay-dev/shared'

const PROJECTS_PER_PAGE = 9

interface ProjectsPageProps {
  searchParams: Promise<{ difficulty?: string; search?: string; page?: string }>
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { difficulty, search, page } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .schema('itay')
    .from('projects')
    .select('*', { count: 'exact' })
    .in('status', ['active', 'completed'])
    .order('created_at', { ascending: false })

  if (difficulty && ['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
    query = query.eq('difficulty', difficulty)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const pageNum = Math.max(1, parseInt(page || '1'))
  const from = (pageNum - 1) * PROJECTS_PER_PAGE
  const to = from + PROJECTS_PER_PAGE - 1
  query = query.range(from, to)

  const { data: projects, error, count } = await query
  const totalPages = Math.ceil((count || 0) / PROJECTS_PER_PAGE)

  if (error) {
    console.error('Error fetching projects:', error)
  }

  // For stats, count all active/completed (unfiltered)
  const { count: totalActive } = await supabase
    .schema('itay')
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: totalCompleted } = await supabase
    .schema('itay')
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')

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
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{totalActive || 0}</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Active Projects</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{totalCompleted || 0}</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Completed</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{String.fromCharCode(8734)}</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Learning Opportunities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Search + Filter bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}>
          <Suspense fallback={<div style={{ height: '2.5rem' }} />}>
            <ProjectFilters />
          </Suspense>
          <Suspense fallback={<div style={{ width: 400, height: '2.5rem' }} />}>
            <SearchBar />
          </Suspense>
        </div>

        {search && (
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
            {count || 0} result{count !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
          </p>
        )}

        {/* Grid */}
        {projects && projects.length > 0 ? (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '1.5rem',
            }}>
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project as Project} />
              ))}
            </div>

            <Suspense fallback={null}>
              <Pagination
                currentPage={pageNum}
                totalPages={totalPages}
                basePath="/projects"
              />
            </Suspense>
          </>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            color: '#6b7280',
          }}>
            <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
              {search ? 'No projects match your search.' : 'No projects available yet.'}
            </p>
            <p>{search ? 'Try a different search term.' : 'Check back soon for new opportunities!'}</p>
          </div>
        )}
      </section>
    </div>
  )
}
