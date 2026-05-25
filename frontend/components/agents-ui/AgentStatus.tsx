'use client'

// ── Types ──────────────────────────────────────────────
type Status = 'idle' | 'listening' | 'thinking' | 'speaking' | string

interface StatusConfig {
  label: string
  color: string
  pulse: boolean
}

interface AgentStatusProps {
  status: Status
}

// ── Config ─────────────────────────────────────────────
const STATUS_CONFIG: Record<string, StatusConfig> = {
  idle:       { label: 'Waiting',   color: '#6B7280', pulse: false },
  listening:  { label: 'Listening', color: '#1D9E75', pulse: true  },
  thinking:   { label: 'Thinking',  color: '#7C3AED', pulse: true  },
  speaking:   { label: 'Speaking',  color: '#2563EB', pulse: true  },
}

// ── Component ──────────────────────────────────────────
export function AgentStatus({ status }: AgentStatusProps) {
  const config: StatusConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG['idle']

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: config.color,
          animation: config.pulse ? 'agentPulse 1.5s infinite' : 'none',
        }}
      />
      <span style={{ fontSize: 14, color: config.color, fontWeight: 500 }}>
        {config.label}
      </span>
      <style>{`
        @keyframes agentPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </div>
  )
}