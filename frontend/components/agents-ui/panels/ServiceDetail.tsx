'use client'

interface ServiceDetailProps {
  name: string
}

const SERVICE_DETAILS: Record<string, { icon: string; description: string; result: string }> = {
  'Intelligent Workflows': {
    icon: '⚡',
    description:
      'We connect your existing tools into automated pipelines — no ripping and replacing what works. Orders, approvals, status updates, handoffs — all automated.',
    result: '40% reduction in manual work. 30% efficiency increase. 10x faster iteration.',
  },
  'Voice AI': {
    icon: '🎙️',
    description:
      'Custom voice agents in Arabic and English that handle inbound calls 24/7. Integrated directly with your CRM and booking systems.',
    result: 'Your team stops answering repetitive calls. Customers get instant responses.',
  },
  'AI Agents': {
    icon: '🤖',
    description:
      'Self-learning agents that handle enquiries, route requests, and free your team for higher-value work. Gets smarter with every interaction.',
    result: 'Front-line queries handled automatically. Your team focuses on what matters.',
  },
  'Bespoke Applications': {
    icon: '🛠️',
    description:
      'Custom systems built from scratch around how you actually work — not stitched-together SaaS tools. Your IP, your workflow, built to scale.',
    result: 'One platform replaces five scattered tools. Full ownership.',
  },
  'Systems Integration': {
    icon: '🔗',
    description:
      'We connect your AI to your existing CRM, email, databases, and ops tools. Everything in one unified system that talks to itself.',
    result: 'No more copy-pasting between tools. One source of truth.',
  },
}

export function ServiceDetail({ name }: ServiceDetailProps) {
  const detail = SERVICE_DETAILS[name] ?? {
    icon: '📋',
    description: 'Ask Husain directly for more detail on this service.',
    result: '',
  }

  return (
    <>
      <style>{`
        @keyframes detailFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ animation: 'detailFadeIn 0.35s ease' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>{detail.icon}</div>

        <p
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--foreground)',
            margin: '0 0 12px',
          }}
        >
          {name}
        </p>

        <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, margin: '0 0 16px' }}>
          {detail.description}
        </p>

        {detail.result && (
          <div
            style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: 8,
              padding: '12px 16px',
            }}
          >
            <p style={{ fontSize: 13, color: '#15803D', margin: 0, fontWeight: 500 }}>
              {detail.result}
            </p>
          </div>
        )}
      </div>
    </>
  )
}