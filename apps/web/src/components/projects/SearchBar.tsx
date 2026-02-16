'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('search') || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (query.trim()) {
      params.set('search', query.trim())
    } else {
      params.delete('search')
    }
    params.delete('page')
    const qs = params.toString()
    router.push(`/projects${qs ? `?${qs}` : ''}`)
  }

  const handleClear = () => {
    setQuery('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('search')
    params.delete('page')
    const qs = params.toString()
    router.push(`/projects${qs ? `?${qs}` : ''}`)
  }

  return (
    <form onSubmit={handleSubmit} style={{ position: 'relative', maxWidth: '400px' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search projects..."
        style={{
          width: '100%',
          padding: '0.6rem 2.5rem 0.6rem 1rem',
          fontSize: '0.9rem',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          backgroundColor: '#fff',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: '0.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            padding: '0.2rem',
            fontSize: '1rem',
            color: '#9ca3af',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            lineHeight: 1,
          }}
        >
          x
        </button>
      )}
    </form>
  )
}
