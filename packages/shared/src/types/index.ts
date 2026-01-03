// Types for itay.dev platform (itay schema in Supabase)

// ============ Database Row Types ============

export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  role: 'admin' | 'contributor'
  github_username: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tech_stack: string[]
  status: 'draft' | 'active' | 'completed' | 'paused'
  github_repo_url: string | null
  github_repo_name: string | null
  template_id: string | null
  created_at: string
  updated_at: string
}

export interface Ticket {
  id: string
  project_id: string
  title: string
  description: string | null
  acceptance_criteria: string | null
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  status: 'available' | 'claimed' | 'in_review' | 'done'
  claimed_by: string | null
  claimed_at: string | null
  branch_name: string | null
  pr_url: string | null
  pr_number: number | null
  created_at: string
  updated_at: string
}

export interface Contribution {
  id: string
  user_id: string
  ticket_id: string
  project_id: string
  pr_url: string
  pr_number: number | null
  merged_at: string
  lines_added: number
  lines_removed: number
  created_at: string
}

// ============ Extended Types (with relations) ============

export interface TicketWithProject extends Ticket {
  project?: Project
}

export interface TicketWithUser extends Ticket {
  claimed_by_user?: User
}

export interface ContributionWithDetails extends Contribution {
  user?: User
  ticket?: Ticket
  project?: Project
}

// ============ Enums ============

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type ProjectStatus = 'draft' | 'active' | 'completed' | 'paused'
export type TicketStatus = 'available' | 'claimed' | 'in_review' | 'done'
export type UserRole = 'admin' | 'contributor'

// ============ API Types ============

export interface ApiResponse<T> {
  data: T
}

export interface ApiError {
  error: {
    code: string
    message: string
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    per_page: number
  }
}

// ============ Request Types ============

export interface ClaimTicketRequest {
  ticket_id: string
}

export interface ClaimTicketResponse {
  ticket: Ticket
  branch_name: string
  instructions: string
}
