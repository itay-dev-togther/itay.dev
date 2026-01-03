'use client'

import Link from 'next/link'
import type { Project } from '@itay-dev/shared'

interface ProjectCardProps {
  project: Project
}

const difficultyConfig: Record<string, { bg: string; color: string; label: string }> = {
  beginner: { bg: '#dcfce7', color: '#166534', label: 'Beginner Friendly' },
  intermediate: { bg: '#fef3c7', color: '#92400e', label: 'Intermediate' },
  advanced: { bg: '#fee2e2', color: '#991b1b', label: 'Advanced' },
}

const statusConfig: Record<string, { bg: string; color: string; icon: string }> = {
  active: { bg: '#dcfce7', color: '#166534', icon: '●' },
  completed: { bg: '#e0e7ff', color: '#3730a3', icon: '✓' },
  paused: { bg: '#f3f4f6', color: '#6b7280', icon: '⏸' },
}

export function ProjectCard({ project }: ProjectCardProps) {
  const difficulty = difficultyConfig[project.difficulty] || difficultyConfig.beginner
  const status = statusConfig[project.status] || statusConfig.active

  const truncatedDescription = project.description
    ? project.description.length > 150
      ? project.description.slice(0, 150) + '...'
      : project.description
    : 'No description available'

  return (
    <Link href={`/projects/${project.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article
        style={{
          padding: '1.5rem',
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.08)'
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.borderColor = '#c7d2fe'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.borderColor = '#e5e7eb'
        }}
      >
        {/* Status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span style={{ color: status.color, fontSize: '0.75rem' }}>{status.icon}</span>
          <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {project.status}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#111827',
          margin: '0 0 0.75rem 0',
          lineHeight: 1.3,
        }}>
          {project.name}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: '0.9rem',
          color: '#6b7280',
          lineHeight: 1.6,
          marginBottom: '1.25rem',
          flex: 1,
        }}>
          {truncatedDescription}
        </p>

        {/* Tech Stack */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '1rem',
        }}>
          {project.tech_stack.map((tech) => (
            <span
              key={tech}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                color: '#4b5563',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontWeight: 500,
              }}
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Difficulty badge */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '1rem',
          borderTop: '1px solid #f3f4f6',
        }}>
          <span style={{
            padding: '0.35rem 0.85rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            backgroundColor: difficulty.bg,
            color: difficulty.color,
            borderRadius: '9999px',
          }}>
            {difficulty.label}
          </span>
          <span style={{
            fontSize: '0.85rem',
            color: '#6366f1',
            fontWeight: 500,
          }}>
            View Project →
          </span>
        </div>
      </article>
    </Link>
  )
}
