import { useState } from 'react'
import {
  ResponsiveContainer, ComposedChart, AreaChart, Area, Line, Bar, BarChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
} from 'recharts'
import ChartCard from '../components/ChartCard.jsx'
import Card from '../components/Card.jsx'
import ChartTooltip from '../components/ChartTooltip.jsx'
import { usd, usdCompact, int } from '../lib/format.js'
import { ACCENT, SERIES } from '../lib/colors.js'

const axis = { stroke: '#52525b', fontSize: 11, tickLine: false, axisLine: false }
const grid = <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

// Heatmap receita: linhas = ano, colunas = mês
function RevenueHeatmap({ monthly }) {
  const years = [...new Set(monthly.map((m) => m.year))].sort()
  const max = Math.max(...monthly.map((m) => m.revenue))
  const get = (y, mo) => monthly.find((m) => m.year === y && m.month === mo)?.revenue
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px] border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="text-white/40 font-medium text-left w-10"></th>
            {MONTHS.map((m) => <th key={m} className="text-white/40 font-medium">{m}</th>)}
          </tr>
        </thead>
        <tbody>
          {years.map((y) => (
            <tr key={y}>
              <td className="text-white/50 font-medium pr-1">{y}</td>
              {MONTHS.map((_, i) => {
                const v = get(y, i + 1)
                const t = v ? v / max : 0
                return (
                  <td key={i} className="text-center rounded"
                    title={v ? `${y}-${String(i + 1).padStart(2, '0')}: ${usd(v)}` : ''}
                    style={{
                      background: v ? `rgba(6,182,212,${0.12 + t * 0.75})` : 'rgba(255,255,255,0.03)',
                      color: t > 0.55 ? '#032023' : '#a1a1aa',
                      height: 30,
                    }}>
                    {v ? usdCompact(v).replace('$', '') : ''}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function RevenueSales({ data, filters }) {
  const { monthly, by_category, products } = data
  const [yoy, setYoy] = useState(false)
  const yearSel = filters.year !== 'all' ? Number(filters.year) : null
  const catSel = filters.category !== 'all' ? filters.category : null

  const mSeries = yearSel ? monthly.filter((m) => m.year === yearSel) : monthly
  const prods = (catSel ? products.filter((p) => p.category === catSel) : products).slice(0, 10)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard className="lg:col-span-2" title="Receita ao Longo do Tempo"
          subtitle={yoy ? 'variação YoY (%)' : 'receita mensal + média móvel 3m'} bodyClass="h-72"
          right={
            <button onClick={() => setYoy((v) => !v)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 hover:bg-white/10 transition">
              {yoy ? 'Ver receita' : 'Ver YoY'}
            </button>
          }>
          <ResponsiveContainer width="100%" height="100%">
            {yoy ? (
              <BarChart data={mSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                {grid}
                <XAxis dataKey="label" {...axis} minTickGap={28} />
                <YAxis {...axis} tickFormatter={(v) => `${v}%`} width={44} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<ChartTooltip formatter={(v) => `${v}%`} />} />
                <Bar dataKey="revenueYoY" name="YoY" radius={[4, 4, 0, 0]}>
                  {mSeries.map((m, i) => <Cell key={i} fill={(m.revenueYoY ?? 0) >= 0 ? ACCENT.emerald : ACCENT.rose} />)}
                </Bar>
              </BarChart>
            ) : (
              <AreaChart data={mSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ACCENT.cyan} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={ACCENT.cyan} stopOpacity={0} />
                  </linearGradient>
                </defs>
                {grid}
                <XAxis dataKey="label" {...axis} minTickGap={28} />
                <YAxis {...axis} tickFormatter={usdCompact} width={48} />
                <Tooltip content={<ChartTooltip formatter={(v) => usd(v)} />} />
                <Area type="monotone" dataKey="revenue" name="Receita" stroke={ACCENT.cyan} strokeWidth={2} fill="url(#rev2)" />
                <Line type="monotone" dataKey="revenueMA3" name="Média móvel 3m" stroke={ACCENT.violet} strokeWidth={2} strokeDasharray="5 4" dot={false} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Ticket Médio (AOV)" subtitle="média por pedido no mês" bodyClass="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="aovFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT.emerald} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={ACCENT.emerald} stopOpacity={0} />
                </linearGradient>
              </defs>
              {grid}
              <XAxis dataKey="label" {...axis} minTickGap={28} />
              <YAxis {...axis} tickFormatter={(v) => `$${v}`} width={44} domain={['dataMin - 10', 'dataMax + 10']} />
              <Tooltip content={<ChartTooltip formatter={(v) => usd(v, { decimals: 2 })} />} />
              <Area type="monotone" dataKey="aov" name="AOV" stroke={ACCENT.emerald} strokeWidth={2} fill="url(#aovFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Pedidos vs. Novos Clientes" subtitle="volume mensal" bodyClass="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              {grid}
              <XAxis dataKey="label" {...axis} minTickGap={28} />
              <YAxis {...axis} width={40} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<ChartTooltip formatter={(v) => int(v)} />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} />
              <Bar dataKey="orders" name="Pedidos" fill={ACCENT.sky} radius={[3, 3, 0, 0]} barSize={10} />
              <Line type="monotone" dataKey="newCustomers" name="Novos clientes" stroke={ACCENT.amber} strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Receita por Categoria" subtitle="14 categorias" bodyClass="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={by_category} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              {grid}
              <XAxis dataKey="category" {...axis} interval={0} angle={-35} textAnchor="end" height={70} />
              <YAxis {...axis} tickFormatter={usdCompact} width={48} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<ChartTooltip formatter={(v) => usd(v)} />} />
              <Bar dataKey="revenue" name="Receita" radius={[4, 4, 0, 0]}>
                {by_category.map((c, i) => (
                  <Cell key={i} fill={catSel && c.category !== catSel ? 'rgba(255,255,255,0.12)' : SERIES[i % SERIES.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Sazonalidade — Receita por Mês × Ano" subtitle="mais claro = mais receita">
          <RevenueHeatmap monthly={monthly} />
        </ChartCard>

        <ChartCard title={`Top 10 Produtos${catSel ? ` · ${catSel}` : ''}`} subtitle="por receita total" bodyClass="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/40 text-xs">
              <tr className="text-left">
                <th className="py-2 font-medium">Produto</th>
                <th className="py-2 font-medium text-right">Receita</th>
                <th className="py-2 font-medium text-right">Pedidos</th>
                <th className="py-2 font-medium text-right">Rating</th>
              </tr>
            </thead>
            <tbody>
              {prods.map((p) => (
                <tr key={p.name} className="border-t border-white/5">
                  <td className="py-2 pr-2">
                    <span className="text-white/90">{p.name}</span>
                    <span className="block text-[11px] text-white/40">{p.category}</span>
                  </td>
                  <td className="py-2 text-right font-medium text-white/90">{usd(p.revenue)}</td>
                  <td className="py-2 text-right text-white/60">{int(p.orders)}</td>
                  <td className="py-2 text-right text-white/60">{p.rating.toFixed(1)}★</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>
      </div>
    </div>
  )
}
