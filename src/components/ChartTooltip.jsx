// Tooltip escuro consistente para todos os gráficos Recharts.
export default function ChartTooltip({ active, payload, label, formatter, labelFormatter }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="rounded-xl border border-white/10 bg-neutral-900/95 px-3 py-2 shadow-xl backdrop-blur">
      {label != null && (
        <p className="text-xs font-medium text-white/70 mb-1">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-white/60">{p.name}:</span>
          <span className="font-medium text-white">
            {formatter ? formatter(p.value, p.name, p) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}
