import { Skeleton } from '@/components/ui/Skeleton'

export default function ProfileLoading() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      {/* Header skeleton */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '3rem 2rem',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Skeleton width={100} height={100} borderRadius="50%" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
            <div>
              <Skeleton width={200} height={32} style={{ marginBottom: '0.75rem', backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <Skeleton width={250} height={18} style={{ marginBottom: '0.5rem', backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <Skeleton width={180} height={16} style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Stats skeleton */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginTop: '-2rem',
        }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '1.25rem',
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
            }}>
              <Skeleton width={32} height={32} style={{ margin: '0 auto 0.5rem' }} />
              <Skeleton width={60} height={28} style={{ margin: '0 auto 0.25rem' }} />
              <Skeleton width={80} height={14} style={{ margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </section>

      {/* Contributions skeleton */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
        <Skeleton width={200} height={24} style={{ marginBottom: '1.5rem' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              padding: '1.25rem',
            }}>
              <Skeleton width="70%" height={20} style={{ marginBottom: '0.5rem' }} />
              <Skeleton width="50%" height={16} />
            </div>
          ))}
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
