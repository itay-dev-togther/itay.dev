---
project_name: 'itay-collab-platform'
user_name: 'yaniv'
date: '2026-01-02'
sections_completed: ['discovery', 'technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality', 'workflow_rules', 'critical_rules']
status: 'complete'
rule_count: 45
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### Core Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14 | Frontend framework (App Router) |
| TypeScript | 5.x (strict) | Language |
| Hono | latest | API framework on Cloudflare Workers |
| Supabase | latest | PostgreSQL + Auth (Google OAuth) |

### Frontend
| Technology | Purpose |
|------------|---------|
| Chakra UI | UI component library |
| Zustand | Client-side state management |
| SWR | Server state / data fetching |
| React Hook Form | Form handling |
| Zod | Schema validation |

### Backend / Infrastructure
| Technology | Purpose |
|------------|---------|
| Cloudflare Workers | API hosting (V8 runtime) |
| Cloudflare Queues | Async job processing (AI reviews) |
| Cloudflare KV | Session storage |
| Supabase PostgreSQL | Primary database |
| Supabase Auth | Google OAuth authentication |

### Development Tools
| Tool | Purpose |
|------|---------|
| pnpm | Package manager (workspaces) |
| Bun | Local dev speedup (optional) |
| Wrangler | Cloudflare deployment CLI |
| Playwright | E2E testing |

### MCP Servers (AI-Assisted Development)
| Server | Purpose |
|--------|---------|
| Cloudflare MCP | Workers, KV, Queues management |
| Supabase MCP | Database queries, auth debugging |
| GitHub MCP | Repo management, webhooks |

### Version Constraints
- Cloudflare Workers use V8 runtime (not Node.js/Bun in production)
- Supabase types must be regenerated after schema changes: `npx supabase gen types typescript`
- Next.js 14 requires App Router patterns (not Pages Router)

## Critical Implementation Rules

### TypeScript Rules

**Strict Mode Requirements:**
- `strict: true` in all tsconfig.json files
- No `any` types - use `unknown` and narrow with type guards
- All functions must have explicit return types
- No implicit `this` binding

**Import Order (enforced):**
```typescript
// 1. External packages
import { Hono } from 'hono'
import { z } from 'zod'

// 2. Internal packages (@shared)
import type { Ticket } from '@shared/types'

// 3. Local imports (relative)
import { claimTicket } from './services/tickets'
```

**Type Organization:**
- Generated types: `packages/shared/src/types/database.ts`
- Domain types: One file per domain (`user.ts`, `ticket.ts`, `project.ts`)
- API types: `types/api/requests.ts`, `types/api/responses.ts`, `types/api/errors.ts`
- Always re-export from `types/index.ts`

**Type Patterns:**
```typescript
// Extend Supabase generated types
type TicketRow = Database['public']['Tables']['tickets']['Row']

export interface Ticket extends TicketRow {
  project?: Project  // Add relations
}

// Use const assertions for literals
export type TicketStatus = 'available' | 'claimed' | 'in_review' | 'done'
```

**Error Handling:**
- Use typed error codes: `ErrorCode` type from `@shared/types/api/errors`
- Never throw raw strings - use structured error objects
- API errors: `{ error: { code: ErrorCode, message: string } }`

**Async Patterns:**
- Prefer `async/await` over `.then()` chains
- Always handle errors with try/catch or `.catch()`
- Use `Promise.all()` for parallel operations

### Framework-Specific Rules

#### Next.js 14 (App Router)

**Route Organization:**
- Use route groups: `(public)/` for unauthenticated, `(dashboard)/` for authenticated
- Page files: `page.tsx` only - no `index.tsx`
- Layouts: `layout.tsx` for shared UI per route group
- Loading states: `loading.tsx` for Suspense boundaries

**Client vs Server Components:**
- Default to Server Components
- Add `'use client'` only when needed (hooks, event handlers, browser APIs)
- Keep client components small and leaf-level
- Never import server-only code in client components

**Data Fetching:**
- Server Components: Direct Supabase queries or fetch
- Client Components: SWR hooks for data fetching
- No `getServerSideProps` or `getStaticProps` (App Router patterns only)

#### Hono (Cloudflare Workers)

**Route Structure:**
```typescript
const app = new Hono()
app.get('/', async (c) => { /* handler */ })
export default app
```

**Middleware Order:** CORS → Auth → Admin (if needed)

**Environment Access:**
```typescript
const db = c.env.DB      // D1
const kv = c.env.KV      // KV namespace
const queue = c.env.QUEUE // Queue
```

#### Chakra UI

- Use Chakra's built-in components, don't recreate
- Use Chakra props, not inline styles: `<Box p={4}>` not `style={{ padding: 16 }}`
- Use `useColorModeValue` for dark mode support

#### Zustand

**Store Organization:** One store per feature domain (`stores/auth/`, `stores/ui/`)

**Store Pattern:**
```typescript
interface State { /* state */ }
interface Actions { /* actions */ }
type Store = State & Actions

export const useStore = create<Store>((set) => ({
  ...initialState,
  action: () => set({ /* update */ }),
  reset: () => set(initialState),
}))
```

#### SWR

**Always handle all states:**
```typescript
const { data, error, isLoading } = useSWR('/api/tickets')
if (isLoading) return <Skeleton />
if (error) return <ErrorState />
if (!data?.length) return <EmptyState />
return <TicketList tickets={data} />
```

### Testing Rules

**Test File Organization:**
- Unit tests: Co-located with source (`Button.test.tsx` next to `Button.tsx`)
- Integration tests: `apps/api/tests/integration/`
- E2E tests: `apps/web/e2e/`
- Shared test utilities: `packages/shared/src/test-utils/`

**File Naming:**
- Unit tests: `*.test.ts` or `*.test.tsx`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.e2e.test.ts`

**Test Structure (AAA Pattern):**
```typescript
describe('claimTicket', () => {
  it('should claim an available ticket', async () => {
    // Arrange
    const ticket = createMockTicket({ status: 'available' })

    // Act
    const result = await claimTicket(ticket.id, userId)

    // Assert
    expect(result.status).toBe('claimed')
  })
})
```

**Mock Patterns:**
- Use shared mocks from `@shared/test-utils/mocks`
- Mock Supabase client for unit tests
- Mock external APIs (GitHub, OpenRouter)
- Never mock what you're testing

**What to Test:**
- Services: Business logic, error handling, edge cases
- Components: User interactions, state changes, accessibility
- API routes: Request validation, response format, auth

**What NOT to Test:**
- Chakra UI components themselves
- Supabase client internals
- Third-party library behavior

### Code Quality & Style Rules

**Naming Conventions:**

| Element | Convention | Example |
|---------|------------|---------|
| Files (components) | PascalCase | `TicketCard.tsx` |
| Files (utilities) | camelCase | `formatDate.ts` |
| Components | PascalCase | `TicketCard` |
| Functions | camelCase | `claimTicket` |
| Variables | camelCase | `ticketId` |
| Types/Interfaces | PascalCase | `Ticket`, `ApiResponse` |
| Constants | SCREAMING_SNAKE | `MAX_RETRIES` |
| DB tables | snake_case, plural | `users`, `project_templates` |
| DB columns | snake_case | `created_at`, `claimed_by` |
| API routes | kebab-case, plural | `/api/projects` |
| API JSON fields | camelCase | `{ userId, createdAt }` |

**Component Folder Structure:**
```
ComponentName/
  ComponentName.tsx       # Component
  ComponentName.test.tsx  # Tests
  index.ts               # Export
```

**API Response Format:**
```typescript
// Success
{ data: { ... } }
{ data: [...], meta: { total: 50, page: 1 } }

// Error
{ error: { code: "TICKET_ALREADY_CLAIMED", message: "..." } }
```

**HTTP Status Codes:**
- 200: Success (GET, PUT)
- 201: Created (POST)
- 400: Validation error
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 409: Conflict (e.g., already claimed)
- 500: Server error

**Feature Flags:**
- Check `isFeatureEnabled('FEATURE_NAME')` before implementing post-MVP features
- MVP features: `true` in `packages/shared/src/config/features.ts`
- Post-MVP features: `false` - do not implement unless flag is enabled

### Development Workflow Rules

**Git Branch Naming:**
- Feature branches: `itay-{ticket-id}-{short-desc}` (auto-created by platform)
- Manual branches: `feat/description`, `fix/description`, `chore/description`

**Commit Message Format:**
```
<type>: <short description>

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```
Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

**PR Requirements:**
- All tests must pass
- AI code review approval (for community projects)
- Squash merge to main

**Monorepo Commands:**
```bash
pnpm install              # Install all dependencies
pnpm -F web dev           # Run frontend dev server
pnpm -F api dev           # Run API locally (wrangler)
pnpm -F shared build      # Build shared package

# Bun (local dev speedup - optional)
bun install
bun run --filter web dev
```

**Deployment:**
- Frontend (Vercel): Auto-deploy on push to main
- API (Cloudflare): `wrangler deploy` or GitHub Actions
- Database: Supabase dashboard or CLI

**Environment Variables:**
- Frontend: `NEXT_PUBLIC_*` prefix for client-side
- API: Secrets via `wrangler secret put`
- Local: `.env.local` (gitignored)

### Critical Don't-Miss Rules

**Anti-Patterns to AVOID:**
- ❌ Never use `any` type - use `unknown` and narrow
- ❌ Never store secrets in code or `.env` files committed to git
- ❌ Never use `getServerSideProps`/`getStaticProps` - App Router only
- ❌ Never import server-only code in `'use client'` components
- ❌ Never skip error handling in async operations
- ❌ Never implement post-MVP features without checking feature flags
- ❌ Never use inline styles - use Chakra props
- ❌ Never mutate Zustand state directly - use `set()`

**Edge Cases to Handle:**
- GitHub webhook missed → Polling fallback (check PRs every 5 min)
- AI review timeout → Queue retry, show "Review pending"
- GitHub API rate limit → Graceful degradation, exponential backoff
- Supabase connection lost → Show user-friendly error, retry option
- Ticket already claimed (race condition) → Return 409, show friendly message

**Security Rules:**
- API keys NEVER in frontend code
- Use Supabase RLS for row-level security
- Validate all inputs with Zod on API routes
- Sanitize user content before display
- Use HTTP-only cookies for sessions (not localStorage)
- Admin routes require role check middleware

**"Guided Reality" Philosophy:**
- Every automated action must include micro-copy explaining what happened
- Example: "✓ Branch created (branches keep your work separate)"
- Never silently succeed - users should understand what the platform did
- Celebrations for milestones (PR merged → confetti!)
- Kind, encouraging AI feedback - never condescending

**Supabase-Specific:**
- Always regenerate types after schema changes
- Use `@supabase/ssr` for Next.js, not raw `@supabase/supabase-js`
- Row Level Security (RLS) enabled - queries respect user context
- Service role key ONLY in API (Cloudflare Workers), never frontend

**Cloudflare Workers Gotchas:**
- No Node.js built-ins (use Web APIs or polyfills)
- V8 runtime, not Node.js/Bun in production
- `c.env` for bindings, not `process.env`
- 128MB memory limit - stream large responses

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Reference architecture.md for detailed decisions

**For Humans:**
- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

---

**Last Updated:** 2026-01-02
