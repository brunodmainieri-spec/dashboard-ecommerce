import {
  ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, Cell,
} from 'recharts'
import ChartCard from '../components/ChartCard.jsx'
import Card from '../components/Card.jsx'
import ChartTooltip from '../components/ChartTooltip.jsx'
import { usd, usdCompact, int, pct } from '../lib/format.js'
import { ACCENT, SERIES } from '../lib/colors.js'

const axis = { stroke: '#52525b', fontSize: 11, tickLine: false, axisLine: false }
const grid = <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />

export default function MarketingAcquisition({ data }) {
  const { segments } = data
  const { byChannel, byDevice, byPayment, byNewsletter } = segments

  const noNews = byNewsletter.find((n) => !n.subscribed) || {}
  const yesNews = byNewsletter.find((n) => n.subscribed) || {}

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Aquisição por Canal" subtitle="clientes e gasto total (LTV) por canal" bodyClass="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byChannel} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              {grid}
              <XAxis dataKey="channel" {...axis} interval={0} angle={-20} textAnchor="end" height={54} />
              <YAxis yAxisId="l" {...axis} tickFormatter={usdCompact} width={48} />
              <YAxis yAxisId="r" orientation="right" {...axis} width={44} tickFormatter={int} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<ChartTooltip formatter={(v, n) => (n === 'Gasto total' ? usd(v) : int(v))} />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} />
              <Bar yAxisId="l" dataKey="revenue" name="Gasto total" fill={ACCENT.cyan} radius={[4, 4, 0, 0]} />
              <Bar yAxisId="r" dataKey="customers" name="Clientes" fill={ACCENT.violet} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Gasto Médio (LTV) por Canal" subtitle="qualidade do canal, não só volume" bodyClass="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[...byChannel].sort((a, b) => b.avgSpend - a.avgSpend)} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" {...axis} tickFormatter={usdCompact} />
              <YAxis type="category" dataKey="channel" {...axis} width={104} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<ChartTooltip formatter={(v) => usd(v)} />} />
              <Bar dataKey="avgSpend" name="Gasto médio" radius={[0, 6, 6, 0]}>
                {byChannel.map((_, i) => <Cell key={i} fill={SERIES[i % SERIES.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Comportamento por Dispositivo" subtitle="pedidos, AOV e engajamento" bodyClass="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byDevice} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              {grid}
              <XAxis dataKey="device" {...axis} />
              <YAxis yAxisId="l" {...axis} width={40} tickFormatter={int} />
              <YAxis yAxisId="r" orientation="right" {...axis} width={40} tickFormatter={(v) => `$${v}`} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<ChartTooltip formatter={(v, n) => (n === 'AOV' ? usd(v) : int(v))} />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} />
              <Bar yAxisId="l" dataKey="orders" name="Pedidos" fill={ACCENT.sky} radius={[4, 4, 0, 0]} />
              <Bar yAxisId="r" dataKey="aov" name="AOV" fill={ACCENT.emerald} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Mix de Pagamento" subtitle="pedidos por método" bodyClass="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byPayment} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" {...axis} tickFormatter={int} />
              <YAxis type="category" dataKey="method" {...axis} width={120} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<ChartTooltip formatter={(v) => int(v)} />} />
              <Bar dataKey="orders" name="Pedidos" radius={[0, 6, 6, 0]}>
                {byPayment.map((_, i) => <Cell key={i} fill={SERIES[i % SERIES.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Efeito da Newsletter" subtitle="assinantes vs. não assinantes">
          <div className="grid grid-cols-2 gap-3 h-full items-stretch">
            {[{ t: 'Assinantes', d: yesNews, c: ACCENT.emerald }, { t: 'Não assinantes', d: noNews, c: ACCENT.violet }].map((b) => (
              <div key={b.t} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 flex flex-col justify-between">
                <p className="text-xs text-white/50">{b.t}</p>
                <div>
                  <p className="text-2xl font-semibold font-display" style={{ color: b.c }}>{usd(b.d.avgSpend)}</p>
                  <p className="text-[11px] text-white/40">gasto médio</p>
                </div>
                <div className="mt-2 pt-2 border-t border-white/5 text-[11px] text-white/50 space-y-0.5">
                  <p>{int(b.d.customers)} clientes</p>
                  <p>churn {pct(b.d.churnRate)}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Comportamento de Sessão" subtitle="duração da sessão × páginas vistas antes da compra · vermelho = pedido devolvido" bodyClass="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" dataKey="x" name="Sessão (min)" {...axis}
              label={{ value: 'Duração da sessão (min)', position: 'insideBottom', offset: -2, fill: '#71717a', fontSize: 11 }} />
            <YAxis type="number" dataKey="y" name="Páginas vistas" {...axis} width={40} />
            <ZAxis type="number" range={[18, 18]} />
            <Tooltip cursor={{ strokeDasharray: '3 3', stroke: '#52525b' }} content={<ChartTooltip formatter={(v) => v} />} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#a1a1aa' }} />
            <Scatter name="Concluído" data={data.orders_behavior.sessionScatter.filter((p) => !p.returned)} fill={ACCENT.cyan} fillOpacity={0.4} />
            <Scatter name="Devolvido" data={data.orders_behavior.sessionScatter.filter((p) => p.returned)} fill={ACCENT.rose} fillOpacity={0.6} />
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
