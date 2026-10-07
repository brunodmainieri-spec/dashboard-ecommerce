import Card from './Card.jsx'

// Card padrão para gráficos: título, subtítulo opcional e área de conteúdo.
export default function ChartCard({ title, subtitle, right, className = '', bodyClass = '', children }) {
  return (
    <Card className={`flex flex-col ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-[15px] font-semibold text-white/90">{title}</h3>
          {subtitle && <p className="text-xs text-white/45 mt-0.5">{subtitle}</p>}
        </div>
        {right}
      </div>
      <div className={`flex-1 ${bodyClass}`}>{children}</div>
    </Card>
  )
}
