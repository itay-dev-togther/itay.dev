---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - "analysis/brainstorming-session-2026-01-01.md"
  - "planning-artifacts/research/market-dev-collab-platforms-israel-2026-01-01.md"
date: 2026-01-01
author: yaniv
project_name: itay-collab-platform
---

# Product Brief: Itay.dev

## Executive Summary

**Itay.dev** is an AI-powered platform where developers gain real production experience by collaborating on actual projects that ship to real users. Named in memory of Itay, who believed in the power of people working together, the platform solves the "experience paradox" - where junior developers can't get jobs without experience, but can't get experience without jobs.

Unlike coding exercises (Exercism), algorithm puzzles (LeetCode), or overwhelming open source projects, Itay.dev provides structured, AI-generated projects with complete specs, tickets, and requirements. Developers work in teams, receive AI-powered mentorship, and build portfolios of verified, shipped contributions.

**Target Market:** Israeli developer community (initial), with global expansion potential.

**Core Differentiator:** The only platform combining real shipping products + team collaboration + AI mentorship + verified portfolio proof.

---

## Core Vision

### Problem Statement

Junior developers, career-switchers, and bootcamp graduates face an impossible barrier: employers require "real experience," but gaining real experience requires employment. Entry-level positions have dropped 60% since 2022, and "entry-level" job postings now routinely require 2-5 years of experience.

### Problem Impact

- Talented developers stuck in tutorial hell, unable to prove production readiness
- 15,000+ unfilled tech positions in Israel alone due to perceived talent gaps
- Developers leaving the field or the country out of frustration
- Companies missing out on capable talent they can't identify

### Why Existing Solutions Fall Short

| Solution | What It Teaches | What It Misses |
|----------|-----------------|----------------|
| Exercism | Language syntax, mentored exercises | No real products, no team collaboration |
| LeetCode/HackerRank | Algorithm puzzles for interviews | Puzzles ≠ production skills |
| Bootcamps | Fundamentals, toy projects | No ongoing production experience |
| Open Source | Real codebases | Overwhelming, unstructured, intimidating |

**The gap:** No platform teaches the *muscle memory* of production work - tickets, DoD, tests, PR feedback, git workflows, deployment.

### Proposed Solution

Itay.dev is a platform where:

1. **AI generates real product specs** - Complete with requirements, architecture, and tickets
2. **Developers choose projects by difficulty** - Beginner, Intermediate, Advanced
3. **Teams collaborate to build** - Real PRs, code review, git workflows
4. **AI acts as tech lead** - Reviews code, answers questions, provides mentorship
5. **Products ship to real users** - Deployed, used, portfolio-worthy
6. **Contributions are verified** - Proof of real experience for employers

### Key Differentiators

1. **Real products, not exercises** - Things that ship and get used
2. **Team collaboration** - Learn to work with others, not just code alone
3. **AI mentorship at scale** - Guidance without waiting for senior devs
4. **Verified portfolio** - Employers can confirm contributions
5. **Structured difficulty** - Clear progression without gatekeeping
6. **Itay's legacy** - Built on the belief that people helping people creates magic

---

## Target Users

### Primary Users

**The Stuck Junior**

| Aspect | Details |
|--------|---------|
| Who | Recent CS graduates, bootcamp completers, self-taught developers (22-28) |
| Context | Has fundamental skills, completed tutorials/courses, but can't land first dev job |
| Pain | "Entry-level jobs want 2-5 years experience. I'm stuck in a catch-22." |
| Current Workarounds | LeetCode grinding, personal projects no one sees, intimidating open source attempts |
| Goal | Build a portfolio of real, verifiable production experience |
| Success Moment | Walking into an interview and saying "I shipped 3 products with teams. Here are my PRs, my code reviews, my contributions." |

**Emotional State:** Frustrated, capable but unable to prove it, watching peers get lucky while they grind tutorials.

---

### Secondary Users

**The Career Switcher**

| Aspect | Details |
|--------|---------|
| Who | Professionals (30-45) transitioning from other fields |
| Context | Completed bootcamp or self-taught, but feels behind younger candidates |
| Pain | "I have life experience but no dev experience. Employers see my age, not my potential." |
| Goal | Prove they can work in a modern dev environment despite non-traditional background |
| Success Moment | Getting hired and realizing "I already know how this works from Itay.dev" |

---

### User Journey

**Discovery → First Project → Confidence**

| Stage | Experience |
|-------|------------|
| Discovery | Hears about Itay.dev through Israeli dev meetups, word of mouth, or bootcamp recommendation |
| Sign Up | Creates account, sees quick intro explaining how the platform works |
| Browse Projects | Views available projects by difficulty (Beginner/Intermediate/Advanced), picks one that interests them |
| Join Team | Gets assigned to a small team working on the project, sees the tickets/backlog |
| First Contribution | Picks a ticket, writes code, submits PR, gets AI feedback and team review |
| Aha! Moment | First PR merged - "I just contributed to a real product!" |
| Build Momentum | Completes more tickets, gains confidence, project ships |
| Portfolio Proof | Profile shows verified contributions: PRs merged, projects shipped, skills demonstrated |
| Job Interview | "Let me show you my Itay.dev profile - here's everything I built with real teams" |

---

## Success Metrics

### North Star Metric

**Tickets Completed by Users**

The single most important indicator that Itay.dev is working: developers are picking up tickets, writing code, and getting their contributions merged.

---

### User Success Metrics

| Metric | Definition | Why It Matters |
|--------|------------|----------------|
| First ticket completed | User finishes their first contribution | Proves they can do the work |
| PRs merged | Code accepted into project | Real contribution, not just attempts |
| Projects contributed to | Number of projects worked on | Breadth of experience |
| Project shipped | Participated in a launched product | Ultimate portfolio proof |

**Ultimate user success:** Getting hired because of their Itay.dev portfolio.

---

### Business Objectives

**Phase 1: Validation (0-3 months)**
- Get first users completing tickets
- Ship at least 1 project end-to-end
- Validate that AI can generate usable project specs

**Phase 2: Growth (3-12 months)**
- Grow active contributor base
- Multiple projects running simultaneously
- First job placement stories

**Phase 3: Scale (12+ months)**
- Sustainable community of contributors
- Projects shipping regularly
- Recognized as a path to employment

---

### Key Performance Indicators

| KPI | Target (Phase 1) | How to Measure |
|-----|------------------|----------------|
| Active contributors | 10-50 users | Users who completed 1+ ticket in past 30 days |
| Tickets completed/week | 5-20 | Total merged PRs per week |
| Projects in progress | 1-3 | Active projects with contributors |
| First project shipped | 1 | A complete product deployed and usable |

---

### What Success Looks Like

**3 months:** A handful of developers have completed tickets on a real project. You can point to PRs, code, progress.

**12 months:** Multiple projects shipped. Users starting to get interviews/jobs referencing their Itay.dev work.

**Long-term:** "I got my first dev job because of Itay.dev" becomes a common story in the Israeli tech community.

---

## MVP Scope

### Core Hypothesis

**Developers will collaborate on AI-generated projects and complete real work together.**

The AI enables it. The collaboration validates it.

---

### Core Features (Must Have)

**AI Engine:**
- AI generates 1-2 complete projects (specs, architecture, tickets)
- AI reviews every PR with actionable, kind feedback
- AI assistance inline in tickets (context-aware help)

**Platform Basics:**
- User accounts (sign up, login, profile)
- Project listing (1-2 available projects)
- Ticket board (view, claim, track status)
- Git integration (GitHub PRs, track merges)
- Contributor profile (completed tickets, PRs merged)

**The MVP Journey:**
1. Land → See one project
2. Browse → Pick a ticket
3. Code → Get AI help
4. Submit → AI reviews kindly
5. Merge → See it on profile

*The project IS the onboarding.*

---

### Out of Scope for MVP

| Feature | Why It Waits |
|---------|--------------|
| Complex onboarding flow | Project is the onboarding |
| Team chat | Discord initially |
| Multiple difficulty levels | One level first |
| Community features | Emerges organically later |
| Certificates/badges | Profile is enough |
| Payment/premium | Free to validate |

---

### What We're Validating

| Assumption | How We'll Know |
|------------|----------------|
| Devs will pick up tickets | Tickets get claimed |
| Devs will complete work | PRs get submitted |
| Collaboration happens | Multiple people on same project |
| AI helps, not hurts | Users report feeling supported |

---

### Future Vision

**Phase 2:** Community features, multiple difficulty levels, more projects

**Phase 3:** Employer portal, bootcamp partnerships, revenue model

**Long-term:** Global expansion, products that generate revenue
