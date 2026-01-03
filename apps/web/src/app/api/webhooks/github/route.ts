import { serviceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const EDGE_FUNCTION_SECRET = process.env.EDGE_FUNCTION_SECRET

// Trigger code review via Supabase Edge Function
async function triggerCodeReview(
  owner: string,
  repo: string,
  prNumber: number,
  ticketId: string
): Promise<void> {
  if (!SUPABASE_URL) {
    console.log('Supabase not configured, skipping AI code review')
    return
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (EDGE_FUNCTION_SECRET) {
      headers['Authorization'] = `Bearer ${EDGE_FUNCTION_SECRET}`
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/code-review`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ owner, repo, prNumber, ticketId }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`Failed to trigger code review: ${response.status} - ${error}`)
    } else {
      console.log(`Triggered code review for PR #${prNumber}`)
    }
  } catch (error) {
    console.error('Error triggering code review:', error)
  }
}

function verifySignature(payload: string, signature: string | null): boolean {
  if (!WEBHOOK_SECRET || !signature) return false

  const sig = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')

  const expected = `sha256=${sig}`

  // timingSafeEqual requires same length buffers
  if (expected.length !== signature.length) {
    return false
  }

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  )
}

interface PullRequestEvent {
  action: string
  pull_request: {
    number: number
    html_url: string
    head: {
      ref: string // branch name
    }
    merged: boolean
    merged_at: string | null
    additions: number
    deletions: number
    user: {
      login: string
    }
  }
  repository: {
    full_name: string
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('x-hub-signature-256')
    const event = request.headers.get('x-github-event')

    // Verify webhook signature in production
    if (WEBHOOK_SECRET && !verifySignature(payload, signature)) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Only handle pull_request events
    if (event !== 'pull_request') {
      return NextResponse.json({ message: 'Event ignored' }, { status: 200 })
    }

    const data: PullRequestEvent = JSON.parse(payload)
    const { action, pull_request, repository } = data

    // Find ticket by branch name
    const branchName = pull_request.head.ref
    const { data: ticket, error: ticketError } = await serviceClient.getTicketByBranch(branchName)

    if (ticketError || !ticket) {
      console.log(`No ticket found for branch: ${branchName}`)
      return NextResponse.json({ message: 'Branch not tracked' }, { status: 200 })
    }

    // Verify this PR is for the correct repo
    const project = ticket.projects as { github_repo_name?: string } | null
    if (project?.github_repo_name !== repository.full_name) {
      console.log(`Repo mismatch: expected ${project?.github_repo_name}, got ${repository.full_name}`)
      return NextResponse.json({ message: 'Repo mismatch' }, { status: 200 })
    }

    const ticketId = ticket.id as string

    // Trigger AI code review for new or updated PRs
    if (action === 'opened' || action === 'reopened' || action === 'synchronize') {
      const [owner, repo] = repository.full_name.split('/')
      // Fire and forget - don't await
      triggerCodeReview(owner, repo, pull_request.number, ticketId)
    }

    if (action === 'opened' || action === 'reopened') {
      // Update ticket to in_review status
      const { error } = await serviceClient.updateTicket(ticketId, {
        status: 'in_review',
        pr_url: pull_request.html_url,
        pr_number: pull_request.number,
      })

      if (error) {
        console.error('Error updating ticket:', error)
      } else {
        console.log(`Ticket ${ticketId} updated to in_review`)
      }
    }

    if (action === 'closed' && pull_request.merged) {
      // Update ticket to done status
      await serviceClient.updateTicket(ticketId, {
        status: 'done',
        pr_url: pull_request.html_url,
        pr_number: pull_request.number,
      })

      // Create contribution record
      const claimedBy = ticket.claimed_by as string | null
      if (claimedBy) {
        const { error: contributionError } = await serviceClient.createContribution({
          user_id: claimedBy,
          ticket_id: ticketId,
          project_id: ticket.project_id,
          pr_url: pull_request.html_url,
          pr_number: pull_request.number,
          merged_at: pull_request.merged_at,
          lines_added: pull_request.additions,
          lines_removed: pull_request.deletions,
        })

        if (contributionError) {
          console.error('Error creating contribution:', contributionError)
        } else {
          console.log(`Contribution created for ticket ${ticketId}`)
        }
      }

      console.log(`Ticket ${ticketId} marked as done`)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
