import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { ApiResponse } from '@itay-dev/shared'

const app = new Hono()

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

export default app
