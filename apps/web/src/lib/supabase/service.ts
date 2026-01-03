// Service client for webhook operations
// Uses SECURITY DEFINER functions that bypass RLS internally
// We can call these with the anon key since the functions handle authorization

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Use anon key - the SECURITY DEFINER functions handle RLS bypass internally
function createServiceClient() {
  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing Supabase configuration')
  }

  return createClient(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export const serviceClient = {
  async getTicketByBranch(branchName: string) {
    try {
      const supabase = createServiceClient()

      console.log(`[ServiceClient] Getting ticket for branch: ${branchName}`)

      // Use RPC function that has SECURITY DEFINER (bypasses RLS)
      const { data, error } = await supabase
        .schema('itay')
        .rpc('get_ticket_by_branch', { p_branch_name: branchName })

      console.log(`[ServiceClient] Result:`, { data: !!data, error: error?.message })

      if (error) {
        return { data: null, error: { message: error.message } }
      }

      if (!data || data.length === 0) {
        return { data: null, error: { message: 'Not found' } }
      }

      // Transform to match expected format
      const ticket = data[0]
      return {
        data: {
          ...ticket,
          projects: { github_repo_name: ticket.project_github_repo_name }
        },
        error: null
      }
    } catch (err) {
      console.error(`[ServiceClient] Exception:`, err)
      return { data: null, error: { message: String(err) } }
    }
  },

  async updateTicket(ticketId: string, updates: Record<string, unknown>) {
    try {
      const supabase = createServiceClient()

      console.log(`[ServiceClient] Updating ticket ${ticketId}:`, updates)

      // Use RPC function that has SECURITY DEFINER (bypasses RLS)
      const { data, error } = await supabase
        .schema('itay')
        .rpc('update_ticket_for_webhook', {
          p_ticket_id: ticketId,
          p_status: updates.status as string,
          p_pr_url: updates.pr_url as string || null,
          p_pr_number: updates.pr_number as number || null,
        })

      console.log(`[ServiceClient] Update result:`, { success: data, error: error?.message })

      if (error) {
        return { data: null, error: { message: error.message } }
      }

      return { data: null, error: null }
    } catch (err) {
      console.error(`[ServiceClient] Exception:`, err)
      return { data: null, error: { message: String(err) } }
    }
  },

  async createContribution(contribution: Record<string, unknown>) {
    try {
      const supabase = createServiceClient()

      console.log(`[ServiceClient] Creating contribution`)

      // Use RPC function that has SECURITY DEFINER (bypasses RLS)
      const { data, error } = await supabase
        .schema('itay')
        .rpc('create_contribution_for_webhook', {
          p_user_id: contribution.user_id as string,
          p_ticket_id: contribution.ticket_id as string,
          p_project_id: contribution.project_id as string,
          p_pr_url: contribution.pr_url as string,
          p_pr_number: contribution.pr_number as number,
          p_merged_at: contribution.merged_at as string,
          p_lines_added: contribution.lines_added as number,
          p_lines_removed: contribution.lines_removed as number,
        })

      if (error) {
        return { data: null, error: { message: error.message } }
      }

      return { data: null, error: null }
    } catch (err) {
      console.error(`[ServiceClient] Exception:`, err)
      return { data: null, error: { message: String(err) } }
    }
  },
}
