import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface Template {
  id: string
  name: string
  description: string | null
  difficulty: string
  tech_stack: string[]
  default_tickets: TicketTemplate[]
  created_at: string
}

interface TicketTemplate {
  title: string
  description?: string
  acceptance_criteria?: string
  difficulty: string
}

export default async function AdminTemplatesPage() {
  const supabase = await createClient()

  const { data: templates } = await supabase
    .schema('itay')
    .from('project_templates')
    .select('*')
    .order('created_at', { ascending: false })

  const typedTemplates = (templates || []) as Template[]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Project Templates</h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Create reusable templates for AI-powered project generation
          </p>
        </div>
        <Link
          href="/admin/templates/new"
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
          + New Template
        </Link>
      </div>

      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
      }}>
        {typedTemplates.length > 0 ? (
          <div>
            {typedTemplates.map((template) => (
              <div
                key={template.id}
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>
                      {template.name}
                    </h3>
                    <DifficultyBadge difficulty={template.difficulty} />
                  </div>

                  {template.description && (
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                      {template.description.slice(0, 120)}{template.description.length > 120 ? '...' : ''}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {template.tech_stack && template.tech_stack.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {template.tech_stack.slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            style={{
                              padding: '0.2rem 0.5rem',
                              fontSize: '0.7rem',
                              backgroundColor: '#f3f4f6',
                              color: '#374151',
                              borderRadius: '4px',
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                        {template.tech_stack.length > 4 && (
                          <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                            +{template.tech_stack.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                      {template.default_tickets?.length || 0} default tickets
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Link
                    href={`/admin/templates/${template.id}/generate`}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#22c55e',
                      color: '#fff',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                    }}
                  >
                    Generate Project
                  </Link>
                  <Link
                    href={`/admin/templates/${template.id}`}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontWeight: 500,
                      fontSize: '0.8rem',
                    }}
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>
              No templates yet
            </h3>
            <p style={{ marginBottom: '1.5rem' }}>
              Create a template to quickly generate similar projects with AI
            </p>
            <Link
              href="/admin/templates/new"
              style={{
                display: 'inline-block',
                padding: '0.6rem 1.2rem',
                backgroundColor: '#6366f1',
                color: '#fff',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              Create First Template
            </Link>
          </div>
        )}
      </div>
    </div>
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
      padding: '0.2rem 0.5rem',
      fontSize: '0.7rem',
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
