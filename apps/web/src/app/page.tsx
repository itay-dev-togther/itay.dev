import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()

  // Get stats
  const { count: projectCount } = await supabase
    .schema('itay')
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: ticketCount } = await supabase
    .schema('itay')
    .from('tickets')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'available')

  const { count: contributorCount } = await supabase
    .schema('itay')
    .from('contributions')
    .select('user_id', { count: 'exact', head: true })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '6rem 2rem',
        textAlign: 'center',
        color: '#fff',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            marginBottom: '1.5rem',
            lineHeight: 1.1,
          }}>
            Build Your Portfolio.<br />
            Ship Real Code.
          </h1>
          <p style={{
            fontSize: '1.25rem',
            opacity: 0.9,
            marginBottom: '2.5rem',
            lineHeight: 1.6,
          }}>
            Contribute to open source projects, claim tickets, and build proof of your skills.
            Every merged PR is a portfolio piece.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/projects"
              style={{
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#667eea',
                backgroundColor: '#fff',
                borderRadius: '12px',
                textDecoration: 'none',
                transition: 'transform 0.2s',
              }}
            >
              Browse Projects
            </Link>
            <Link
              href="/login"
              style={{
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#fff',
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: '12px',
                textDecoration: 'none',
                border: '2px solid rgba(255,255,255,0.3)',
              }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{
        maxWidth: 900,
        margin: '-3rem auto 0',
        padding: '0 2rem',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
        }}>
          <StatCard number={projectCount || 0} label="Active Projects" />
          <StatCard number={ticketCount || 0} label="Available Tickets" />
          <StatCard number={contributorCount || 0} label="Contributors" />
        </div>
      </section>

      {/* How it works */}
      <section style={{
        maxWidth: 1000,
        margin: '0 auto',
        padding: '5rem 2rem',
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: '3rem',
          color: '#111827',
        }}>
          How It Works
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
        }}>
          <StepCard
            number="1"
            title="Browse Projects"
            description="Find open source projects that match your skills and interests. From beginner-friendly to advanced."
          />
          <StepCard
            number="2"
            title="Claim a Ticket"
            description="Pick a ticket you want to work on. You'll get a dedicated branch and clear acceptance criteria."
          />
          <StepCard
            number="3"
            title="Ship & Get Credit"
            description="Submit your PR, get it reviewed and merged. Your contribution is tracked in your portfolio."
          />
        </div>
      </section>

      {/* CTA */}
      <section style={{
        backgroundColor: '#111827',
        padding: '4rem 2rem',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#fff',
          marginBottom: '1rem',
        }}>
          Ready to start contributing?
        </h2>
        <p style={{
          color: '#9ca3af',
          marginBottom: '2rem',
          fontSize: '1.1rem',
        }}>
          Join developers building their portfolios with real contributions.
        </p>
        <Link
          href="/projects"
          style={{
            display: 'inline-block',
            padding: '1rem 2.5rem',
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#111827',
            backgroundColor: '#fff',
            borderRadius: '12px',
            textDecoration: 'none',
          }}
        >
          View Projects
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '0.875rem',
      }}>
        Built with Next.js & Supabase
      </footer>
    </div>
  )
}

function StatCard({ number, label }: { number: number; label: string }) {
  return (
    <div style={{
      padding: '2rem',
      backgroundColor: '#fff',
      borderRadius: '16px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: '2.5rem',
        fontWeight: 700,
        color: '#6366f1',
        marginBottom: '0.5rem',
      }}>
        {number}
      </div>
      <div style={{ color: '#6b7280', fontSize: '0.95rem' }}>
        {label}
      </div>
    </div>
  )
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div style={{
      padding: '2rem',
      backgroundColor: '#fff',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: '12px',
        backgroundColor: '#eef2ff',
        color: '#6366f1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.25rem',
        fontWeight: 700,
        marginBottom: '1.25rem',
      }}>
        {number}
      </div>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 600,
        color: '#111827',
        marginBottom: '0.75rem',
      }}>
        {title}
      </h3>
      <p style={{
        color: '#6b7280',
        lineHeight: 1.6,
        fontSize: '0.95rem',
      }}>
        {description}
      </p>
    </div>
  )
}
