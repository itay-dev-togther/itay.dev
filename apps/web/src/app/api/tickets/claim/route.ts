import { createClient } from '@/lib/supabase/server'
import { createBranch } from '@/lib/github/client'
import { flags } from '@/lib/flags'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated (can be bypassed in dev with SKIP_AUTH=true)
    let userId: string

    if (flags.skipAuth && flags.testUserId) {
      // Use test user in dev mode
      userId = flags.testUserId
      console.log('[DEV] Skipping auth, using test user:', userId)
    } else {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json(
          { error: 'You must be logged in to claim a ticket' },
          { status: 401 }
        )
      }
      userId = user.id
    }

    // Get ticket ID from request body
    const body = await request.json()
    const { ticket_id } = body

    if (!ticket_id) {
      return NextResponse.json(
        { error: 'ticket_id is required' },
        { status: 400 }
      )
    }

    // Check if ticket exists and is available
    const { data: ticket, error: ticketError } = await supabase
      .schema('itay')
      .from('tickets')
      .select('*, projects(*)')
      .eq('id', ticket_id)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    if (ticket.status !== 'available') {
      return NextResponse.json(
        { error: 'This ticket is no longer available' },
        { status: 400 }
      )
    }

    // Check if user exists in itay.users (skip in test mode)
    if (!flags.skipAuth) {
      const { data: itayUser, error: userError } = await supabase
        .schema('itay')
        .from('users')
        .select('id, github_username')
        .eq('id', userId)
        .single()

      if (userError || !itayUser) {
        return NextResponse.json(
          { error: 'User profile not found. Please complete your profile setup.' },
          { status: 400 }
        )
      }
    }

    // Generate branch name
    const sanitizedTitle = ticket.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50)
    const branchName = `feature/${sanitizedTitle}-${ticket_id.slice(0, 8)}`

    // Update ticket to claimed status
    const { data: updatedTicket, error: updateError } = await supabase
      .schema('itay')
      .from('tickets')
      .update({
        status: 'claimed',
        claimed_by: userId,
        claimed_at: new Date().toISOString(),
        branch_name: branchName,
      })
      .eq('id', ticket_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating ticket:', updateError)
      return NextResponse.json(
        { error: 'Failed to claim ticket' },
        { status: 500 }
      )
    }

    // Try to create GitHub branch if project has a repo
    let branchCreated = false
    const project = ticket.projects as { github_repo_name?: string; github_repo_url?: string } | null

    if (project?.github_repo_name && !flags.skipGitHub) {
      try {
        const [owner, repo] = project.github_repo_name.split('/')
        await createBranch({
          owner,
          repo,
          branchName,
        })
        branchCreated = true
      } catch (err) {
        // Log but don't fail - user can create branch manually
        console.error('Failed to create GitHub branch:', err)
      }
    } else if (flags.skipGitHub) {
      console.log('[DEV] Skipping GitHub branch creation')
    }

    // Return success with branch info
    const repoUrl = project?.github_repo_url
    return NextResponse.json({
      ticket: updatedTicket,
      branch_name: branchName,
      branch_created: branchCreated,
      instructions: repoUrl
        ? `
Your ticket has been claimed! Here's how to get started:

1. Clone the repository: git clone ${repoUrl}
2. ${branchCreated ? `Checkout your branch: git checkout ${branchName}` : `Create your branch: git checkout -b ${branchName}`}
3. Make your changes following the acceptance criteria
4. Push and create a PR when ready

Good luck!
        `.trim()
        : `
Your ticket has been claimed! The project repository is not yet set up.
You'll be notified when it's ready.
        `.trim(),
    })

  } catch (error) {
    console.error('Claim ticket error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
