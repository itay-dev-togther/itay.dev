import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Get counts
  const { count: projectCount } = await supabase
    .schema('itay')
    .from('projects')
    .select('*', { count: 'exact', head: true })

  const { count: ticketCount } = await supabase
    .schema('itay')
    .from('tickets')
    .select('*', { count: 'exact', head: true })

  const { count: availableTicketCount } = await supabase
    .schema('itay')
    .from('tickets')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'available')

  const { count: userCount } = await supabase
    .schema('itay')
    .from('users')
    .select('*', { count: 'exact', head: true })

  const { count: contributionCount } = await supabase
    .schema('itay')
    .from('contributions')
    .select('*', { count: 'exact', head: true })

  // Recent activity
  const { data: recentTickets } = await supabase
    .schema('itay')
    .from('tickets')
    .select('*, projects(name)')
    .order('updated_at', { ascending: false })
    .limit(5)

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>
        Dashboard
      </h1>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2.5rem',
      }}>
        <StatCard label="Projects" value={projectCount || 0} href="/admin/projects" />
        <StatCard label="Total Tickets" value={ticketCount || 0} />
        <StatCard label="Available Tickets" value={availableTicketCount || 0} color="#10b981" />
        <StatCard label="Users" value={userCount || 0} />
        <StatCard label="Contributions" value={contributionCount || 0} color="#6366f1" />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link
            href="/admin/projects/new"
            style={{
              padding: '0.75rem 1.25rem',
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
      </div>

      {/* Recent Activity */}
      <div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
          Recent Ticket Activity
        </h2>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}>
          {recentTickets && recentTickets.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={thStyle}>Ticket</th>
                  <th style={thStyle}>Project</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Updated</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => (
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
                      {(ticket.projects as { name: string } | null)?.name}
                    </td>
                    <td style={tdStyle}>
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td style={{ ...tdStyle, color: '#6b7280', fontSize: '0.85rem' }}>
                      {new Date(ticket.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              No recent activity
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, href }: { label: string; value: number; color?: string; href?: string }) {
  const content = (
    <div style={{
      padding: '1.25rem',
      backgroundColor: '#fff',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
    }}>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: color || '#111827' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>{label}</div>
    </div>
  )

  if (href) {
    return <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link>
  }
  return content
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
