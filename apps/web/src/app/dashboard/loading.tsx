import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      {/* Header skeleton */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '3rem 2rem',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Skeleton width={300} height={36} style={{ marginBottom: '0.75rem', backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <Skeleton width={400} height={20} style={{ marginBottom: '2rem', backgroundColor: 'rgba(255,255,255,0.2)' }} />

          <div style={{ display: 'flex', gap: '2.5rem' }}>
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton width={60} height={36} style={{ marginBottom: '0.5rem', backgroundColor: 'rgba(255,255,255,0.2)' }} />
                <Skeleton width={80} height={16} style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content skeleton */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '2.5rem 2rem' }}>
        <Skeleton width={200} height={24} style={{ marginBottom: '1.5rem' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
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
