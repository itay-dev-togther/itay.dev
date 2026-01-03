---
name: supabase-patterns
description: Supabase patterns for server-side operations, webhooks, and bypassing RLS. Use when working with Supabase service role keys, SECURITY DEFINER functions, or webhook handlers.
---

# Supabase Patterns for Server-Side Operations

## The Problem: Server-Side Access Without User Session

When building webhooks or server-side operations (e.g., GitHub webhooks, payment webhooks), you need to access Supabase data without a user session. RLS policies block anonymous access.

## Key Insight: Supabase API Key Types

### Legacy JWT Keys (eyJ...)
- Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Work directly with PostgREST in `Authorization: Bearer` header
- Full database access when using `service_role` key
- **Available in**: Supabase Dashboard → Settings → API → Project API keys

### New Publishable/Secret Keys (sb_...)
- Format: `sb_secret_...` or `sb_publishable_...`
- Require Supabase gateway to mint temporary JWT
- **DO NOT work** directly in `Authorization: Bearer` header
- PostgREST returns 403 because it can't decode non-JWT values

## Solutions (Ranked by Preference)

### 1. SECURITY DEFINER Functions (Recommended)

Create PostgreSQL functions that run with owner privileges:

```sql
CREATE OR REPLACE FUNCTION itay.update_ticket_for_webhook(
  p_ticket_id UUID,
  p_status TEXT,
  p_pr_url TEXT DEFAULT NULL,
  p_pr_number INTEGER DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs as function owner, bypasses RLS
SET search_path = itay  -- Prevents search_path injection attacks
AS $$
BEGIN
  UPDATE tickets
  SET status = p_status,
      pr_url = COALESCE(p_pr_url, pr_url),
      pr_number = COALESCE(p_pr_number, pr_number),
      updated_at = NOW()
  WHERE id = p_ticket_id;

  RETURN FOUND;
END;
$$;

-- Grant execute to anon role
GRANT EXECUTE ON FUNCTION itay.update_ticket_for_webhook TO anon;
```

Call from code with anon key:
```typescript
const supabase = createClient(url, anonKey)
const { data, error } = await supabase
  .schema('itay')
  .rpc('update_ticket_for_webhook', {
    p_ticket_id: ticketId,
    p_status: 'in_review',
    p_pr_url: prUrl,
    p_pr_number: prNumber,
  })
```

**Why this is secure:**
- Callers can only do what the function allows
- No direct table access
- Limited, auditable operations
- If key is leaked, attackers can only call these specific functions

### 2. Supabase Edge Functions

If you can use Supabase Edge Functions instead of Vercel/external serverless:

```typescript
// supabase/functions/my-webhook/index.ts
Deno.serve(async (req) => {
  // Supabase auto-injects these as legacy JWT keys
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!  // Legacy JWT, works!
  )

  // Full database access, bypasses RLS
  await supabase.from('tickets').update({...})
})
```

### 3. Legacy Service Role Key (Use Sparingly)

If you must use the legacy JWT service role key:

1. Get it from Supabase Dashboard → Settings → API → `service_role` (not the `sb_secret_` one)
2. Store in environment variable
3. **Never expose to client**

```typescript
const supabase = createClient(url, legacyServiceRoleKey)
// Full access, bypasses RLS
```

## Custom Schema Considerations

When using a custom schema (not `public`):

```typescript
// Must specify schema for every query
const { data } = await supabase
  .schema('itay')  // Required!
  .from('tickets')
  .select('*')

// For RPC calls
const { data } = await supabase
  .schema('itay')
  .rpc('my_function', { params })
```

## Common Errors

### 403 Forbidden from PostgREST
- **Cause**: Using `sb_secret_` key in `Authorization: Bearer` header
- **Fix**: Use SECURITY DEFINER functions with anon key, or use legacy JWT key

### "permission denied for schema"
- **Cause**: Schema not granted to role
- **Fix**: `GRANT USAGE ON SCHEMA itay TO anon;`

### RPC function not found
- **Cause**: Function not in search_path or not granted
- **Fix**: Use `.schema('your_schema').rpc(...)` and grant execute permission

## Project-Specific: itay.dev Webhook Functions

Located in migration `add_webhook_functions`:
- `itay.get_ticket_by_branch(p_branch_name)` - Find ticket by branch
- `itay.update_ticket_for_webhook(...)` - Update ticket status/PR info
- `itay.create_contribution_for_webhook(...)` - Create contribution record

Service client: `apps/web/src/lib/supabase/service.ts`
