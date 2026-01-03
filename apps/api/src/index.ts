import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { ApiResponse } from '@itay-dev/shared'
import { handleCodeReviewQueue } from './queues/codeReviewQueue'
import { CodeReviewJob, Env } from './services/codeReview'

interface Bindings extends Env {
  CODE_REVIEW_QUEUE: Queue
  WORKER_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors())

app.get('/', (c) => {
  const response: ApiResponse<{ message: string }> = {
    data: { message: 'Itay.dev API' }
  }
  return c.json(response)
})

app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

// Queue producer endpoint - called by webhook to queue code review
app.post('/queue/review', async (c) => {
  // Validate shared secret
  const authHeader = c.req.header('Authorization')
  const expectedSecret = `Bearer ${c.env.WORKER_SECRET}`

  if (authHeader !== expectedSecret) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const job = await c.req.json<CodeReviewJob>()

    // Validate required fields
    if (!job.owner || !job.repo || !job.prNumber || !job.ticketId) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    // Queue the review job
    await c.env.CODE_REVIEW_QUEUE.send(job)

    console.log(`Queued code review for PR #${job.prNumber} (ticket: ${job.ticketId})`)

    return c.json({
      success: true,
      message: `Review queued for PR #${job.prNumber}`
    })
  } catch (error) {
    console.error('Failed to queue review:', error)
    return c.json({ error: 'Failed to queue review' }, 500)
  }
})

// Export the worker with both fetch and queue handlers
export default {
  fetch: app.fetch,
  queue: handleCodeReviewQueue,
}
