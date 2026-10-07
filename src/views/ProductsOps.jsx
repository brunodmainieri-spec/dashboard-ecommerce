import { useMemo, useState } from 'react'
import {
  ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar, ComposedChart, Line, AreaChart, Area,
  XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Cell, Legend,
} from 'recharts'
import ChartCard from '../components/ChartCard.jsx'
import ChartTooltip from '../components/ChartTooltip.jsx'
import { usd, usdCompact, int, pct } from '../lib/format.js'
import { ACCENT, SERIES } from '../lib/colors.js'

const axis = { stroke: '#52525b', fontSize: 11, tickLine: false, axisLine: false }
const grid = <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />

const COLS = [
  { key: 'name', label: 'Produto', align: 'left' },
  { key: 'category', label: 'Categoria', align: 'left' },
  { key: 'revenue', label: 'Receita', align: 'right', fmt: usd },
  { key: 'orders', label: 'Pedidos', align: 'right', fmt: int },
  { key: 'rating', label: 'Rating', align: 'right', fmt: (v) => `${v.toFixed(1)}★` },
  { key: 'returnRate', label: 'Devolução', align: 'right', fmt: (v) => pct(v) },
  { key: 'deliveryDays', label: 'Entrega', align: 'right', fmt: (v) => `${v}d` },
]

export default function ProductsOps({ data, filters }) {
  const { products, by_category, orders_behavior } = data
  const catSel = filters.category !== 'all' ? filters.category : null
  const [sort, setSort] = useState({ key: 'revenue', dir: 'desc' })

  const filtered = useMemo(
    () => (catSel ? products.filter((p) => p.category === catSel) : products),
    [products, catSel],
  )
  const sorted = useMemo(() => {
    const s = [...filtered].sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key]
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv
      return sort.dir === 'asc' ? cmp : -cmp
    })
    return s.slice(0, 15)
  }, [filtered, sort])

  const bubble = filtered.map((p) => ({ x: p.rating, y: p.returnRate, z: p.revenue, name: p.name, category: p.category }))
  const catReturns = [...by_category].sort((a, b) => b.returnRate - a.returnRate)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard className="lg:col-span-2" title="Qualidade vs. Devolução"
          subtitle="rating × taxa de devolução · tamanho da bolha = receita (canto inf. direito = problemático)" bodyClass="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              {grid}
              <XAxis type="number" dataKey="x" name="Rating" domain={[3.5, 5]} {...axis}
                label={{ value: 'Rating médio', position: 'insideBottom', offset: -2, fill: '#71717a', fontSize: 11 }} />
              <YAxis type="number" dataKey="y" name="Devolução" {...axis} tickFormatter={(v) => `${v}%`} width={40} />
              <ZAxis type="number" dataKey="z" range={[30, 400]} name="Receita" />
              <Tooltip cursor={{ strokeDasharray: '3 3', stroke: '#52525b' }}
                content={<ChartTooltip formatter={(v, n) => (n === 'Devolução' ? pct(v) : n === 'Receita' ? usd(v) : v)} />} />
              <Scatter data={bubble} fill={ACCENT.cyan} fillOpacity={0.5} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Devolução por Categoria" subtitle="maior no topo" bodyClass="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={catReturns} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
              {grid}
              <XAxis type="number" {...axis} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="category" {...axis} width={104} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<ChartTooltip formatter={(v) => pct(v)} />} />
              <Bar dataKey="returnRate" name="Devolução" radius={[0, 6, 6, 0]}>
                {catReturns.map((c, i) => <Cell key={i} fill={c.returnRate > 9 ? ACCENT.rose : ACCENT.sky} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Impacto do Desconto" subtitle="receita e taxa de devolução por faixa de desconto" bodyClass="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={orders_behavior.discountBuckets} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              {grid}
              <XAxis dataKey="bucket" {...axis} />
              <YAxis yAxisId="l" {...axis} tickFormatter={usdCompact} width={48} />
              <YAxis yAxisId="r" orientation="right" {...axis} tickFormatter={(v) => `${v}%`} width={40} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<ChartTooltip formatter={(v, n) => (n === 'Receita' ? usd(v) : pct(v))} />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} />
              <Bar yAxisId="l" dataKey="revenue" name="Receita" fill={ACCENT.cyan} radius={[4, 4, 0, 0]} />
              <Line yAxisId="r" type="monotone" dataKey="returnRate" name="Devolução" stroke={ACCENT.rose} strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribuição de Prazo de Entrega" subtitle="nº de pedidos por dias de entrega" bodyClass="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={orders_behavior.deliveryDist} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="delFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT.amber} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={ACCENT.amber} stopOpacity={0} />
                </linearGradient>
              </defs>
              {grid}
              <XAxis dataKey="days" {...axis} label={{ value: 'dias', position: 'insideBottom', offset: -2, fill: '#71717a', fontSize: 11 }} />
              <YAxis {...axis} width={44} tickFormatter={int} />
              <Tooltip content={<ChartTooltip formatter={(v) => int(v)} labelFormatter={(l) => `${l} dias`} />} />
              <Area type="monotone" dataKey="orders" name="Pedidos" stroke={ACCENT.amber} strokeWidth={2} fill="url(#delFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title={`Produtos${catSel ? ` · ${catSel}` : ''}`} subtitle="clique nos cabeçalhos para ordenar · top 15" bodyClass="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-white/40 text-xs">
            <tr>
              {COLS.map((c) => (
                <th key={c.key}
                  onClick={() => setSort((s) => ({ key: c.key, dir: s.key === c.key && s.dir === 'desc' ? 'asc' : 'desc' }))}
                  className={`py-2 font-medium cursor-pointer select-none hover:text-white/70 ${c.align === 'right' ? 'text-right' : 'text-left'}`}>
                  {c.label}{sort.key === c.key ? (sort.dir === 'desc' ? ' ↓' : ' ↑') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr key={p.name} className="border-t border-white/5">
                {COLS.map((c) => (
                  <td key={c.key} className={`py-2 ${c.align === 'right' ? 'text-right' : 'text-left'} ${c.key === 'name' ? 'text-white/90' : 'text-white/60'}`}>
                    {c.fmt ? c.fmt(p[c.key]) : p[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </ChartCard>
    </div>
  )
}
