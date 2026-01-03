import { getPullRequestDiff, createPullRequestReview } from './github'
import { generateCodeReview } from './openrouter'
import { updateTicketReviewStatus, getTicketContext } from './supabase'

export interface CodeReviewJob {
  owner: string
  repo: string
  prNumber: number
  ticketId: string
}

export interface Env {
  GITHUB_TOKEN: string
  OPENROUTER_API_KEY: string
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

export async function processCodeReview(job: CodeReviewJob, env: Env): Promise<void> {
  const { owner, repo, prNumber, ticketId } = job

  console.log(`Processing code review for PR #${prNumber} (ticket: ${ticketId})`)

  try {
    // 1. Mark review as pending
    await updateTicketReviewStatus(
      ticketId,
      'pending',
      env.SUPABASE_URL,
      env.SUPABASE_ANON_KEY
    )

    // 2. Get ticket context for the review
    const ticketContext = await getTicketContext(
      ticketId,
      env.SUPABASE_URL,
      env.SUPABASE_ANON_KEY
    )

    if (!ticketContext) {
      console.warn(`No ticket context found for ${ticketId}, using defaults`)
    }

    // 3. Fetch the PR diff
    const { diff, additions, deletions, changedFiles } = await getPullRequestDiff(
      owner,
      repo,
      prNumber,
      env.GITHUB_TOKEN
    )

    console.log(`PR diff: +${additions}/-${deletions}, ${changedFiles} files`)

    // Skip review for very small changes
    if (additions + deletions < 5) {
      console.log('Skipping review for trivial PR')
      await createPullRequestReview(
        owner,
        repo,
        prNumber,
        "Thanks for your contribution! This PR is quite small, so I'll skip the detailed review. Feel free to ask if you have questions!",
        env.GITHUB_TOKEN
      )
      await updateTicketReviewStatus(ticketId, 'completed', env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
      return
    }

    // 4. Generate AI review
    const review = await generateCodeReview(
      diff,
      {
        ticketTitle: ticketContext?.title || 'Unknown ticket',
        ticketDescription: ticketContext?.description || '',
        acceptanceCriteria: ticketContext?.acceptanceCriteria || null,
        projectName: ticketContext?.projectName || repo,
        techStack: ticketContext?.techStack || [],
      },
      env.OPENROUTER_API_KEY
    )

    // 5. Post review to GitHub
    await createPullRequestReview(owner, repo, prNumber, review, env.GITHUB_TOKEN)

    // 6. Mark review as completed
    await updateTicketReviewStatus(ticketId, 'completed', env.SUPABASE_URL, env.SUPABASE_ANON_KEY)

    console.log(`Code review completed for PR #${prNumber}`)
  } catch (error) {
    console.error(`Code review failed for PR #${prNumber}:`, error)

    // Mark as failed
    try {
      await updateTicketReviewStatus(ticketId, 'failed', env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
    } catch (updateError) {
      console.error('Failed to update ticket status:', updateError)
    }

    // Re-throw to trigger queue retry
    throw error
  }
}
