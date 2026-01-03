import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface ActivityItem {
  id: string
  type: 'claim' | 'pr_opened' | 'pr_merged'
  timestamp: string
  ticketId: string
  ticketTitle: string
  projectId: string
  projectName: string
  userId: string
  userName: string
  userAvatar: string | null
  prUrl?: string
  prNumber?: number
  linesAdded?: number
  linesRemoved?: number
}

export default async function AdminActivityPage() {
  const supabase = await createClient()

  // Get recent claims
  const { data: claims } = await supabase
    .schema('itay')
    .from('tickets')
    .select(`
      id,
      title,
      claimed_at,
      claimed_by,
      project:projects(id, name),
      claimer:users!tickets_claimed_by_fkey(id, name, avatar_url)
    `)
    .not('claimed_at', 'is', null)
    .order('claimed_at', { ascending: false })
    .limit(50)

  // Get recent PRs opened (tickets with PR but not merged)
  const { data: prsOpened } = await supabase
    .schema('itay')
    .from('tickets')
    .select(`
      id,
      title,
      pr_url,
      pr_number,
      updated_at,
      claimed_by,
      project:projects(id, name),
      claimer:users!tickets_claimed_by_fkey(id, name, avatar_url)
    `)
    .not('pr_url', 'is', null)
    .in('status', ['in_review'])
    .order('updated_at', { ascending: false })
    .limit(50)

  // Get recent merges from contributions
  const { data: merges } = await supabase
    .schema('itay')
    .from('contributions')
    .select(`
      id,
      merged_at,
      pr_url,
      pr_number,
      lines_added,
      lines_removed,
      ticket:tickets(id, title),
      project:projects(id, name),
      user:users(id, name, avatar_url)
    `)
    .order('merged_at', { ascending: false })
    .limit(50)

  // Build unified activity feed
  const activities: ActivityItem[] = []

  // Add claims
  if (claims) {
    for (const claim of claims) {
      const project = claim.project as unknown as { id: string; name: string } | null
      const claimer = claim.claimer as unknown as { id: string; name: string; avatar_url: string | null } | null
      if (project && claimer && claim.claimed_at) {
        activities.push({
          id: `claim-${claim.id}`,
          type: 'claim',
          timestamp: claim.claimed_at,
          ticketId: claim.id,
          ticketTitle: claim.title,
          projectId: project.id,
          projectName: project.name,
          userId: claimer.id,
          userName: claimer.name || 'Unknown',
          userAvatar: claimer.avatar_url,
        })
      }
    }
  }

  // Add PRs opened
  if (prsOpened) {
    for (const pr of prsOpened) {
      const project = pr.project as unknown as { id: string; name: string } | null
      const claimer = pr.claimer as unknown as { id: string; name: string; avatar_url: string | null } | null
      if (project && claimer && pr.updated_at) {
        activities.push({
          id: `pr-${pr.id}`,
          type: 'pr_opened',
          timestamp: pr.updated_at,
          ticketId: pr.id,
          ticketTitle: pr.title,
          projectId: project.id,
          projectName: project.name,
          userId: claimer.id,
          userName: claimer.name || 'Unknown',
          userAvatar: claimer.avatar_url,
          prUrl: pr.pr_url || undefined,
          prNumber: pr.pr_number || undefined,
        })
      }
    }
  }

  // Add merges
  if (merges) {
    for (const merge of merges) {
      const ticket = merge.ticket as unknown as { id: string; title: string } | null
      const project = merge.project as unknown as { id: string; name: string } | null
      const user = merge.user as unknown as { id: string; name: string; avatar_url: string | null } | null
      if (ticket && project && user && merge.merged_at) {
        activities.push({
          id: `merge-${merge.id}`,
          type: 'pr_merged',
          timestamp: merge.merged_at,
          ticketId: ticket.id,
          ticketTitle: ticket.title,
          projectId: project.id,
          projectName: project.name,
          userId: user.id,
          userName: user.name || 'Unknown',
          userAvatar: user.avatar_url,
          prUrl: merge.pr_url || undefined,
          prNumber: merge.pr_number || undefined,
          linesAdded: merge.lines_added,
          linesRemoved: merge.lines_removed,
        })
      }
    }
  }

  // Sort by timestamp descending
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // Calculate stats
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const thisWeekActivities = activities.filter(a => new Date(a.timestamp) >= weekAgo)
  const stats = {
    totalActivities: activities.length,
    claimsThisWeek: thisWeekActivities.filter(a => a.type === 'claim').length,
    prsThisWeek: thisWeekActivities.filter(a => a.type === 'pr_opened').length,
    mergesThisWeek: thisWeekActivities.filter(a => a.type === 'pr_merged').length,
    activeContributors: new Set(thisWeekActivities.map(a => a.userId)).size,
  }

  const activityConfig = {
    claim: { icon: '🎯', label: 'claimed', color: '#f59e0b' },
    pr_opened: { icon: '📝', label: 'opened PR for', color: '#3b82f6' },
    pr_merged: { icon: '🎉', label: 'merged PR for', color: '#22c55e' },
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Activity Feed
        </h1>
        <p style={{ color: '#6b7280' }}>
          Monitor contributor activity across all projects
        </p>
      </div>

      {/* Stats */}
      <div className="activity-stats" style={{
        display: 'grid',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <style>{`
          .activity-stats {
            grid-template-columns: repeat(5, 1fr);
          }
          @media (max-width: 1024px) {
            .activity-stats {
              grid-template-columns: repeat(3, 1fr);
            }
          }
          @media (max-width: 640px) {
            .activity-stats {
              grid-template-columns: repeat(2, 1fr);
            }
          }
        `}</style>
        {[
          { label: 'Active Contributors', value: stats.activeContributors, sublabel: 'this week' },
          { label: 'Tickets Claimed', value: stats.claimsThisWeek, sublabel: 'this week' },
          { label: 'PRs Opened', value: stats.prsThisWeek, sublabel: 'this week' },
          { label: 'PRs Merged', value: stats.mergesThisWeek, sublabel: 'this week' },
          { label: 'Total Activities', value: stats.totalActivities, sublabel: 'all time' },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '1.25rem',
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              {stat.sublabel}
            </div>
          </div>
        ))}
      </div>

      {/* Activity Feed */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#374151' }}>
            Recent Activity
          </h2>
        </div>

        {activities.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            No activity yet. Contributors will appear here when they claim tickets and submit PRs.
          </div>
        ) : (
          <div>
            {activities.slice(0, 30).map((activity) => {
              const config = activityConfig[activity.type]
              return (
                <div
                  key={activity.id}
                  style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  {/* Avatar */}
                  {activity.userAvatar ? (
                    <img
                      src={activity.userAvatar}
                      alt={activity.userName}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#6b7280',
                    }}>
                      {activity.userName[0]?.toUpperCase()}
                    </div>
                  )}

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', color: '#111827' }}>
                      <span style={{ fontWeight: 600 }}>{activity.userName}</span>
                      {' '}
                      <span style={{ color: config.color }}>{config.icon} {config.label}</span>
                      {' '}
                      <Link
                        href={`/tickets/${activity.ticketId}`}
                        style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}
                      >
                        {activity.ticketTitle}
                      </Link>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                      <Link
                        href={`/projects/${activity.projectId}`}
                        style={{ color: '#9ca3af', textDecoration: 'none' }}
                      >
                        {activity.projectName}
                      </Link>
                      {activity.prNumber && (
                        <>
                          {' · '}
                          <a
                            href={activity.prUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#9ca3af', textDecoration: 'none' }}
                          >
                            PR #{activity.prNumber}
                          </a>
                        </>
                      )}
                      {activity.linesAdded !== undefined && (
                        <>
                          {' · '}
                          <span style={{ color: '#22c55e' }}>+{activity.linesAdded}</span>
                          {' / '}
                          <span style={{ color: '#ef4444' }}>-{activity.linesRemoved}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                    {formatRelativeTime(activity.timestamp)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
