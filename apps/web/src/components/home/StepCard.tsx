'use client'

import { ReactNode } from 'react'

interface StepCardProps {
  icon: ReactNode
  title: string
  description: string
  step: number
}

export function StepCard({ icon, title, description, step }: StepCardProps) {
  return (
    <div
      style={{
        padding: '2rem',
        backgroundColor: '#fff',
        borderRadius: '20px',
        border: '1px solid #e5e7eb',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Step number badge */}
      <div
        style={{
          position: 'absolute',
          top: '-12px',
          left: '20px',
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8rem',
          fontWeight: 700,
          boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
        }}
      >
        {step}
      </div>

      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%)',
          color: '#6366f1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
          marginTop: '0.5rem',
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#111827',
          marginBottom: '0.75rem',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: '#6b7280',
          lineHeight: 1.6,
          fontSize: '0.95rem',
        }}
      >
        {description}
      </p>
    </div>
  )
}
