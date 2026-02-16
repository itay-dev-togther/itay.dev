'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const FILTERS = [
  { label: 'All Projects', value: '' },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
] as const

export function ProjectFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentDifficulty = searchParams.get('difficulty') || ''

  const handleFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('difficulty', value)
    } else {
      params.delete('difficulty')
    }
    // Reset to page 1 when filtering
    params.delete('page')
    const query = params.toString()
    router.push(`/projects${query ? `?${query}` : ''}`)
  }

  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
    }}>
      {FILTERS.map((filter) => {
        const isActive = currentDifficulty === filter.value
        return (
          <button
            key={filter.value}
            onClick={() => handleFilter(filter.value)}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#6366f1' : '#6b7280',
              backgroundColor: isActive ? '#eef2ff' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {filter.label}
          </button>
        )
      })}
    </div>
  )
}
