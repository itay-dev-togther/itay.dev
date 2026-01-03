interface SupabaseRpcResponse<T> {
  data: T | null
  error: { message: string } | null
}

export async function updateTicketReviewStatus(
  ticketId: string,
  reviewStatus: 'pending' | 'completed' | 'failed',
  supabaseUrl: string,
  supabaseAnonKey: string
): Promise<void> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/rpc/update_ticket_review_status`,
    {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Accept-Profile': 'itay',
        'Content-Profile': 'itay',
      },
      body: JSON.stringify({
        p_ticket_id: ticketId,
        p_review_status: reviewStatus,
        p_last_review_at: new Date().toISOString(),
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to update ticket review status: ${response.status} - ${error}`)
  }
}

export async function getTicketContext(
  ticketId: string,
  supabaseUrl: string,
  supabaseAnonKey: string
): Promise<{
  title: string
  description: string
  acceptanceCriteria: string | null
  projectName: string
  techStack: string[]
} | null> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/rpc/get_ticket_context`,
    {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Accept-Profile': 'itay',
        'Content-Profile': 'itay',
      },
      body: JSON.stringify({
        p_ticket_id: ticketId,
      }),
    }
  )

  if (!response.ok) {
    console.error(`Failed to get ticket context: ${response.status}`)
    return null
  }

  interface TicketContextRow {
    title: string
    description: string | null
    acceptance_criteria: string | null
    project_name: string
    tech_stack: string[] | null
  }

  const data = await response.json() as TicketContextRow[]
  if (!data || !Array.isArray(data) || data.length === 0) return null

  const ticket = data[0]
  return {
    title: ticket.title,
    description: ticket.description || '',
    acceptanceCriteria: ticket.acceptance_criteria,
    projectName: ticket.project_name,
    techStack: ticket.tech_stack || [],
  }
}
