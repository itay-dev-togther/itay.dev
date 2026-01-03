import { vi } from 'vitest'

// Mock user data
export const mockAdminUser = {
  id: 'admin-user-id',
  email: 'admin@test.com',
  user_metadata: {
    name: 'Admin User',
    avatar_url: 'https://example.com/avatar.jpg',
  },
}

export const mockContributorUser = {
  id: 'contributor-user-id',
  email: 'contributor@test.com',
  user_metadata: {
    name: 'Contributor User',
    avatar_url: null,
  },
}

export const mockAdminProfile = {
  id: 'admin-user-id',
  email: 'admin@test.com',
  name: 'Admin User',
  role: 'admin',
}

export const mockContributorProfile = {
  id: 'contributor-user-id',
  email: 'contributor@test.com',
  name: 'Contributor User',
  role: 'contributor',
}

// Mock project data
export const mockProject = {
  id: 'project-1',
  name: 'Test Project',
  description: 'A test project description',
  difficulty: 'beginner',
  tech_stack: ['React', 'TypeScript'],
  status: 'active',
  github_repo_url: 'https://github.com/itay-dev/test-project',
  github_repo_name: 'itay-dev/test-project',
  template_id: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

export const mockDraftProject = {
  ...mockProject,
  id: 'project-draft',
  name: 'Draft Project',
  status: 'draft',
  github_repo_url: null,
  github_repo_name: null,
}

// Mock ticket data
export const mockTicket = {
  id: 'ticket-1',
  project_id: 'project-1',
  title: 'Test Ticket',
  description: 'A test ticket description',
  acceptance_criteria: '- [ ] Criteria 1\n- [ ] Criteria 2',
  difficulty: 'beginner',
  status: 'available',
  claimed_by: null,
  claimed_at: null,
  branch_name: null,
  pr_url: null,
  pr_number: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

export const mockClaimedTicket = {
  ...mockTicket,
  id: 'ticket-claimed',
  title: 'Claimed Ticket',
  status: 'claimed',
  claimed_by: 'contributor-user-id',
  claimed_at: '2024-01-02T00:00:00Z',
  branch_name: 'itay-ticket-claimed-claimed-ticket',
}

// Mock template data
export const mockTemplate = {
  id: 'template-1',
  name: 'React CRUD Template',
  description: 'A template for CRUD apps',
  difficulty: 'beginner',
  tech_stack: ['React', 'TypeScript', 'Tailwind'],
  default_tickets: [
    {
      title: 'Set up project',
      description: 'Initialize the project',
      acceptance_criteria: '- [ ] Done',
      difficulty: 'beginner',
    },
  ],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

// Create a mock Supabase client
export function createMockSupabaseClient(options: {
  user?: typeof mockAdminUser | typeof mockContributorUser | null
  profile?: typeof mockAdminProfile | typeof mockContributorProfile | null
}) {
  const { user = null, profile = null } = options

  const mockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  }

  const mockSchema = {
    from: vi.fn(() => mockQueryBuilder),
  }

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: user ? null : { message: 'Not authenticated' },
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    schema: vi.fn(() => mockSchema),
    from: vi.fn(() => mockQueryBuilder),
    // Expose for test assertions
    _mockQueryBuilder: mockQueryBuilder,
    _mockSchema: mockSchema,
  }
}

// Helper to mock fetch responses
export function mockFetchResponse(data: unknown, options: { ok?: boolean; status?: number } = {}) {
  const { ok = true, status = 200 } = options
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
  })
}

// Helper to mock fetch error
export function mockFetchError(message: string, status = 500) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: vi.fn().mockResolvedValue({ error: message }),
    text: vi.fn().mockResolvedValue(JSON.stringify({ error: message })),
  })
}
