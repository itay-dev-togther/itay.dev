import { SkeletonTable } from '@/components/ui/Skeleton'

export default function AdminLoading() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          width: 200,
          height: 28,
          backgroundColor: '#e5e7eb',
          borderRadius: '4px',
          marginBottom: '0.5rem',
          animation: 'pulse 2s infinite',
        }} />
        <div style={{
          width: 300,
          height: 18,
          backgroundColor: '#e5e7eb',
          borderRadius: '4px',
          animation: 'pulse 2s infinite',
        }} />
      </div>

      <SkeletonTable rows={5} />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
