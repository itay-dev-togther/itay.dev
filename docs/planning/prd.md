---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
inputDocuments:
  - "planning-artifacts/product-brief-itay-collab-platform-2026-01-01.md"
  - "planning-artifacts/research/market-dev-collab-platforms-israel-2026-01-01.md"
  - "analysis/brainstorming-session-2026-01-01.md"
workflowType: 'prd'
lastStep: 0
documentCounts:
  briefs: 1
  research: 1
  brainstorming: 1
  projectDocs: 0
date: '2026-01-01'
project_name: 'itay-collab-platform'
---

# Product Requirements Document - Itay.dev

**Author:** yaniv
**Date:** 2026-01-01

---

## Executive Summary

**Itay.dev** is an AI-powered platform where developers gain real production experience by collaborating on projects that ship to real users. Named in memory of Itay, who believed in the power of people helping people, it solves the "experience paradox" - where junior developers can't get jobs without experience, but can't get experience without jobs.

The platform provides AI-generated project specs complete with architecture, tickets, and requirements. Developers choose projects by difficulty level (Beginner/Intermediate/Advanced), collaborate in teams with AI-powered code review and mentorship, and build verified portfolios of shipped contributions.

**Target Market:** Israeli developer community (initial), with global expansion potential.

### What Makes This Special

1. **Real deployed products** - Projects ship to real users, not toy exercises
2. **AI-generated specs** - Complete project architecture, tickets, and requirements ready to build
3. **Self-select difficulty** - Beginner/Intermediate/Advanced with no gatekeeping
4. **Built for accessibility** - Specifically designed for juniors, career-switchers, and bootcamp grads stuck in the experience paradox
5. **Team collaboration** - Learn to work with others, not just code alone
6. **AI mentorship at scale** - Code review and guidance without waiting for senior devs

## Project Classification

| Attribute | Value |
|-----------|-------|
| **Technical Type** | web_app |
| **Domain** | general (developer productivity) |
| **Complexity** | medium |
| **Project Context** | Greenfield - new project |

This is a web-based SaaS platform with GitHub integration, real-time collaboration features, AI-powered code review, and user portfolio/profile systems.

---

> **Design Principle (for Features section):**
> Frame key features as: *"Itay liked [value] → Build [feature] → So [user outcome]"*
> This keeps every feature grounded in the human "why" behind the platform.

---

## Success Criteria

### User Success

Users succeed when they're actively building real things and gaining production experience - not chasing credentials or interview prep.

| Success Indicator | What It Looks Like |
|-------------------|-------------------|
| **First contribution** | User picks a ticket, submits a PR, gets it merged |
| **Feeling like a real dev** | Working with tickets, PRs, code review, git workflows |
| **Variety of experience** | Multiple easy projects, different ticket types, experimentation |
| **Creating cool stuff** | Shipping things that actually work and get used |

**This is NOT LeetCode.** Success is the journey of building, not passing a gate.

### Business Success

This is a passion project honoring Itay. Success is simple:

- Projects are shipping
- People are building together
- The platform is alive and useful

No growth hacking. No funnel metrics. If people are making cool stuff together, it's working.

### Technical Success

| Requirement | Target |
|-------------|--------|
| **Availability** | Always up - production-grade reliability |
| **Initial scale** | Built for ~50 users |
| **Architecture** | Clean and future-proof for growth |
| **GitHub integration** | PRs, AI code review, contribution tracking |
| **Developer experience** | Feels like real work - tickets, reviews, workflows |

---

## Product Scope

### MVP - Minimum Viable Product

**AI Engine:**
- AI generates 1-2 complete projects (specs, architecture, tickets)
- AI reviews every PR with actionable, kind feedback
- AI assistance inline in tickets (context-aware help)

**Platform Basics:**
- User accounts (sign up, login, profile)
- Project listing (1-2 easy projects to start)
- Ticket board (view, claim, track status)
- GitHub integration (PRs, track merges)
- Contributor profile (completed tickets, PRs merged)

**The MVP Journey:**
1. Land → See a project
2. Browse → Pick a ticket
3. Code → Get AI help
4. Submit → AI reviews kindly
5. Merge → See it on profile

### Growth Features (Post-MVP)

- More projects at varying difficulty levels
- Team/collaboration features beyond Discord
- Community features (as they emerge organically)
- More AI capabilities based on what users need

### Vision (Future)

- Sustainable community of contributors shipping regularly
- Recognized path to real-world experience
- Global expansion beyond Israel
- Products that serve real users

---

## User Journeys

### Journey 1: Tomer - The Stuck Junior Finally Ships Something Real

Tomer is a 24-year-old bootcamp graduate who's been applying to junior dev positions for six months. Every rejection says the same thing: "We're looking for candidates with more experience." He's done 200 LeetCode problems and built three todo apps that nobody uses. He's starting to wonder if he made a mistake leaving his accounting job.

One night, scrolling through an Israeli dev Discord, someone mentions Itay.dev. "It's like open source, but structured. You actually ship stuff." Skeptical but desperate, Tomer signs up.

He sees a project - a simple utility app that will actually get deployed. The tickets are clear, the difficulty is marked "Beginner," and there's AI help built in. He claims his first ticket: "Add input validation to the signup form."

Three hours later, he submits his first PR. The AI reviews it kindly: "Good work! Consider adding a test for the edge case when email is empty." He adds the test, the PR gets merged, and he sees it on his profile: **1 PR merged**.

Two months later, Tomer has contributed to 3 projects. In his next interview, he pulls up his Itay.dev profile: "Here are my PRs. Here's code I wrote that's running in production. Here's feedback I received and how I improved." He gets the job.

---

### Journey 2: Yaniv (Admin) - Keeping The Platform Alive

Yaniv logs into the admin panel to check on the ecosystem. He sees 2 active projects, 12 contributors, and 8 tickets completed this week. One project is close to shipping.

He decides to generate a new project - something fresh for contributors who finished the first ones. The AI creates specs, architecture, and tickets. Yaniv reviews, tweaks difficulty labels, and publishes it. New tickets appear on the board.

A contributor flags an issue with a confusing ticket. Yaniv edits the description to clarify. The platform hums along.

---

### Journey Requirements Summary

| Journey | Capabilities Revealed |
|---------|----------------------|
| **Tomer (Contributor)** | Sign up, browse projects, view tickets, claim tickets, submit PRs, receive AI review, see profile/contributions |
| **Yaniv (Admin)** | Admin dashboard, project generation, ticket management, contributor oversight, project publishing |

---

## Web App Specific Requirements

### Project-Type Overview

Itay.dev is a web application with GitHub integration for PRs, Google OAuth for auth, and OpenRouter for AI services (multiple models).

### Technical Architecture Considerations

| Decision | Choice |
|----------|--------|
| **SPA vs MPA** | TBD - Architecture phase |
| **Browser Support** | Modern only (Chrome, Firefox, Safari, Edge) |
| **SEO** | Not a priority for MVP |
| **Real-time** | Basic - ticket status, PR notifications |
| **Accessibility** | WCAG 2.1 AA |

### Key Integrations

| Integration | Purpose |
|-------------|---------|
| **GitHub API** | PR tracking, contribution verification |
| **Google OAuth** | User authentication |
| **OpenRouter** | AI services - project generation, code review, ticket help (multiple models) |

### Implementation Notes

- Google OAuth for sign-in (simple, widely trusted)
- OpenRouter gives flexibility to use different AI models for different tasks
- GitHub integration for PR workflows only (not auth)
- Architecture decisions deferred to Architecture phase

---

## Project Scoping & Phased Development

### MVP Strategy

**Approach:** Experience MVP - Deliver the core "building real things together" experience with quick wins

**Key Insight:** More easy projects > fewer complex projects. Variety and achievable scope matters.

### MVP Feature Set (Phase 1)

| Category | Features |
|----------|----------|
| **Auth** | Google OAuth sign-in |
| **Projects** | Multiple easy/small-scope projects via template system |
| **Tickets** | Board view, claim, track status |
| **GitHub** | PR integration, contribution tracking |
| **AI** | Code review on every PR, inline help in tickets |
| **Profile** | PRs merged, tickets completed |
| **Admin** | Project templates, generate projects, manage tickets |

**Template Approach:**
- Reusable project template structure
- AI generates multiple small projects from templates
- Each project scoped small - tickets feel achievable
- Variety > complexity for MVP

### Post-MVP Features (Phase 2)

- More project templates, varying difficulty levels
- Team/collaboration features beyond Discord
- Richer AI capabilities based on user feedback
- Enhanced contributor profiles

### Vision (Phase 3)

- Community features (emerge organically)
- Global expansion beyond Israel
- Projects serving real users at scale

### Risk Mitigation

| Risk | Mitigation |
|------|------------|
| **AI quality** | OpenRouter flexibility - switch models as needed |
| **Will devs contribute?** | Validate with first 10-50 users, iterate fast |
| **Template limits** | Start simple, expand templates based on learnings |

---

## Functional Requirements

### User Management

- FR1: Users can sign in with Google OAuth
- FR2: Users can view their contributor profile
- FR3: Users can see their contribution history (PRs merged, tickets completed)

### Project Discovery

- FR4: Users can browse available projects
- FR5: Users can view project details (description, difficulty level, tech stack)
- FR6: Users can see project status (active, completed)

### Ticket Management

- FR7: Users can view all tickets for a project
- FR8: Users can claim an available ticket
- FR9: Users can see ticket status (available, claimed, in progress, done)
- FR10: Users can get AI assistance inline while working on a ticket

### Contribution Workflow

- FR11: Users can link a GitHub PR to their claimed ticket
- FR12: Users can receive AI code review feedback on their PR
- FR13: System tracks when PRs are merged and updates ticket status
- FR14: Users can see their contributions reflected on their profile

### Admin - Project Generation

- FR15: Admin can create and manage project templates
- FR16: Admin can generate new projects from templates using AI
- FR17: Admin can review and edit AI-generated project specs
- FR18: Admin can publish projects to make them available to contributors

### Admin - Platform Management

- FR19: Admin can view all contributor activity
- FR20: Admin can edit ticket descriptions
- FR21: Admin can manage project visibility and status

---

## Non-Functional Requirements

### Performance

| Requirement | Target |
|-------------|--------|
| Page load time | < 3 seconds |
| AI code review response | < 30 seconds (async is fine) |
| Ticket/project browsing | Instant feel (< 1 second) |

### Reliability

| Requirement | Target |
|-------------|--------|
| Uptime | 99.5% (always up, but not enterprise SLA) |
| GitHub sync | Resilient to GitHub API hiccups |
| Data persistence | No lost contributions |

### Security

| Requirement | Target |
|-------------|--------|
| Authentication | Google OAuth (no password storage) |
| Data protection | HTTPS everywhere |
| API keys | OpenRouter/GitHub keys stored securely, never exposed |

### Scalability

| Requirement | Target |
|-------------|--------|
| Initial capacity | ~50 concurrent users |
| Architecture | Designed for 10x growth without rewrite |

### Accessibility

| Requirement | Target |
|-------------|--------|
| Standard | WCAG 2.1 AA |
| Focus | Keyboard navigation, screen reader support |

### Integration Reliability

| Requirement | Target |
|-------------|--------|
| GitHub API | Graceful handling of rate limits/outages |
| OpenRouter | Fallback if specific model unavailable |
| Google OAuth | Standard OAuth flow, no custom hacks |

