// components/panels/HighValueClose.jsx
export function HighValueClose() {
  return (
    <div style={{
      background: "linear-gradient(135deg, #1D9E75, #0D7A5A)",
      borderRadius: 12, padding: 28, color: "white",
      animation: "fadeIn 0.4s ease",
    }}>
      <p style={{ fontSize: 24, marginBottom: 8 }}>✅</p>
      <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
        Husain will reach out personally.
      </p>
      <p style={{ fontSize: 14, opacity: 0.85 }}>
        Based on what you shared, this is exactly the kind of engagement 
        Husain handles directly. Expect a message within the hour.
      </p>
      <p style={{ fontSize: 13, marginTop: 16, opacity: 0.7 }}>
        husain@maneuver.ae
      </p>
    </div>
  )
}