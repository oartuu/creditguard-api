const ICONS = { "⚠": "#f97316", "✅": "#22c55e", "❌": "#ef4444", "📊": "#3b82f6" };

function InsightCard({ insight, detalhe }) {
  return (
    <div style={{
      background: "#0f172a", borderRadius: 8, padding: "14px 16px",
      borderLeft: "3px solid #3b82f6", display: "flex", flexDirection: "column", gap: 6,
    }}>
      <span style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 600 }}>{insight}</span>
      <span style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.5 }}>{detalhe}</span>
    </div>
  );
}

export default function InsightsPanel({ title, insights }) {
  if (!insights?.length) return null;
  return (
    <div style={{ background: "#1e293b", borderRadius: 12, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
      <h3 style={{ margin: 0, color: "#f1f5f9", fontSize: 15, fontWeight: 600 }}>{title ?? "Insights"}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {insights.map((ins, i) => <InsightCard key={i} {...ins} />)}
      </div>
    </div>
  );
}
