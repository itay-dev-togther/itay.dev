import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET

function verifySignature(payload: string, signature: string | null): boolean {
  if (!WEBHOOK_SECRET || !signature) return false

  const sig = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(`sha256=${sig}`),
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

    const supabase = await createClient()

    // Find ticket by branch name
    const branchName = pull_request.head.ref
    const { data: ticket, error: ticketError } = await supabase
      .schema('itay')
      .from('tickets')
      .select('*, projects(*)')
      .eq('branch_name', branchName)
      .single()

    if (ticketError || !ticket) {
      // Not a tracked branch, ignore
      console.log(`No ticket found for branch: ${branchName}`)
      return NextResponse.json({ message: 'Branch not tracked' }, { status: 200 })
    }

    // Verify this PR is for the correct repo
    const project = ticket.projects as { github_repo_name?: string } | null
    if (project?.github_repo_name !== repository.full_name) {
      console.log(`Repo mismatch: expected ${project?.github_repo_name}, got ${repository.full_name}`)
      return NextResponse.json({ message: 'Repo mismatch' }, { status: 200 })
    }

    if (action === 'opened' || action === 'reopened') {
      // Update ticket to in_review status
      await supabase
        .schema('itay')
        .from('tickets')
        .update({
          status: 'in_review',
          pr_url: pull_request.html_url,
          pr_number: pull_request.number,
        })
        .eq('id', ticket.id)

      console.log(`Ticket ${ticket.id} updated to in_review`)
    }

    if (action === 'closed' && pull_request.merged) {
      // Update ticket to done status
      await supabase
        .schema('itay')
        .from('tickets')
        .update({
          status: 'done',
          pr_url: pull_request.html_url,
          pr_number: pull_request.number,
        })
        .eq('id', ticket.id)

      // Create contribution record
      if (ticket.claimed_by) {
        const { error: contributionError } = await supabase
          .schema('itay')
          .from('contributions')
          .insert({
            user_id: ticket.claimed_by,
            ticket_id: ticket.id,
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
          console.log(`Contribution created for ticket ${ticket.id}`)
        }
      }

      console.log(`Ticket ${ticket.id} marked as done`)
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

// Disable body parsing since we need raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}
