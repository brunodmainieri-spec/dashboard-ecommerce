const NAV = [
  { id: 'overview', label: 'Overview', icon: 'M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm8 0h6V11h-6v9Zm0-16v5h6V4h-6Z' },
  { id: 'revenue', label: 'Receita & Vendas', icon: 'M4 19h16M4 19V5m4 14V9m4 10V6m4 13v-8' },
  { id: 'customers', label: 'Clientes & Retenção', icon: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-1a6 6 0 0 1 12 0v1' },
  { id: 'products', label: 'Produtos & Ops', icon: 'M20 7 12 3 4 7m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { id: 'marketing', label: 'Marketing', icon: 'M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1Zm14-2a5 5 0 0 1 0 6' },
]

export default function Sidebar({ active, onSelect }) {
  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col gap-1 p-4 sticky top-0 h-screen">
      <div className="flex items-center gap-3 px-2 py-3 mb-4">
        <div className="h-9 w-9 rounded-2xl bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-900/40">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm8 0h6V11h-6v9Zm0-16v5h6V4h-6Z" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">Insights</p>
          <p className="text-[11px] text-white/40 leading-tight">E-commerce</p>
        </div>
      </div>

      {NAV.map((item) => {
        const on = active === item.id
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${
              on
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-900/30'
                : 'text-white/55 hover:bg-white/5 hover:text-white/90'
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d={item.icon} />
            </svg>
            {item.label}
          </button>
        )
      })}

      <div className="mt-auto px-3 py-3 text-[11px] text-white/30">
        Dados: 2020–2026 · 25k pedidos
      </div>
    </aside>
  )
}
