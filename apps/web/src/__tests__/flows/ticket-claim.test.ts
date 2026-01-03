import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  mockContributorUser,
  mockContributorProfile,
  mockTicket,
  mockProject,
} from '../utils/mocks'

// Mock flags
vi.mock('@/lib/flags', () => ({
  flags: {
    skipAuth: false,
    skipGitHub: true,
    testUserId: null,
  },
}))

// Mock the Supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  schema: vi.fn(),
}

const mockQueryBuilder = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  is: vi.fn().mockReturnThis(),
  single: vi.fn(),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

// Mock GitHub client
vi.mock('@/lib/github/client', () => ({
  createBranch: vi.fn().mockResolvedValue({ ref: 'refs/heads/test-branch' }),
  GITHUB_OWNER: 'itay-dev',
}))

import { POST } from '@/app/api/tickets/claim/route'

describe('Ticket Claim Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.schema.mockReturnValue({ from: vi.fn(() => mockQueryBuilder) })
  })

  const createRequest = (ticketId: string) =>
    new Request('http://localhost/api/tickets/claim', {
      method: 'POST',
      body: JSON.stringify({ ticket_id: ticketId }),
    })

  it('prevents claiming when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    })

    const response = await POST(createRequest('ticket-1'))
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('You must be logged in to claim a ticket')
  })

  it('prevents claiming already claimed ticket', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockContributorUser },
      error: null,
    })

    // Ticket check - already claimed (status !== 'available')
    mockQueryBuilder.single.mockResolvedValueOnce({
      data: { ...mockTicket, status: 'claimed', claimed_by: 'other-user', projects: mockProject },
      error: null,
    })

    const response = await POST(createRequest('ticket-1'))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('This ticket is no longer available')
  })

  it('allows claiming available ticket', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockContributorUser },
      error: null,
    })

    // Ticket check - available
    mockQueryBuilder.single.mockResolvedValueOnce({
      data: { ...mockTicket, status: 'available', projects: mockProject },
      error: null,
    })

    // User profile check
    mockQueryBuilder.single.mockResolvedValueOnce({
      data: { id: mockContributorUser.id, github_username: 'testuser' },
      error: null,
    })

    // Update ticket
    const claimedTicket = {
      ...mockTicket,
      status: 'claimed',
      claimed_by: mockContributorUser.id,
      claimed_at: new Date().toISOString(),
      branch_name: 'feature/test-ticket-ticket-1',
    }
    mockQueryBuilder.single.mockResolvedValueOnce({
      data: claimedTicket,
      error: null,
    })

    const response = await POST(createRequest('ticket-1'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ticket.status).toBe('claimed')
    expect(data.ticket.claimed_by).toBe(mockContributorUser.id)
    expect(data.branch_name).toBeDefined()
    expect(data.instructions).toBeDefined()
  })

  it('returns 404 when ticket not found', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockContributorUser },
      error: null,
    })

    mockQueryBuilder.single.mockResolvedValueOnce({
      data: null,
      error: { code: 'PGRST116', message: 'Not found' },
    })

    const response = await POST(createRequest('non-existent'))
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Ticket not found')
  })

  it('returns 400 when ticket_id is missing', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockContributorUser },
      error: null,
    })

    const response = await POST(
      new Request('http://localhost/api/tickets/claim', {
        method: 'POST',
        body: JSON.stringify({}),
      })
    )
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('ticket_id is required')
  })

  it('returns 400 when user profile not found', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockContributorUser },
      error: null,
    })

    // Ticket check - available
    mockQueryBuilder.single.mockResolvedValueOnce({
      data: { ...mockTicket, status: 'available', projects: mockProject },
      error: null,
    })

    // User profile check - not found
    mockQueryBuilder.single.mockResolvedValueOnce({
      data: null,
      error: { code: 'PGRST116', message: 'Not found' },
    })

    const response = await POST(createRequest('ticket-1'))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('User profile not found')
  })
})
