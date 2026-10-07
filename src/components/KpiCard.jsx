import Card from './Card.jsx'

// Cartão de KPI. Se `accent` for passado, usa fundo saturado (destaque); senão, glass.
export default function KpiCard({ label, value, sub, accent, delta }) {
  const positive = delta != null && delta >= 0
  return (
    <Card accent={accent} className="flex flex-col justify-between min-h-[130px]">
      <p
        className="text-[11px] font-medium uppercase tracking-[0.14em]"
        style={{ color: accent ? 'rgba(255,255,255,0.85)' : '#a1a1aa' }}
      >
        {label}
      </p>
      <div className="mt-2">
        <p className="text-3xl font-semibold tracking-tight font-display">{value}</p>
        <div className="mt-2 flex items-center gap-2">
          {delta != null && (
            <span
              className="text-xs font-medium rounded-full px-2 py-0.5"
              style={{
                backgroundColor: accent ? 'rgba(255,255,255,0.18)' : positive ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
                color: accent ? '#fff' : positive ? '#34d399' : '#fb7185',
              }}
            >
              {positive ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
            </span>
          )}
          {sub && (
            <span
              className="text-xs"
              style={{ color: accent ? 'rgba(255,255,255,0.8)' : '#71717a' }}
            >
              {sub}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}
