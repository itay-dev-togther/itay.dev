---
name: testing
description: Vitest testing patterns for Next.js API routes, flow tests, and Supabase mocking. Use when writing tests, setting up test fixtures, or debugging test failures.
---

# Testing with Vitest

## Configuration

Located at `apps/web/vitest.config.ts`:
- Environment: `happy-dom`
- Path alias: `@/` → `./src/`
- Setup file: `./src/__tests__/setup.ts`

## Running Tests

```bash
# From root
pnpm test           # Run all tests once
pnpm test:watch     # Watch mode

# From apps/web
pnpm test           # Run once
pnpm test:watch     # Watch mode
pnpm test:coverage  # With coverage report
```

## Test Directory Structure

```
apps/web/src/__tests__/
├── setup.ts              # Global mocks (Next.js navigation, headers)
├── utils/
│   └── mocks.ts          # Mock data factories and Supabase mock
├── api/
│   └── admin/
│       ├── templates.test.ts
│       └── tickets.test.ts
└── flows/
    └── ticket-claim.test.ts
```

## Supabase Mocking Pattern

The standard pattern for mocking Supabase in API tests:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Create mock before importing the module under test
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
  is: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  single: vi.fn(),
}

// Mock the module
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

// Import the route handler AFTER mocking
import { GET, POST } from '@/app/api/admin/templates/route'

describe('My API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.schema.mockReturnValue({
      from: vi.fn(() => mockQueryBuilder)
    })
  })

  // Tests here...
})
```

## Mock Data Factories

Located at `src/__tests__/utils/mocks.ts`:

```typescript
import { mockAdminUser, mockContributorUser } from '../utils/mocks'
import { mockAdminProfile, mockContributorProfile } from '../utils/mocks'
import { mockProject, mockTicket, mockTemplate } from '../utils/mocks'
import { mockClaimedTicket } from '../utils/mocks'
```

### Available Mocks

| Mock | Description |
|------|-------------|
| `mockAdminUser` | User object with `is_admin: true` profile |
| `mockContributorUser` | Regular contributor user object |
| `mockAdminProfile` | Profile with `is_admin: true` |
| `mockContributorProfile` | Profile with `is_admin: false` |
| `mockProject` | Sample project entity |
| `mockTicket` | Available ticket (not claimed) |
| `mockClaimedTicket` | Ticket with `claimed_by` set |
| `mockTemplate` | Project template entity |

## Testing API Routes

### Basic Auth Test

```typescript
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
```

### Admin Authorization Test

```typescript
it('returns 403 when user is not admin', async () => {
  mockSupabase.auth.getUser.mockResolvedValue({
    data: { user: mockContributorUser },
    error: null,
  })
  mockQueryBuilder.single.mockResolvedValue({
    data: mockContributorProfile,  // is_admin: false
    error: null,
  })

  const response = await GET()
  expect(response.status).toBe(403)
})
```

### Sequential Mock Responses

When a route makes multiple DB calls, use `mockResolvedValueOnce`:

```typescript
it('creates resource with multiple DB calls', async () => {
  // First call: auth check
  mockSupabase.auth.getUser.mockResolvedValue({
    data: { user: mockAdminUser },
    error: null,
  })

  // First .single() call: profile check
  mockQueryBuilder.single.mockResolvedValueOnce({
    data: mockAdminProfile,
    error: null,
  })

  // Second .single() call: insert returns new resource
  mockQueryBuilder.single.mockResolvedValueOnce({
    data: { id: 'new-resource' },
    error: null,
  })

  const response = await POST(createRequest({ name: 'Test' }))
  expect(response.status).toBe(201)
})
```

### Testing DELETE with Custom Chain

Delete operations need special chain mocking:

```typescript
it('deletes resource successfully', async () => {
  // Setup auth mocks...

  // Mock delete chain: .delete().eq() returns { error: null }
  const mockDeleteChain = {
    eq: vi.fn().mockResolvedValue({ error: null }),
  }
  const mockFromForDelete = vi.fn(() => ({
    ...mockQueryBuilder,
    delete: vi.fn().mockReturnValue(mockDeleteChain),
  }))

  mockSupabase.schema.mockReturnValueOnce({ from: mockFromForDelete })

  const response = await DELETE(request, { params })
  expect(response.status).toBe(200)
})
```

## Testing Flow (Multi-Step)

Flow tests verify complete user journeys:

```typescript
// flows/ticket-claim.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock feature flags
vi.mock('@/lib/flags', () => ({
  flags: {
    skipAuth: false,
    skipGitHub: true,  // Skip real GitHub calls
    testUserId: null,
  },
}))

// Mock external services
vi.mock('@/lib/github/client', () => ({
  createBranch: vi.fn().mockResolvedValue({ ref: 'refs/heads/test-branch' }),
  GITHUB_OWNER: 'itay-dev',
}))

describe('Ticket Claim Flow', () => {
  it('allows claiming available ticket', async () => {
    // 1. Setup: user is authenticated
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockContributorUser },
      error: null,
    })

    // 2. Ticket is available
    mockQueryBuilder.single.mockResolvedValueOnce({
      data: { ...mockTicket, status: 'available', projects: mockProject },
      error: null,
    })

    // 3. User profile exists
    mockQueryBuilder.single.mockResolvedValueOnce({
      data: { id: mockContributorUser.id, github_username: 'testuser' },
      error: null,
    })

    // 4. Update returns claimed ticket
    mockQueryBuilder.single.mockResolvedValueOnce({
      data: { ...mockTicket, status: 'claimed', claimed_by: mockContributorUser.id },
      error: null,
    })

    const response = await POST(createRequest('ticket-1'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ticket.status).toBe('claimed')
  })
})
```

## Common Patterns

### Creating Request Objects

```typescript
const createRequest = (body: object) =>
  new Request('http://localhost/api/endpoint', {
    method: 'POST',
    body: JSON.stringify(body),
  })

// For routes with params
const mockParams = Promise.resolve({ id: 'resource-id' })
const response = await PATCH(createRequest(body), { params: mockParams })
```

### Testing Error Responses

```typescript
it('returns specific error for business rule violation', async () => {
  // Setup mocks for the error condition...

  const response = await POST(createRequest({ invalid: 'data' }))
  const data = await response.json()

  expect(response.status).toBe(400)
  expect(data.error).toContain('expected error message')
})
```

## Debugging Tests

### See Mock Call History

```typescript
console.log(mockQueryBuilder.single.mock.calls)
console.log(mockSupabase.schema.mock.calls)
```

### Check Why Mock Didn't Match

```typescript
expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'expected-id')
```

### Run Single Test

```bash
pnpm test -- -t "test name pattern"
pnpm test -- src/__tests__/api/admin/templates.test.ts
```

## Test File Naming

- Unit tests: `*.test.ts` in same directory as implementation, or in `__tests__/`
- API route tests: `__tests__/api/[route-path].test.ts`
- Flow tests: `__tests__/flows/[flow-name].test.ts`
- Component tests: `__tests__/components/[component-name].test.tsx`

## Adding New Tests

1. Create test file following naming convention
2. Import mocks from `../utils/mocks` (adjust path as needed)
3. Mock Supabase client before importing route handler
4. Use `beforeEach` to reset mocks
5. Follow auth → permission → business logic test ordering
