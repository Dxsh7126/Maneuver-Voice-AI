// components/panels/ServicesCard.jsx

const SERVICES = [
  {
    name:   "Intelligent Workflows",
    icon:   "⚡",
    desc:   "Connect your tools into automated pipelines. 40% less manual work.",
  },
  {
    name:   "Voice AI",
    icon:   "🎙️",
    desc:   "Custom voice agents in Arabic and English, 24/7 inbound handling.",
  },
  {
    name:   "AI Agents",
    icon:   "🤖",
    desc:   "Handle enquiries, route requests, free your team for higher-value work.",
  },
  {
    name:   "Bespoke Applications",
    icon:   "🛠️",
    desc:   "Custom systems built from scratch. Your IP, designed around how you work.",
  },
  {
    name:   "Systems Integration",
    icon:   "🔗",
    desc:   "Connect AI to your CRM, email, and databases. One unified system.",
  },
]

export function ServicesCard() {
  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: "#6B7280",
                  letterSpacing: "0.08em", marginBottom: 16 }}>
        WHAT WE DO
      </p>

      {SERVICES.map((s, i) => (
        <div key={s.name} style={{
          display: "flex", gap: 12, marginBottom: 14,
          animation: `fadeIn 0.3s ease ${i * 0.07}s both`,
        }}>
          <span style={{ fontSize: 20 }}>{s.icon}</span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600,
                        color: "var(--foreground)", margin: "0 0 2px" }}>
              {s.name}
            </p>
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
              {s.desc}
            </p>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}