'use client'

import Link from 'next/link'
import type { Project } from '@itay-dev/shared'

interface ProjectCardProps {
  project: Project
}

const difficultyConfig: Record<string, { bg: string; color: string; label: string; icon: React.ReactNode }> = {
  beginner: {
    bg: '#dcfce7',
    color: '#166534',
    label: 'Beginner Friendly',
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
  },
  intermediate: {
    bg: '#fef3c7',
    color: '#92400e',
    label: 'Intermediate',
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>
    ),
  },
  advanced: {
    bg: '#fee2e2',
    color: '#991b1b',
    label: 'Advanced',
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
}

const statusConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  active: { color: '#166534', bgColor: '#dcfce7', label: 'Active' },
  completed: { color: '#3730a3', bgColor: '#e0e7ff', label: 'Completed' },
  paused: { color: '#6b7280', bgColor: '#f3f4f6', label: 'Paused' },
}

export function ProjectCard({ project }: ProjectCardProps) {
  const difficulty = difficultyConfig[project.difficulty] || difficultyConfig.beginner
  const status = statusConfig[project.status] || statusConfig.active

  const truncatedDescription = project.description
    ? project.description.length > 140
      ? project.description.slice(0, 140) + '...'
      : project.description
    : 'No description available'

  return (
    <Link href={`/projects/${project.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article
        style={{
          padding: '1.5rem',
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '20px',
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.boxShadow = '0 20px 50px rgba(99, 102, 241, 0.12)'
          e.currentTarget.style.transform = 'translateY(-6px)'
          e.currentTarget.style.borderColor = '#c7d2fe'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.borderColor = '#e5e7eb'
        }}
      >
        {/* Gradient accent line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
          borderRadius: '20px 20px 0 0',
        }} />

        {/* Status badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          marginBottom: '1rem',
          alignSelf: 'flex-start',
        }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: status.color,
            animation: project.status === 'active' ? 'pulse 2s infinite' : 'none',
          }} />
          <span style={{
            fontSize: '0.7rem',
            color: status.color,
            backgroundColor: status.bgColor,
            padding: '0.25rem 0.6rem',
            borderRadius: '9999px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {status.label}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#111827',
          margin: '0 0 0.75rem 0',
          lineHeight: 1.3,
          letterSpacing: '-0.01em',
        }}>
          {project.name}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: '0.9rem',
          color: '#6b7280',
          lineHeight: 1.65,
          marginBottom: '1.25rem',
          flex: 1,
        }}>
          {truncatedDescription}
        </p>

        {/* Tech Stack */}
        <div style={{
          display: 'flex',
          gap: '0.4rem',
          flexWrap: 'wrap',
          marginBottom: '1.25rem',
        }}>
          {project.tech_stack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              style={{
                padding: '0.3rem 0.65rem',
                fontSize: '0.75rem',
                color: '#6366f1',
                backgroundColor: '#eef2ff',
                borderRadius: '6px',
                fontWeight: 500,
              }}
            >
              {tech}
            </span>
          ))}
          {project.tech_stack.length > 4 && (
            <span style={{
              padding: '0.3rem 0.65rem',
              fontSize: '0.75rem',
              color: '#9ca3af',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
            }}>
              +{project.tech_stack.length - 4}
            </span>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '1rem',
          borderTop: '1px solid #f3f4f6',
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.85rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: difficulty.bg,
            color: difficulty.color,
            borderRadius: '9999px',
          }}>
            {difficulty.icon}
            {difficulty.label}
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.85rem',
            color: '#6366f1',
            fontWeight: 600,
          }}>
            View Project
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </span>
        </div>

        {/* Animation keyframes */}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </article>
    </Link>
  )
}
