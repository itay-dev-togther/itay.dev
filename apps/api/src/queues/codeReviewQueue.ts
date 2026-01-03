import { processCodeReview, CodeReviewJob, Env } from '../services/codeReview'

interface QueueMessage {
  body: CodeReviewJob
  ack: () => void
  retry: () => void
}

interface MessageBatch {
  messages: QueueMessage[]
}

export async function handleCodeReviewQueue(
  batch: MessageBatch,
  env: Env
): Promise<void> {
  for (const message of batch.messages) {
    const job = message.body

    console.log(`Processing queue message: PR #${job.prNumber} for ticket ${job.ticketId}`)

    try {
      await processCodeReview(job, env)
      message.ack()
      console.log(`Message acknowledged for PR #${job.prNumber}`)
    } catch (error) {
      console.error(`Failed to process PR #${job.prNumber}:`, error)
      // Let the queue retry (up to max_retries)
      message.retry()
    }
  }
}
