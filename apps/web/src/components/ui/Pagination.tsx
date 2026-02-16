'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page > 1) {
      params.set('page', String(page))
    } else {
      params.delete('page')
    }
    const qs = params.toString()
    router.push(`${basePath}${qs ? `?${qs}` : ''}`)
  }

  // Calculate visible page numbers
  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  const buttonBase: React.CSSProperties = {
    padding: '0.5rem 0.75rem',
    fontSize: '0.85rem',
    fontWeight: 500,
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    cursor: 'pointer',
    backgroundColor: '#fff',
    color: '#374151',
    transition: 'all 0.15s',
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0.35rem',
      marginTop: '2rem',
    }}>
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        style={{
          ...buttonBase,
          opacity: currentPage <= 1 ? 0.4 : 1,
          cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
        }}
      >
        Prev
      </button>

      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} style={{ padding: '0.5rem 0.25rem', color: '#9ca3af' }}>
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => goToPage(page)}
            style={{
              ...buttonBase,
              backgroundColor: page === currentPage ? '#6366f1' : '#fff',
              color: page === currentPage ? '#fff' : '#374151',
              borderColor: page === currentPage ? '#6366f1' : '#e5e7eb',
              fontWeight: page === currentPage ? 600 : 500,
            }}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        style={{
          ...buttonBase,
          opacity: currentPage >= totalPages ? 0.4 : 1,
          cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
        }}
      >
        Next
      </button>
    </div>
  )
}
