import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  mockAdminUser,
  mockAdminProfile,
  mockTicket,
  mockClaimedTicket,
} from '../../utils/mocks'

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
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

// Import after mocking
import { PATCH, DELETE } from '@/app/api/admin/tickets/[id]/route'

describe('Tickets API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.schema.mockReturnValue({ from: vi.fn(() => mockQueryBuilder) })
  })

  describe('PATCH /api/admin/tickets/[id]', () => {
    const createRequest = (body: object) =>
      new Request('http://localhost/api/admin/tickets/ticket-1', {
        method: 'PATCH',
        body: JSON.stringify(body),
      })

    const mockParams = Promise.resolve({ id: 'ticket-1' })

    it('returns 401 when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      const response = await PATCH(createRequest({ title: 'Updated' }), { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns 400 when no fields to update', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAdminUser },
        error: null,
      })
      mockQueryBuilder.single.mockResolvedValue({
        data: mockAdminProfile,
        error: null,
      })

      const response = await PATCH(createRequest({}), { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('No fields to update')
    })

    it('updates ticket successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAdminUser },
        error: null,
      })

      // Profile check
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: mockAdminProfile,
        error: null,
      })

      // Update returns updated ticket
      const updatedTicket = { ...mockTicket, title: 'Updated Title' }
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: updatedTicket,
        error: null,
      })

      const response = await PATCH(
        createRequest({ title: 'Updated Title' }),
        { params: mockParams }
      )
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.ticket.title).toBe('Updated Title')
    })
  })

  describe('DELETE /api/admin/tickets/[id]', () => {
    const createRequest = () =>
      new Request('http://localhost/api/admin/tickets/ticket-1', {
        method: 'DELETE',
      })

    it('returns 400 when ticket is claimed', async () => {
      const mockParams = Promise.resolve({ id: 'ticket-claimed' })

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAdminUser },
        error: null,
      })

      // Profile check
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: mockAdminProfile,
        error: null,
      })

      // Ticket check - returns claimed ticket
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: mockClaimedTicket,
        error: null,
      })

      const response = await DELETE(createRequest(), { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Cannot delete')
    })

    it('deletes available ticket successfully', async () => {
      const mockParams = Promise.resolve({ id: 'ticket-1' })

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAdminUser },
        error: null,
      })

      // Profile check
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: mockAdminProfile,
        error: null,
      })

      // Ticket check - returns available ticket (with claimed_by: null and status: 'available')
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: { ...mockTicket, status: 'available', claimed_by: null },
        error: null,
      })

      // Delete succeeds - the delete chain doesn't call .single(), it just returns after .eq()
      // We need to mock the full chain: .delete().eq() returning { error: null }
      const mockDeleteChain = {
        eq: vi.fn().mockResolvedValue({ error: null }),
      }
      const mockFromForDelete = vi.fn(() => ({
        ...mockQueryBuilder,
        delete: vi.fn().mockReturnValue(mockDeleteChain),
      }))

      // Override schema mock for this specific call
      mockSupabase.schema.mockReturnValueOnce({ from: vi.fn(() => mockQueryBuilder) }) // profile
      mockSupabase.schema.mockReturnValueOnce({ from: vi.fn(() => mockQueryBuilder) }) // ticket check
      mockSupabase.schema.mockReturnValueOnce({ from: mockFromForDelete }) // delete

      const response = await DELETE(createRequest(), { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})
