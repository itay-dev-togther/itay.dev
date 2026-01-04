'use client'

import { ReactNode } from 'react'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div
      style={{
        padding: '1.75rem',
        backgroundColor: '#fff',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        display: 'flex',
        gap: '1rem',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.06)'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '12px',
          backgroundColor: '#f5f3ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#111827',
            marginBottom: '0.5rem',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            color: '#6b7280',
            lineHeight: 1.6,
            fontSize: '0.9rem',
          }}
        >
          {description}
        </p>
      </div>
    </div>
  )
}
