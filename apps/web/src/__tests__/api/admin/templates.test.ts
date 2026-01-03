import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import {
  mockAdminUser,
  mockContributorUser,
  mockAdminProfile,
  mockContributorProfile,
  mockTemplate,
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
  order: vi.fn().mockReturnThis(),
  single: vi.fn(),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

// Import after mocking
import { GET, POST } from '@/app/api/admin/templates/route'

describe('Templates API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.schema.mockReturnValue({ from: vi.fn(() => mockQueryBuilder) })
  })

  describe('GET /api/admin/templates', () => {
    it('returns 401 when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns 403 when user is not admin', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockContributorUser },
        error: null,
      })
      mockQueryBuilder.single.mockResolvedValue({
        data: mockContributorProfile,
        error: null,
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Admin access required')
    })

    it('returns templates when user is admin', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAdminUser },
        error: null,
      })

      // First call for profile check
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: mockAdminProfile,
        error: null,
      })

      // Second call returns templates list (no .single())
      mockQueryBuilder.order.mockResolvedValueOnce({
        data: [mockTemplate],
        error: null,
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.templates).toEqual([mockTemplate])
    })
  })

  describe('POST /api/admin/templates', () => {
    it('returns 401 when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      const request = new Request('http://localhost/api/admin/templates', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Template' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns 400 when name is missing', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAdminUser },
        error: null,
      })
      mockQueryBuilder.single.mockResolvedValue({
        data: mockAdminProfile,
        error: null,
      })

      const request = new Request('http://localhost/api/admin/templates', {
        method: 'POST',
        body: JSON.stringify({ description: 'No name' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Name is required')
    })

    it('creates template when valid data provided', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAdminUser },
        error: null,
      })

      // Profile check
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: mockAdminProfile,
        error: null,
      })

      // Insert returns new template
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: mockTemplate,
        error: null,
      })

      const request = new Request('http://localhost/api/admin/templates', {
        method: 'POST',
        body: JSON.stringify({
          name: 'React CRUD Template',
          description: 'A template for CRUD apps',
          difficulty: 'beginner',
          tech_stack: ['React', 'TypeScript'],
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.template).toEqual(mockTemplate)
    })
  })
})
