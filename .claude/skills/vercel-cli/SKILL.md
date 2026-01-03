---
name: vercel-cli
description: Deploy and manage Vercel projects using the Vercel CLI. Use when deploying Next.js apps, checking deployment status, managing environment variables, linking projects, or any Vercel-related operations. Triggers on "deploy to vercel", "vercel deploy", "check deployment", "add env var to vercel", "link vercel project".
---

# Vercel CLI

## Quick Start

Deploy current directory to Vercel:
```bash
vercel
```

Deploy to production:
```bash
vercel --prod
```

## Common Operations

### Deploy

```bash
# Preview deployment (default)
vercel

# Production deployment
vercel --prod

# Deploy specific directory
vercel ./apps/web --prod

# Deploy without prompts (CI/CD)
vercel --yes --prod
```

### Link Project

```bash
# Link to existing Vercel project
vercel link

# Link with specific scope (team)
vercel link --scope my-team
```

### Environment Variables

```bash
# Add env var (prompted for value)
vercel env add VARIABLE_NAME

# Add for specific environment
vercel env add VARIABLE_NAME production
vercel env add VARIABLE_NAME preview
vercel env add VARIABLE_NAME development

# List env vars
vercel env ls

# Remove env var
vercel env rm VARIABLE_NAME

# Pull env vars to .env.local
vercel env pull
```

### Check Status

```bash
# List deployments
vercel ls

# Get deployment info
vercel inspect <deployment-url>

# View logs
vercel logs <deployment-url>
```

### Domains

```bash
# List domains
vercel domains ls

# Add domain
vercel domains add example.com

# Remove domain
vercel domains rm example.com
```

## Monorepo Deployment (pnpm workspaces)

**IMPORTANT**: For pnpm monorepos, you MUST deploy from the monorepo ROOT, not from the app subdirectory. This ensures:
- All workspace dependencies are available
- pnpm lockfile is used correctly
- Proper file tracing for serverless functions

### Required Setup

1. **vercel.json at monorepo root**:
```json
{
  "installCommand": "pnpm install",
  "buildCommand": "pnpm --filter web build",
  "outputDirectory": "apps/web/.next",
  "framework": "nextjs"
}
```

2. **next.config.ts in the app** (for Turbopack/Next.js 15+):
```typescript
import type { NextConfig } from "next";
import path from "path";

const monorepoRoot = path.resolve(__dirname, "../..");

const nextConfig: NextConfig = {
  env: {
    // Explicitly pass NEXT_PUBLIC_ vars for build
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  outputFileTracingRoot: monorepoRoot,
  turbopack: {
    root: monorepoRoot,
  },
};

export default nextConfig;
```

### Deploy Commands

```bash
# From monorepo root - preview deployment
vercel --yes

# From monorepo root - production deployment
vercel --prod --yes

# First deploy with env vars (if not set in Vercel dashboard)
vercel --prod --yes \
  --build-env NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co" \
  --build-env NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
```

### Add Permanent Env Vars

After first deploy, add env vars permanently so future deploys don't need flags:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
```

### Common Errors

- **EUNSUPPORTEDPROTOCOL workspace:***: Deploy from root, not app subdirectory
- **Only X files uploaded**: Deploy from root to include all monorepo files
- **Turbopack workspace root error**: Add turbopack.root to next.config.ts
- **NEXT_PUBLIC_ vars undefined at build**: Add to next.config.ts env block AND use --build-env or set in dashboard

## Authentication

```bash
# Login
vercel login

# Login with specific email
vercel login email@example.com

# Logout
vercel logout

# Check current user
vercel whoami
```

## Troubleshooting

- **Build fails**: Check `vercel logs <url>` for errors
- **Env vars not found**: Ensure vars are added for correct environment (production/preview/development)
- **Wrong project**: Run `vercel link` to re-link to correct project
