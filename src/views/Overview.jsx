import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import KpiCard from '../components/KpiCard.jsx'
import ChartCard from '../components/ChartCard.jsx'
import ChartTooltip from '../components/ChartTooltip.jsx'
import { usd, usdCompact, int, pct } from '../lib/format.js'
import { ACCENT, TIER_COLORS, SERIES } from '../lib/colors.js'

const axis = { stroke: '#52525b', fontSize: 11, tickLine: false, axisLine: false }
const grid = <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />

export default function Overview({ data, filters, onNavigate }) {
  const { kpis, monthly, by_category, by_geo, segments } = data
  const yearSel = filters.year !== 'all' ? Number(filters.year) : null

  const k = yearSel ? kpis.byYear[yearSel] : kpis.all
  const mSeries = yearSel ? monthly.filter((m) => m.year === yearSel) : monthly
  const topCats = by_category.slice(0, 6)
  const topGeo = by_geo.slice(0, 7)
  const tierData = segments.byTier.map((t) => ({ name: t.tier, value: t.revenue, color: TIER_COLORS[t.tier] }))

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard accent={ACCENT.cyan} label="Receita de Pedidos" value={usdCompact(k.revenue)}
          delta={yearSel ? null : kpis.all.revenueYoY} sub={yearSel ? `ano ${yearSel}` : 'YoY'} />
        <KpiCard accent={ACCENT.emerald} label="Ticket Médio (AOV)" value={usd(k.aov)} sub="por pedido" />
        <KpiCard accent={ACCENT.sky} label="Pedidos" value={int(k.orders)} sub={`${int(k.uniqueCustomers)} clientes`} />
        <KpiCard label="Churn" value={pct(kpis.all.churnRate)} sub={`${int(kpis.all.totalCustomers - kpis.all.activeCustomers)} clientes`} />
        <KpiCard label="Taxa de Devolução" value={pct(k.returnRate)} sub="dos pedidos" />
      </div>

      {/* Linha principal: receita + tier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard className="lg:col-span-2" title="Receita Mensal" subtitle="linha: receita · tracejado: média móvel 3m" bodyClass="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT.cyan} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={ACCENT.cyan} stopOpacity={0} />
                </linearGradient>
              </defs>
              {grid}
              <XAxis dataKey="label" {...axis} minTickGap={28} />
              <YAxis {...axis} tickFormatter={usdCompact} width={48} />
              <Tooltip content={<ChartTooltip formatter={(v) => usd(v)} />} />
              <Area type="monotone" dataKey="revenue" name="Receita" stroke={ACCENT.cyan} strokeWidth={2} fill="url(#revFill)" />
              <Line type="monotone" dataKey="revenueMA3" name="Média móvel 3m" stroke={ACCENT.violet} strokeWidth={2} strokeDasharray="5 4" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Gasto (LTV) por Tier" subtitle="soma do total_spend dos clientes" bodyClass="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={tierData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2} stroke="none">
                {tierData.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip formatter={(v) => usd(v)} />} />
              <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Linha inferior: categorias + países */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Top Categorias por Receita" subtitle="clique para explorar em Produtos" bodyClass="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topCats} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}
              onClick={() => onNavigate?.('revenue')}>
              {grid}
              <XAxis type="number" {...axis} tickFormatter={usdCompact} />
              <YAxis type="category" dataKey="category" {...axis} width={110} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<ChartTooltip formatter={(v) => usd(v)} />} />
              <Bar dataKey="revenue" name="Receita" radius={[0, 6, 6, 0]}>
                {topCats.map((_, i) => <Cell key={i} fill={SERIES[i % SERIES.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Receita por País (Top 7)" subtitle="gasto total dos clientes por país" bodyClass="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topGeo} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
              {grid}
              <XAxis type="number" {...axis} tickFormatter={usdCompact} />
              <YAxis type="category" dataKey="country" {...axis} width={110} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<ChartTooltip formatter={(v) => usd(v)} />} />
              <Bar dataKey="revenue" name="Receita" radius={[0, 6, 6, 0]} fill={ACCENT.cyan} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
