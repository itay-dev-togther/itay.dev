---
name: deploy
description: Deploy the itay.dev frontend to Vercel. Use when user says "deploy", "push to production", "deploy frontend", or "/deploy".
---

# Deploy Frontend to Vercel

This skill deploys the itay.dev Next.js frontend to Vercel.

## Quick Deploy (Production)

From the monorepo root:
```bash
vercel --prod --yes
```

## Preview Deploy

From the monorepo root:
```bash
vercel --yes
```

## Important Notes

1. **Always deploy from monorepo root** - Never from `apps/web`
2. **Env vars are configured** - No need for `--build-env` flags anymore
3. **vercel.json handles everything** - Uses `pnpm --filter web build`

## After Deployment

The frontend will be available at: https://itay-dev.vercel.app

Check deployment status:
```bash
vercel ls
```

View logs if issues:
```bash
vercel logs <deployment-url>
```

## Current Configuration

- **Framework**: Next.js 16 with Turbopack
- **Build command**: `pnpm --filter web build`
- **Output**: `apps/web/.next`
- **Install**: `pnpm install`
