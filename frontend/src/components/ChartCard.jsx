export default function ChartCard({ title, subtitle, children }) {
  return (
    <div style={{
      background: "#1e293b", borderRadius: 12, padding: "20px 24px",
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      <div>
        <h3 style={{ margin: 0, color: "#f1f5f9", fontSize: 15, fontWeight: 600 }}>{title}</h3>
        {subtitle && <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 12 }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
