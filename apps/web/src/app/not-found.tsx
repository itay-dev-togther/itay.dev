import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fafafa',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: 500,
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '6rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem',
        }}>
          404
        </div>

        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#111827',
          marginBottom: '0.75rem',
        }}>
          Page not found
        </h1>

        <p style={{
          fontSize: '1rem',
          color: '#6b7280',
          marginBottom: '2rem',
          lineHeight: 1.6,
        }}>
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
          It might have been moved or doesn&apos;t exist.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link
            href="/"
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#fff',
              backgroundColor: '#6366f1',
              borderRadius: '8px',
              textDecoration: 'none',
            }}
          >
            Go Home
          </Link>

          <Link
            href="/projects"
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#374151',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              textDecoration: 'none',
            }}
          >
            Browse Projects
          </Link>
        </div>
      </div>
    </div>
  )
}
