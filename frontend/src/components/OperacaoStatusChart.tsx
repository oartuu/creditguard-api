import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
} from "recharts";
import type { OCStatusItem, OCEvolucaoMes } from "../types/api";
import ChartCard from "./ChartCard";
import { useChartTheme } from "../contexts/ThemeContext";

interface Props {
  status_cobrancas: OCStatusItem[];
  evolucao_mensal: OCEvolucaoMes[];
}

const fmtBRL = (v: number) =>
  v >= 1_000_000 ? `R$ ${(v / 1_000_000).toFixed(1)}M` : `R$ ${(v / 1_000).toFixed(0)}K`;

export default function OperacaoStatusChart({ status_cobrancas, evolucao_mensal }: Props) {
  const ct = useChartTheme();

  const pieData = status_cobrancas.map(s => ({
    name: s.status,
    value: s.total,
    pct: s.pct,
    valor: s.valor,
    fill: s.cor,
  }));

  const barData = evolucao_mensal.map(m => ({
    mes: m.mes.slice(5),
    acordos: m.acordos,
    em_aberto: m.em_aberto,
    insucesso: m.insucesso,
    ajuizado: m.ajuizado,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Donut - distribuição */}
        <ChartCard title="Distribuição por Status" subtitle="Contratos por desfecho de cobrança">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData} cx="50%" cy="50%"
                innerRadius={60} outerRadius={100}
                dataKey="value" nameKey="name" paddingAngle={3}
              >
                {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: ct.tooltip.background, border: `1px solid ${ct.tooltip.border}`, borderRadius: 8 }}
                formatter={(v: unknown, _n: unknown, p: { payload?: { pct?: number; valor?: number } }) => [
                  `${(v as number).toLocaleString("pt-BR")} contratos (${p.payload?.pct ?? 0}%) — ${fmtBRL(p.payload?.valor ?? 0)}`,
                  "",
                ]}
              />
              <Legend wrapperStyle={{ color: ct.legend, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Cards de status */}
        <ChartCard title="Métricas por Status" subtitle="Contratos e valor financeiro por desfecho">
          <div className="flex flex-col gap-3 pt-1">
            {status_cobrancas.map(s => (
              <div key={s.status} className="flex items-center gap-3 px-3 py-3 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.cor }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{s.status}</div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {s.total.toLocaleString("pt-BR")} contratos · {fmtBRL(s.valor)}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[14px] font-black" style={{ color: s.cor }}>{s.pct}%</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">{s.pct_valor}% do valor</div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Evolução mensal stacked */}
      <ChartCard title="Evolução Mensal — Volume por Status" subtitle="Contratos por mês e desfecho de cobrança">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false} />
            <XAxis dataKey="mes" tick={{ fill: ct.tick, fontSize: 11 }} />
            <YAxis tick={{ fill: ct.tick, fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: ct.tooltip.background, border: `1px solid ${ct.tooltip.border}`, borderRadius: 8 }}
              labelFormatter={(l: unknown) => `Mês ${l}`}
            />
            <Bar dataKey="acordos"   stackId="a" fill="#22c55e" name="Acordo Firmado"  radius={[0, 0, 0, 0]} />
            <Bar dataKey="em_aberto" stackId="a" fill="#f07c19" name="Em Aberto"       radius={[0, 0, 0, 0]} />
            <Bar dataKey="insucesso" stackId="a" fill="#e32551" name="Insucesso"        radius={[0, 0, 0, 0]} />
            <Bar dataKey="ajuizado"  stackId="a" fill="#8b5cf6" name="Ajuizado"         radius={[4, 4, 0, 0]}>
              <LabelList dataKey="ajuizado" position="top" style={{ fill: ct.tick, fontSize: 9 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
