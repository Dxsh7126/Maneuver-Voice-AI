'use client'

export function BookCall() {
  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 28,
          animation: 'fadeIn 0.4s ease',
        }}
      >
        <p
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--foreground)',
            margin: '0 0 8px',
          }}
        >
          Book a 30-minute call
        </p>
            <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 20px' }}>
            No pitch, no deck. Just an honest conversation about whether AI
            moves the needle for your business.
            </p>

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
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
            }}
            >
            Book on Calendly
            </a>
      </div>
    </>
  )
}