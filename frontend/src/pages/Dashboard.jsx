import { useEffect, useState } from "react";
import {
  fetchKpis, fetchTendencia, fetchDistribuicaoAtrasos,
  fetchComportamento, fetchRegional, fetchStatusCobrancas,
} from "../services/api";
import KpiCards                    from "../components/KpiCards";
import TendenciaChart              from "../components/TendenciaChart";
import FaixasAtrasoChart           from "../components/FaixasAtrasoChart";
import StatusCobrancasChart        from "../components/StatusCobrancasChart";
import RecuperacaoAssessoriaChart  from "../components/RecuperacaoAssessoriaChart";
import RegionalChart               from "../components/RegionalChart";
import ComportamentoPagamentosChart from "../components/ComportamentoPagamentosChart";
import InsightsPanel               from "../components/InsightsPanel";

function Section({ title, children }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ margin: 0, color: "#cbd5e1", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, borderBottom: "1px solid #334155", paddingBottom: 8 }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "#64748b" }}>
      Carregando dados...
    </div>
  );
}

export default function Dashboard() {
  const [kpis, setKpis]         = useState(null);
  const [tendencia, setTendencia] = useState(null);
  const [atrasos, setAtrasos]   = useState(null);
  const [comportamento, setComportamento] = useState(null);
  const [regional, setRegional] = useState(null);
  const [cobrancas, setCobrancas] = useState(null);
  const [error, setError]       = useState(null);

  useEffect(() => {
    Promise.all([
      fetchKpis(),
      fetchTendencia(),
      fetchDistribuicaoAtrasos(),
      fetchComportamento(),
      fetchRegional(),
      fetchStatusCobrancas(),
    ])
      .then(([k, t, a, c, r, s]) => {
        setKpis(k);
        setTendencia(t);
        setAtrasos(a);
        setComportamento(c);
        setRegional(r);
        setCobrancas(s);
      })
      .catch(err => setError("Não foi possível conectar à API. Verifique se o servidor Flask está rodando na porta 5000."));
  }, []);

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#ef4444", padding: 32, textAlign: "center" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Erro de conexão</div>
          <div style={{ color: "#94a3b8", fontSize: 14 }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 40 }}>

      {/* Header */}
      <div>
        <h1 style={{ margin: 0, color: "#f1f5f9", fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>
          CreditGuard <span style={{ color: "#3b82f6" }}>Dashboard</span>
        </h1>
        <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 13 }}>
          Análise exploratória de inadimplência e recuperação de crédito
        </p>
      </div>

      {/* KPIs */}
      <Section title="Indicadores-chave">
        {kpis ? <KpiCards data={kpis} /> : <Spinner />}
      </Section>

      {/* Tendência */}
      <Section title="Tendência Temporal">
        {tendencia ? <TendenciaChart data={tendencia} /> : <Spinner />}
      </Section>

      {/* Atrasos */}
      <Section title="Distribuição dos Atrasos">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {atrasos ? <FaixasAtrasoChart data={atrasos} /> : <Spinner />}
          {atrasos ? <InsightsPanel title="Insights — Atrasos" insights={atrasos.insights ?? []} /> : <Spinner />}
        </div>
      </Section>

      {/* Status das cobranças */}
      <Section title="Status das Cobranças">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {cobrancas ? <StatusCobrancasChart data={cobrancas} /> : <Spinner />}
          {cobrancas ? <RecuperacaoAssessoriaChart data={cobrancas} /> : <Spinner />}
        </div>
        {cobrancas ? <InsightsPanel title="Insights — Cobranças" insights={cobrancas.insights ?? []} /> : <Spinner />}
      </Section>

      {/* Comportamento de pagamentos */}
      <Section title="Comportamento de Pagamentos">
        {comportamento ? <ComportamentoPagamentosChart data={comportamento} /> : <Spinner />}
        {comportamento ? <InsightsPanel title="Insights — Pagamentos" insights={comportamento.insights ?? []} /> : <Spinner />}
      </Section>

      {/* Regional */}
      <Section title="Distribuição Regional">
        {regional ? <RegionalChart data={regional} /> : <Spinner />}
        {regional ? <InsightsPanel title="Insights — Regional" insights={regional.insights ?? []} /> : <Spinner />}
      </Section>

    </div>
  );
}
