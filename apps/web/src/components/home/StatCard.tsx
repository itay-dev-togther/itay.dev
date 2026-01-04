'use client'

import { ReactNode } from 'react'

interface StatCardProps {
  number: number
  label: string
  icon: ReactNode
}

export function StatCard({ number, label, icon }: StatCardProps) {
  return (
    <div
      style={{
        padding: '1.75rem',
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 14px 50px rgba(0,0,0,0.12)'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.08)'
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
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
        <div
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#111827',
            lineHeight: 1,
            marginBottom: '0.25rem',
          }}
        >
          {number}
        </div>
        <div style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  )
}
