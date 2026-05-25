'use client'

interface SummaryCardProps {
  lead: Record<string, string>
}

const LABEL_MAP: Record<string, string> = {
  name:     'Name',
  company:  'Company',
  problem:  'Problem',
  timeline: 'Timeline',
  budget:   'Budget / Stage',
  tier:     'Lead Tier',
}

const TIER_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  HIGH:   { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
  MEDIUM: { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
  LOW:    { bg: '#F9FAFB', color: '#6B7280', border: '#E5E7EB' },
}

export function SummaryCard({ lead }: SummaryCardProps) {
  const tier = lead.tier ?? 'LOW'
  const tierStyle = TIER_STYLE[tier] ?? TIER_STYLE['LOW']

  return (
    <>
      <style>{`
        @keyframes summaryIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div style={{ animation: 'summaryIn 0.4s ease' }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#6B7280',
            letterSpacing: '0.08em',
            margin: '0 0 16px',
            textTransform: 'uppercase',
          }}
        >
          Call Summary
        </p>

        {/* Tier badge */}
        {lead.tier && (
          <div
            style={{
              display: 'inline-block',
              background: tierStyle.bg,
              border: `1px solid ${tierStyle.border}`,
              color: tierStyle.color,
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            {tier === 'HIGH' ? '🔥 High Value Lead' : tier === 'MEDIUM' ? '⚡ Warm Lead' : '📋 Standard Lead'}
          </div>
        )}

        {/* All captured fields */}
        {Object.entries(lead)
          .filter(([key]) => key !== 'tier')
          .map(([key, value]) => (
            <div key={key} style={{ marginBottom: 12 }}>
              <p
                style={{
                  fontSize: 11,
                  color: '#9CA3AF',
                  fontWeight: 600,
                  margin: '0 0 2px',
                  textTransform: 'uppercase',
                }}
              >
                {LABEL_MAP[key] ?? key}
              </p>
              <p style={{ fontSize: 14, color: 'var(--foreground)', margin: 0 }}>
                {value}
              </p>
            </div>
          ))}

        {/* CTA based on tier */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          {tier === 'HIGH' ? (
            <p style={{ fontSize: 13, color: '#15803D', fontWeight: 500 }}>
              Husain has been notified and will reach out personally.
            </p>
          ) : (
            <a
              href="https://calendly.com/husain-maneuver/30min"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-block',
                background: '#111827',
                color: 'white',
                padding: '10px 20px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Book a follow-up call
            </a>
          )}
        </div>
      </div>
    </>
  )
}