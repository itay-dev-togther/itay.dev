import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .schema('itay')
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240,
        backgroundColor: '#1f2937',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Link href="/admin" style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#fff',
          textDecoration: 'none',
          marginBottom: '2rem',
        }}>
          Admin Panel
        </Link>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link href="/admin" style={navLinkStyle}>
            Dashboard
          </Link>
          <Link href="/admin/templates" style={navLinkStyle}>
            Templates
          </Link>
          <Link href="/admin/projects" style={navLinkStyle}>
            Projects
          </Link>
          <Link href="/admin/activity" style={navLinkStyle}>
            Activity
          </Link>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <Link href="/" style={{
            ...navLinkStyle,
            fontSize: '0.8rem',
            opacity: 0.7,
          }}>
            ← Back to Site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        flex: 1,
        backgroundColor: '#f9fafb',
        padding: '2rem',
      }}>
        {children}
      </main>
    </div>
  )
}

const navLinkStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  color: '#d1d5db',
  textDecoration: 'none',
  borderRadius: '8px',
  fontSize: '0.9rem',
}
