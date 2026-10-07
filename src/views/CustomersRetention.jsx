import {
  ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar,
  XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, Cell,
} from 'recharts'
import ChartCard from '../components/ChartCard.jsx'
import ChartTooltip from '../components/ChartTooltip.jsx'
import { usd, usdCompact, int, pct } from '../lib/format.js'
import { ACCENT, RFM_COLORS, TIER_COLORS } from '../lib/colors.js'

const axis = { stroke: '#52525b', fontSize: 11, tickLine: false, axisLine: false }
const grid = <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />

// Matriz de coortes (retenção por mês da 1ª compra × offset em meses)
function CohortMatrix({ cohorts }) {
  const rows = cohorts.slice(-18) // últimos 18 meses de coortes p/ legibilidade
  const cell = (v) => ({
    background: `rgba(16,185,129,${0.08 + (v / 100) * 0.8})`,
    color: v > 55 ? '#022c22' : '#a7f3d0',
  })
  return (
    <div className="overflow-x-auto">
      <table className="text-[11px] border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="text-white/40 font-medium text-left pr-2">Coorte</th>
            <th className="text-white/40 font-medium pr-2">Tam.</th>
            {Array.from({ length: 12 }, (_, i) => <th key={i} className="text-white/40 font-medium w-9">M{i}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.cohort}>
              <td className="text-white/60 pr-2 whitespace-nowrap">{c.cohort}</td>
              <td className="text-white/40 pr-2 text-right">{int(c.size)}</td>
              {c.retention.map((v, i) => (
                <td key={i} className="text-center rounded" style={{ ...cell(v), height: 26 }}>{v ? `${v}%` : ''}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function CustomersRetention({ data }) {
  const { rfm, cohorts, segments, by_geo } = data
  const scatterBySeg = Object.entries(
    rfm.scatter.reduce((acc, p) => ((acc[p.seg] ??= []).push(p), acc), {}),
  )

  return (
    <div className="space-y-4">
      <ChartCard title="Retenção por Coorte" subtitle="% da coorte (mês da 1ª compra) ativa em cada mês seguinte">
        <CohortMatrix cohorts={cohorts} />
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard className="lg:col-span-2" title="Segmentação RFM"
          subtitle="Frequência (pedidos) × Valor (gasto) · cor = segmento" bodyClass="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
              {grid}
              <XAxis type="number" dataKey="x" name="Frequência" {...axis}
                label={{ value: 'Pedidos', position: 'insideBottom', offset: -2, fill: '#71717a', fontSize: 11 }} />
              <YAxis type="number" dataKey="y" name="Gasto" {...axis} tickFormatter={usdCompact} width={48} />
              <ZAxis type="number" range={[24, 24]} />
              <Tooltip cursor={{ strokeDasharray: '3 3', stroke: '#52525b' }}
                content={<ChartTooltip formatter={(v, n) => (n === 'Gasto' ? usd(v) : int(v))} />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#a1a1aa' }} />
              {scatterBySeg.map(([seg, pts]) => (
                <Scatter key={seg} name={seg} data={pts} fill={RFM_COLORS[seg] || ACCENT.cyan} fillOpacity={0.55} />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Segmentos RFM" subtitle="distribuição da base" bodyClass="overflow-y-auto">
          <div className="space-y-2">
            {rfm.summary.map((s) => (
              <div key={s.segment} className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full shrink-0" style={{ background: RFM_COLORS[s.segment] || ACCENT.cyan }} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/85 truncate">{s.segment}</span>
                    <span className="text-white/50">{pct(s.share)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 mt-1 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${s.share}%`, background: RFM_COLORS[s.segment] || ACCENT.cyan }} />
                  </div>
                  <p className="text-[11px] text-white/35 mt-0.5">{int(s.customers)} clientes · gasto médio {usd(s.avgMonetary)}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Churn por Tier" subtitle="% de clientes que deram churn" bodyClass="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={segments.byTier} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              {grid}
              <XAxis dataKey="tier" {...axis} />
              <YAxis {...axis} tickFormatter={(v) => `${v}%`} width={40} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<ChartTooltip formatter={(v, n) => (n === 'Churn' ? pct(v) : usd(v))} />} />
              <Bar dataKey="churnRate" name="Churn" radius={[4, 4, 0, 0]}>
                {segments.byTier.map((t) => <Cell key={t.tier} fill={TIER_COLORS[t.tier]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Base e Gasto Médio por Faixa Etária" subtitle="clientes e LTV médio" bodyClass="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={segments.byAge} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              {grid}
              <XAxis dataKey="bucket" {...axis} />
              <YAxis yAxisId="l" {...axis} width={40} />
              <YAxis yAxisId="r" orientation="right" {...axis} tickFormatter={usdCompact} width={44} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<ChartTooltip formatter={(v, n) => (n === 'Clientes' ? int(v) : usd(v))} />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} />
              <Bar yAxisId="l" dataKey="customers" name="Clientes" fill={ACCENT.sky} radius={[4, 4, 0, 0]} />
              <Bar yAxisId="r" dataKey="avgSpend" name="Gasto médio" fill={ACCENT.violet} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Clientes e Churn por País" subtitle="ordenado por gasto total (LTV)" bodyClass="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-white/40 text-xs">
            <tr className="text-left">
              <th className="py-2 font-medium">País</th>
              <th className="py-2 font-medium text-right">Clientes</th>
              <th className="py-2 font-medium text-right">Gasto total</th>
              <th className="py-2 font-medium text-right">AOV</th>
              <th className="py-2 font-medium text-right">Churn</th>
            </tr>
          </thead>
          <tbody>
            {by_geo.slice(0, 12).map((g) => (
              <tr key={g.country} className="border-t border-white/5">
                <td className="py-2 text-white/85">{g.country}</td>
                <td className="py-2 text-right text-white/60">{int(g.customers)}</td>
                <td className="py-2 text-right font-medium text-white/90">{usd(g.revenue)}</td>
                <td className="py-2 text-right text-white/60">{usd(g.aov)}</td>
                <td className="py-2 text-right" style={{ color: g.churnRate > 10 ? '#fb7185' : '#a1a1aa' }}>{pct(g.churnRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ChartCard>
    </div>
  )
}
