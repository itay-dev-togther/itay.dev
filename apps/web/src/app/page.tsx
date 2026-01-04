import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/home/StatCard'
import { StepCard } from '@/components/home/StepCard'
import { FeatureCard } from '@/components/home/FeatureCard'

// Force dynamic rendering - data should be fresh on each request
export const dynamic = 'force-dynamic'

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
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
        padding: '5rem 2rem 8rem',
        textAlign: 'center',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.6,
        }} />

        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: 500,
            marginBottom: '1.5rem',
            backdropFilter: 'blur(4px)',
          }}>
            <span style={{
              width: 8,
              height: 8,
              backgroundColor: '#86efac',
              borderRadius: '50%',
              animation: 'pulse 2s infinite',
            }} />
            Now accepting contributors
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            fontWeight: 800,
            marginBottom: '1.5rem',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}>
            Build Your Portfolio.<br />
            Ship Real Code.
          </h1>
          <p style={{
            fontSize: '1.25rem',
            opacity: 0.9,
            marginBottom: '2.5rem',
            lineHeight: 1.6,
            maxWidth: 600,
            margin: '0 auto 2.5rem',
          }}>
            Contribute to open source projects, claim tickets, and build proof of your skills.
            Every merged PR is a portfolio piece.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/projects"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#6366f1',
                backgroundColor: '#fff',
                borderRadius: '12px',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              Browse Projects
            </Link>
            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#fff',
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: '12px',
                textDecoration: 'none',
                border: '2px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{
        maxWidth: 900,
        margin: '-4rem auto 0',
        padding: '0 2rem',
        position: 'relative',
        zIndex: 10,
      }}>
        <div className="stats-grid" style={{
          display: 'grid',
          gap: '1.5rem',
        }}>
          <StatCard
            number={projectCount || 0}
            label="Active Projects"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            }
          />
          <StatCard
            number={ticketCount || 0}
            label="Available Tickets"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            }
          />
          <StatCard
            number={contributorCount || 0}
            label="Contributors"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />
        </div>
      </section>

      {/* How it works */}
      <section style={{
        maxWidth: 1000,
        margin: '0 auto',
        padding: '6rem 2rem',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#6366f1',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '0.75rem',
          }}>
            Simple Process
          </p>
          <h2 style={{
            fontSize: '2.25rem',
            fontWeight: 700,
            color: '#111827',
            letterSpacing: '-0.02em',
          }}>
            How It Works
          </h2>
        </div>
        <div className="steps-grid" style={{
          display: 'grid',
          gap: '2rem',
        }}>
          <StepCard
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            }
            title="Browse Projects"
            description="Find open source projects that match your skills and interests. From beginner-friendly to advanced."
            step={1}
          />
          <StepCard
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            }
            title="Claim a Ticket"
            description="Pick a ticket you want to work on. You'll get a dedicated branch and clear acceptance criteria."
            step={2}
          />
          <StepCard
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 11-6 6v3h9l3-3" />
                <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
              </svg>
            }
            title="Ship & Get Credit"
            description="Submit your PR, get AI-powered code review, and get it merged. Your contribution is tracked in your portfolio."
            step={3}
          />
        </div>
      </section>

      {/* Features */}
      <section style={{
        backgroundColor: '#f9fafb',
        padding: '5rem 2rem',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#6366f1',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '0.75rem',
            }}>
              Why Choose Us
            </p>
            <h2 style={{
              fontSize: '2.25rem',
              fontWeight: 700,
              color: '#111827',
              letterSpacing: '-0.02em',
            }}>
              Built for Developers
            </h2>
          </div>
          <div className="features-grid" style={{
            display: 'grid',
            gap: '1.5rem',
          }}>
            <FeatureCard
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
              }
              title="AI Code Review"
              description="Get instant, friendly feedback on your code from AI reviewers that help you improve."
            />
            <FeatureCard
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              }
              title="GitHub Integration"
              description="Automatic branch creation, PR linking, and merge tracking. Everything stays in GitHub."
            />
            <FeatureCard
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              }
              title="VS Code Ready"
              description="Open your branch directly in VS Code or GitHub.dev with one click. No setup needed."
            />
            <FeatureCard
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              }
              title="Build Your Portfolio"
              description="Every contribution is tracked. Show potential employers real code you've shipped."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
        padding: '5rem 2rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
          }}>
            Ready to start contributing?
          </h2>
          <p style={{
            color: '#9ca3af',
            marginBottom: '2rem',
            fontSize: '1.1rem',
            lineHeight: 1.6,
          }}>
            Join developers building their portfolios with real contributions.
          </p>
          <Link
            href="/projects"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 2.5rem',
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#111827',
              backgroundColor: '#fff',
              borderRadius: '12px',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            }}
          >
            View Projects
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '2.5rem 2rem',
        textAlign: 'center',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#fff',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          color: '#6b7280',
          fontSize: '0.875rem',
        }}>
          <span>Built with</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#ef4444" stroke="none">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>using Next.js & Supabase</span>
        </div>
      </footer>

      {/* Styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }

        .stats-grid {
          grid-template-columns: repeat(3, 1fr);
        }

        .steps-grid {
          grid-template-columns: repeat(3, 1fr);
        }

        .features-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .steps-grid {
            grid-template-columns: 1fr;
          }
          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
