'use client'

import type { LeadData } from '@/hooks/agents-ui/useAgentUI'

// ── Types ──────────────────────────────────────────────
interface LeadPanelProps {
  leadData: LeadData
}

const FIELD_LABELS: Record<keyof LeadData, string> = {
  name:     'Name',
  company:  'Company',
  problem:  'Problem',
  timeline: 'Timeline',
  budget:   'Budget / Stage',
}

// ── Component ──────────────────────────────────────────
export function LeadPanel({ leadData }: LeadPanelProps) {
  const hasAny = Object.values(leadData).some(Boolean)

  return (
    <div
      style={{
        background: 'var(--background)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '20px 24px',
      }}
    >
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
        Discovery Capture
      </p>

      {!hasAny && (
        <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>
          Fields appear as the conversation progresses...
        </p>
      )}

      {(Object.keys(FIELD_LABELS) as Array<keyof LeadData>).map((key) =>
        leadData[key] ? (
          <div
            key={key}
            style={{ marginBottom: 14, animation: 'leadFadeIn 0.4s ease' }}
          >
            <p
              style={{
                fontSize: 11,
                color: '#9CA3AF',
                fontWeight: 600,
                margin: '0 0 2px',
                textTransform: 'uppercase',
              }}
            >
              {FIELD_LABELS[key]}
            </p>
            <p style={{ fontSize: 14, color: 'var(--foreground)', margin: 0 }}>
              {leadData[key]}
            </p>
          </div>
        ) : null
      )}

      <style>{`
        @keyframes leadFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}