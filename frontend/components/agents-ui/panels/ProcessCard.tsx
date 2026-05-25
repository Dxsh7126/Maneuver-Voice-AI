'use client'

const STEPS = [
  {
    number: '01',
    title: 'Understand',
    description:
      'We listen first — no assumptions. Deep dive into your operations, your bottlenecks, and where the real drag is.',
    color: '#2563EB',
  },
  {
    number: '02',
    title: 'Design & Build',
    description:
      'We identify the highest-impact opportunities and build real systems — not prototypes, not decks.',
    color: '#7C3AED',
  },
  {
    number: '03',
    title: 'Launch & Evolve',
    description:
      'We stay through go-live and after. The system gets smarter. Your team gets their time back.',
    color: '#1D9E75',
  },
]

export function ProcessCard() {
  return (
    <>
      <style>{`
        @keyframes stepIn {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#6B7280',
            letterSpacing: '0.08em',
            margin: '0 0 20px',
            textTransform: 'uppercase',
          }}
        >
          How we work
        </p>

        {STEPS.map((step, i) => (
          <div
            key={step.number}
            style={{
              display: 'flex',
              gap: 16,
              marginBottom: 24,
              animation: `stepIn 0.3s ease ${i * 0.1}s both`,
            }}
          >
            {/* Number + connecting line */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: step.color,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {step.number}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    width: 2,
                    flex: 1,
                    background: '#E5E7EB',
                    margin: '4px 0',
                    minHeight: 20,
                  }}
                />
              )}
            </div>

            {/* Text */}
            <div style={{ paddingTop: 6 }}>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--foreground)',
                  margin: '0 0 4px',
                }}
              >
                {step.title}
              </p>
              <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}