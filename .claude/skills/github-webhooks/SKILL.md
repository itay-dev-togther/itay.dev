---
name: github-webhooks
description: GitHub webhook setup and handling patterns. Use when implementing PR/issue webhooks, verifying signatures, or debugging webhook issues.
---

# GitHub Webhooks Setup

## Creating Webhooks Programmatically

Using Octokit:
```typescript
import { Octokit } from '@octokit/rest'

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

await octokit.repos.createWebhook({
  owner: 'org-name',
  repo: 'repo-name',
  config: {
    url: 'https://your-app.vercel.app/api/webhooks/github',
    content_type: 'json',
    secret: process.env.GITHUB_WEBHOOK_SECRET,
  },
  events: ['pull_request'],
  active: true,
})
```

Using gh CLI:
```bash
gh api repos/OWNER/REPO/hooks \
  --method POST \
  --input - <<'EOF'
{
  "name": "web",
  "active": true,
  "events": ["pull_request"],
  "config": {
    "url": "https://your-app.vercel.app/api/webhooks/github",
    "content_type": "json",
    "secret": "your-webhook-secret"
  }
}
EOF
```

## Webhook Handler (Next.js)

```typescript
// app/api/webhooks/github/route.ts
import { NextResponse } from 'next/server'
import crypto from 'crypto'

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET

function verifySignature(payload: string, signature: string | null): boolean {
  if (!WEBHOOK_SECRET || !signature) return false

  const sig = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')

  const expected = `sha256=${sig}`

  if (expected.length !== signature.length) return false

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  )
}

export async function POST(request: Request) {
  const payload = await request.text()
  const signature = request.headers.get('x-hub-signature-256')
  const event = request.headers.get('x-github-event')

  // Verify signature
  if (WEBHOOK_SECRET && !verifySignature(payload, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // Parse and handle event
  const data = JSON.parse(payload)

  if (event === 'pull_request') {
    const { action, pull_request } = data
    // action: opened, closed, reopened, synchronize, etc.
    // pull_request.head.ref = branch name
    // pull_request.merged = true/false (when action=closed)
  }

  return NextResponse.json({ success: true })
}
```

## PR Event Actions

| Action | When |
|--------|------|
| `opened` | New PR created |
| `reopened` | Closed PR reopened |
| `closed` | PR closed (check `merged` field) |
| `synchronize` | New commits pushed |
| `edited` | Title/body changed |

## Debugging Webhooks

### List webhooks on a repo:
```bash
gh api repos/OWNER/REPO/hooks
```

### Check recent deliveries:
```bash
gh api repos/OWNER/REPO/hooks/HOOK_ID/deliveries
```

### Redeliver a webhook:
```bash
gh api repos/OWNER/REPO/hooks/HOOK_ID/deliveries/DELIVERY_ID/attempts --method POST
```

### Test with ping:
```bash
gh api repos/OWNER/REPO/hooks/HOOK_ID/pings --method POST
```

### Trigger PR event manually:
```bash
gh pr close 1 --repo OWNER/REPO && gh pr reopen 1 --repo OWNER/REPO
```

## Common Issues

### Webhook not triggering
1. Check if webhook exists: `gh api repos/OWNER/REPO/hooks`
2. Check if it's active: look for `"active": true`
3. Check deliveries for errors

### 401 Invalid signature
- Ensure `GITHUB_WEBHOOK_SECRET` matches the secret configured on GitHub
- Check for whitespace issues in the secret
- Verify you're reading the raw body (not parsed JSON)

### Webhook exists but no deliveries
- The event type might not be in the `events` array
- The action might not trigger the webhook (e.g., draft PRs)

## Project-Specific: itay.dev

- Webhook URL: `https://itay-dev.vercel.app/api/webhooks/github`
- Handler: `apps/web/src/app/api/webhooks/github/route.ts`
- Auto-configured in: `apps/web/src/app/api/admin/projects/create-repo/route.ts`
- Uses SECURITY DEFINER functions for database updates (see `supabase-patterns` skill)
