'use client'

import { useState } from 'react'
import { AIChat } from './AIChat'

interface AIHelpButtonProps {
  ticketId: string
  ticketTitle: string
}

export function AIHelpButton({ ticketId, ticketTitle }: AIHelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          width: '100%',
          padding: '0.75rem 1rem',
          fontSize: '0.9rem',
          fontWeight: 600,
          color: '#6366f1',
          backgroundColor: '#eef2ff',
          border: '2px solid #c7d2fe',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#e0e7ff'
          e.currentTarget.style.borderColor = '#a5b4fc'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#eef2ff'
          e.currentTarget.style.borderColor = '#c7d2fe'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        Get AI Help
      </button>

      {isOpen && (
        <AIChat
          ticketId={ticketId}
          ticketTitle={ticketTitle}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
