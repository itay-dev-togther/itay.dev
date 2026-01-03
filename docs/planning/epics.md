---
stepsCompleted: [1, 2, 3, 4]
status: 'complete'
inputDocuments:
  - "planning-artifacts/prd.md"
  - "planning-artifacts/architecture.md"
  - "planning-artifacts/ux-design-specification.md"
project_name: 'itay-collab-platform'
date: '2026-01-02'
mode: 'slim-solo-dev'
---

# Itay.dev - Epic Breakdown

## Overview

Lean epics and stories for solo dev + AI implementation. Each story is scoped for a single Claude Code session.

## Requirements Inventory

### Functional Requirements

- FR1: Users can sign in with Google OAuth
- FR2: Users can view their contributor profile
- FR3: Users can see their contribution history (PRs merged, tickets completed)
- FR4: Users can browse available projects
- FR5: Users can view project details (description, difficulty level, tech stack)
- FR6: Users can see project status (active, completed)
- FR7: Users can view all tickets for a project
- FR8: Users can claim an available ticket
- FR9: Users can see ticket status (available, claimed, in progress, done)
- FR10: Users can get AI assistance inline while working on a ticket
- FR11: Users can link a GitHub PR to their claimed ticket
- FR12: Users can receive AI code review feedback on their PR
- FR13: System tracks when PRs are merged and updates ticket status
- FR14: Users can see their contributions reflected on their profile
- FR15: Admin can create and manage project templates
- FR16: Admin can generate new projects from templates using AI
- FR17: Admin can review and edit AI-generated project specs
- FR18: Admin can publish projects to make them available to contributors
- FR19: Admin can view all contributor activity
- FR20: Admin can edit ticket descriptions
- FR21: Admin can manage project visibility and status

### Non-Functional Requirements

- NFR1: Page load time < 3 seconds
- NFR2: AI code review response < 30 seconds (async OK)
- NFR3: Ticket/project browsing < 1 second
- NFR4: Uptime 99.5%
- NFR5: GitHub sync resilient to API hiccups
- NFR6: No lost contributions (data persistence)
- NFR7: Google OAuth (no password storage)
- NFR8: HTTPS everywhere
- NFR9: API keys stored securely, never exposed
- NFR10: ~50 concurrent users initial capacity
- NFR11: Architecture designed for 10x growth
- NFR12: WCAG 2.1 AA accessibility
- NFR13: Graceful handling of GitHub rate limits/outages
- NFR14: Fallback if OpenRouter model unavailable

### Additional Requirements (from Architecture)

**Starter/Setup:**
- Monorepo with pnpm workspaces (apps/web, apps/api, packages/shared)
- Next.js 14 with App Router + Chakra UI
- Hono on Cloudflare Workers
- Supabase PostgreSQL + Auth + generated TypeScript types

**Infrastructure:**
- Cloudflare Workers, Queues (async AI review), KV (sessions)
- Vercel for frontend hosting
- MCP servers: Cloudflare, Supabase, GitHub

**GitHub Integration:**
- GitHub App for repo control
- Webhook handlers for push, PR events
- Auto-create branches on ticket claim
- Add/remove collaborators programmatically

**Patterns:**
- Feature flags for MVP vs post-MVP
- Zustand stores by feature domain
- SWR for data fetching
- Zod for API validation

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | 1 | Google OAuth sign-in |
| FR2 | 1 | View contributor profile |
| FR3 | 3 | Contribution history |
| FR4 | 2 | Browse projects |
| FR5 | 2 | View project details |
| FR6 | 2 | See project status |
| FR7 | 2 | View tickets for project |
| FR8 | 3 | Claim ticket |
| FR9 | 2 | See ticket status |
| FR10 | 3 | AI assistance inline |
| FR11 | 3 | Link GitHub PR |
| FR12 | 3 | AI code review |
| FR13 | 3 | PR merge tracking |
| FR14 | 3 | Profile contributions |
| FR15 | 4 | Create project templates |
| FR16 | 4 | AI generate projects |
| FR17 | 4 | Review/edit AI specs |
| FR18 | 4 | Publish projects |
| FR19 | 4 | View contributor activity |
| FR20 | 4 | Edit ticket descriptions |
| FR21 | 4 | Manage project visibility |

## Epic List

### Epic 1: Foundation & Authentication
Users can register with Google OAuth and have a basic profile.
**FRs covered:** FR1, FR2
**Scope:** Monorepo setup, Next.js + Hono skeleton, Supabase auth, basic profile page.

### Epic 2: Project & Ticket Discovery
Users can browse projects and view available tickets.
**FRs covered:** FR4, FR5, FR6, FR7, FR9
**Scope:** Project list, project detail pages, ticket board with status display.

### Epic 3: Contributor Workflow
Users can claim tickets, get AI help, submit PRs, receive AI review, and track contributions.
**FRs covered:** FR3, FR8, FR10, FR11, FR12, FR13, FR14
**Scope:** Ticket claiming, AI assistance, GitHub PR integration, AI code review (Cloudflare Queue), contribution tracking, profile history.

### Epic 4: Admin Panel
Admin can generate projects from templates, manage tickets, and oversee contributors.
**FRs covered:** FR15, FR16, FR17, FR18, FR19, FR20, FR21
**Scope:** Template management, AI project generation (OpenRouter), publish workflow, contributor oversight, ticket editing.

---

## Epic 1: Foundation & Authentication

**Goal:** Users can register with Google OAuth and have a basic profile.
**FRs:** FR1, FR2 | **NFRs:** NFR7, NFR8

### Story 1.1: Monorepo Setup & Dev Environment

As a **developer**,
I want a **properly configured monorepo with all tooling**,
So that **I can start building features immediately**.

**Acceptance Criteria:**

**Given** a fresh clone of the repository
**When** I run `pnpm install`
**Then** all dependencies install successfully
**And** `pnpm -F web dev` starts Next.js on localhost:3000
**And** `pnpm -F api dev` starts Hono via wrangler on localhost:8787
**And** TypeScript strict mode is enabled across all packages
**And** shared package exports types correctly to web and api

### Story 1.2: Google OAuth Authentication

As a **contributor**,
I want to **sign in with my Google account**,
So that **I can access the platform without creating another password**.

**Acceptance Criteria:**

**Given** I am on the landing page
**When** I click "Sign in with Google"
**Then** I am redirected to Google OAuth consent
**And** after approval, I am redirected back authenticated
**And** my user record is created in Supabase (if new)
**And** my session is stored securely (HTTP-only cookie)
**And** I see my name/avatar in the header

**Given** I am already signed in
**When** I click "Sign out"
**Then** my session is cleared
**And** I am redirected to the landing page

### Story 1.3: Basic User Profile Page

As a **contributor**,
I want to **view my profile page**,
So that **I can see my account information**.

**Acceptance Criteria:**

**Given** I am signed in
**When** I navigate to `/profile`
**Then** I see my display name from Google
**And** I see my profile picture from Google
**And** I see my email address
**And** I see "Member since [date]"
**And** I see a placeholder section for "Contributions" (empty for now)

**Given** I am not signed in
**When** I try to access `/profile`
**Then** I am redirected to the sign-in page

---

## Epic 2: Project & Ticket Discovery

**Goal:** Users can browse projects and view available tickets.
**FRs:** FR4, FR5, FR6, FR7, FR9 | **NFRs:** NFR1, NFR3

### Story 2.1: Projects & Tickets Database Schema

As a **developer**,
I want **database tables for projects and tickets**,
So that **I can store and query project data**.

**Acceptance Criteria:**

**Given** Supabase is configured
**When** I run the migration
**Then** `projects` table exists with columns: id, name, description, difficulty, tech_stack, status, github_repo_url, created_at
**And** `tickets` table exists with columns: id, project_id, title, description, status, difficulty, claimed_by, created_at
**And** RLS policies allow authenticated users to read projects and tickets
**And** TypeScript types are generated via `supabase gen types`

### Story 2.2: Projects List Page

As a **contributor**,
I want to **browse available projects**,
So that **I can find something interesting to work on**.

**Acceptance Criteria:**

**Given** I am on the `/projects` page
**When** the page loads
**Then** I see a list of all active projects
**And** each project card shows: name, description (truncated), difficulty badge, tech stack tags
**And** I can see project status (active/completed)
**And** clicking a project navigates to `/projects/[id]`
**And** page loads in < 1 second (NFR3)

### Story 2.3: Project Detail Page

As a **contributor**,
I want to **view project details and its tickets**,
So that **I can understand the project and pick a ticket**.

**Acceptance Criteria:**

**Given** I navigate to `/projects/[id]`
**When** the page loads
**Then** I see the project name, full description, difficulty level, tech stack
**And** I see the GitHub repo link (if published)
**And** I see a list of all tickets for this project
**And** tickets are grouped or filterable by status (available, claimed, in_progress, done)
**And** each ticket shows: title, difficulty, status, assignee (if claimed)

### Story 2.4: Ticket Detail View

As a **contributor**,
I want to **view ticket details**,
So that **I can understand what work needs to be done**.

**Acceptance Criteria:**

**Given** I am on a project page
**When** I click on a ticket
**Then** I see a modal or page with: title, full description, acceptance criteria
**And** I see the ticket status with visual indicator
**And** I see who claimed it (if claimed)
**And** I see a "Claim Ticket" button (if available and I'm signed in)
**And** the button is disabled if ticket is already claimed

---

## Epic 3: Contributor Workflow

**Goal:** Users can claim tickets, get AI help, submit PRs, receive AI review, and track contributions.
**FRs:** FR3, FR8, FR10, FR11, FR12, FR13, FR14 | **NFRs:** NFR2, NFR5, NFR13, NFR14

### Story 3.1: Claim Ticket

As a **contributor**,
I want to **claim an available ticket**,
So that **I can start working on it**.

**Acceptance Criteria:**

**Given** I am signed in and viewing an available ticket
**When** I click "Claim Ticket"
**Then** the ticket status changes to "claimed"
**And** I am assigned as the owner
**And** I see a success message with micro-copy: "✓ Ticket claimed! You're now the owner."
**And** other users see the ticket as claimed by me

**Given** another user tries to claim the same ticket simultaneously
**When** both requests arrive
**Then** only one succeeds (race condition handling)
**And** the other receives a friendly "Ticket was just claimed by someone else" message

### Story 3.2: GitHub App Integration Setup

As a **developer**,
I want **GitHub App configured for repo control**,
So that **the platform can manage branches and collaborators**.

**Acceptance Criteria:**

**Given** the GitHub App is installed on the `itay-dev` organization
**When** a user claims a ticket
**Then** the platform can add them as a collaborator to the project's repo
**And** the platform can create a branch `itay-{ticket-id}-{short-desc}`
**And** webhook endpoints receive push and PR events
**And** API keys are stored securely in Cloudflare secrets

### Story 3.3: Auto-Branch Creation on Claim

As a **contributor**,
I want **a branch created automatically when I claim a ticket**,
So that **I can start coding immediately without git setup confusion**.

**Acceptance Criteria:**

**Given** I have claimed a ticket
**When** the claim is processed
**Then** a branch `itay-{ticket-id}-{short-desc}` is created in the project repo
**And** I am added as a collaborator (if not already)
**And** I see instructions: "Your branch is ready! Clone and checkout: `git checkout itay-123-add-validation`"
**And** the ticket shows a link to the branch on GitHub

### Story 3.4: Link PR to Ticket

As a **contributor**,
I want to **link my GitHub PR to my claimed ticket**,
So that **my contribution is tracked**.

**Acceptance Criteria:**

**Given** I have a claimed ticket and pushed code
**When** I create a PR with `itay-{ticket-id}` in the branch name
**Then** the webhook auto-links the PR to my ticket
**And** the ticket status changes to "in_review"
**And** I see the PR link on the ticket detail page

**Given** I create a PR manually without the standard branch
**When** I view my ticket
**Then** I can manually paste a PR URL to link it

### Story 3.5: AI Code Review

As a **contributor**,
I want **AI to review my PR and give feedback**,
So that **I can learn and improve my code**.

**Acceptance Criteria:**

**Given** a PR is linked to a ticket
**When** the PR webhook fires
**Then** a review job is queued (Cloudflare Queue)
**And** within 30 seconds (NFR2), AI posts a review comment on the PR
**And** the review is kind and educational (never condescending)
**And** the review includes specific suggestions with code examples
**And** if the review times out, the ticket shows "Review pending..."

### Story 3.6: AI Inline Assistance

As a **contributor**,
I want **AI help while working on a ticket**,
So that **I can get unstuck without waiting for a mentor**.

**Acceptance Criteria:**

**Given** I am viewing my claimed ticket
**When** I click "Get AI Help"
**Then** I see a chat interface
**And** AI has context about the ticket, project tech stack, and acceptance criteria
**And** I can ask questions and get helpful responses
**And** if OpenRouter is unavailable, I see a friendly fallback message (NFR14)

### Story 3.7: PR Merge Tracking & Contribution History

As a **contributor**,
I want **my merged PRs to show on my profile**,
So that **I can build a verified portfolio**.

**Acceptance Criteria:**

**Given** my PR is merged on GitHub
**When** the merge webhook fires
**Then** my ticket status changes to "done"
**And** my profile shows: +1 PR merged, +1 ticket completed
**And** I see a celebration (confetti!) with message "🎉 Your PR was merged!"
**And** my profile `/profile` shows the contribution with date and project link

**Given** a webhook is missed
**When** the polling job runs (every 5 min)
**Then** merged PRs are detected and tickets updated (NFR5)

---

## Epic 4: Admin Panel

**Goal:** Admin can generate projects from templates, manage tickets, and oversee contributors.
**FRs:** FR15, FR16, FR17, FR18, FR19, FR20, FR21 | **NFRs:** NFR9, NFR14

### Story 4.1: Admin Role & Auth Guard

As an **admin**,
I want **protected admin routes**,
So that **only authorized users can access admin features**.

**Acceptance Criteria:**

**Given** I am signed in with an admin account
**When** I navigate to `/admin`
**Then** I see the admin dashboard

**Given** I am signed in as a regular user
**When** I try to access `/admin`
**Then** I am redirected to `/projects` with an error message

**Given** I am not signed in
**When** I try to access `/admin`
**Then** I am redirected to sign-in

**And** admin role is determined by `users.role` column in Supabase

### Story 4.2: Project Templates CRUD

As an **admin**,
I want to **create and manage project templates**,
So that **I can generate multiple similar projects**.

**Acceptance Criteria:**

**Given** I am on `/admin/templates`
**When** the page loads
**Then** I see a list of existing templates

**Given** I click "New Template"
**When** I fill in: name, description, tech stack, difficulty, default tickets structure
**Then** the template is saved
**And** I see it in the templates list

**Given** I click "Edit" on a template
**When** I modify fields and save
**Then** the changes are persisted

**Given** I click "Delete" on a template
**When** I confirm deletion
**Then** the template is removed

### Story 4.3: AI Project Generation

As an **admin**,
I want to **generate a new project from a template using AI**,
So that **I can quickly create well-structured projects**.

**Acceptance Criteria:**

**Given** I am on `/admin/templates`
**When** I click "Generate Project" on a template
**Then** I see a modal to customize: project name, specific goals, any variations
**And** I click "Generate"
**Then** AI generates: project description, architecture overview, list of tickets with acceptance criteria
**And** the generation uses OpenRouter API
**And** if OpenRouter fails, I see a fallback error message (NFR14)
**And** the generated project is saved as "draft" status

### Story 4.4: Review & Edit Generated Project

As an **admin**,
I want to **review and edit AI-generated project specs**,
So that **I can ensure quality before publishing**.

**Acceptance Criteria:**

**Given** a project is in "draft" status
**When** I navigate to `/admin/projects/[id]/edit`
**Then** I can edit: name, description, difficulty, tech stack
**And** I can edit each ticket: title, description, acceptance criteria, difficulty
**And** I can add or remove tickets
**And** I can regenerate specific sections with AI
**And** changes are auto-saved or saved on button click

### Story 4.5: Publish Project

As an **admin**,
I want to **publish a project to make it available to contributors**,
So that **developers can start working on it**.

**Acceptance Criteria:**

**Given** I am editing a draft project
**When** I click "Publish"
**Then** a GitHub repo is created under `itay-dev` organization
**And** the project status changes to "active"
**And** tickets become visible on the public projects page
**And** I see a success message: "Project published! Contributors can now see it."

**Given** I want to unpublish
**When** I click "Unpublish"
**Then** the project is hidden from contributors
**And** existing claimed tickets remain (no data loss)

### Story 4.6: Contributor Activity Dashboard

As an **admin**,
I want to **view all contributor activity**,
So that **I can monitor platform health**.

**Acceptance Criteria:**

**Given** I am on `/admin/activity`
**When** the page loads
**Then** I see a feed of recent activity: ticket claims, PRs opened, PRs merged
**And** I can filter by project
**And** I can filter by contributor
**And** I see aggregate stats: total contributors, active this week, PRs merged this week

### Story 4.7: Ticket & Project Management

As an **admin**,
I want to **edit ticket descriptions and manage project visibility**,
So that **I can maintain platform content**.

**Acceptance Criteria:**

**Given** I am viewing any ticket (admin view)
**When** I click "Edit"
**Then** I can modify: title, description, acceptance criteria, difficulty
**And** changes are saved and visible to contributors immediately

**Given** I am viewing a project (admin view)
**When** I change status to "completed" or "paused"
**Then** the status is reflected on the public listing
**And** "completed" projects show a celebration badge
**And** "paused" projects show as "Coming soon"
