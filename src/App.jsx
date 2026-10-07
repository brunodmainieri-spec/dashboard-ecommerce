import { useState } from 'react'
import { useData } from './hooks/useData.js'
import Sidebar from './components/Sidebar.jsx'
import FilterBar from './components/FilterBar.jsx'
import Overview from './views/Overview.jsx'
import RevenueSales from './views/RevenueSales.jsx'
import CustomersRetention from './views/CustomersRetention.jsx'
import ProductsOps from './views/ProductsOps.jsx'
import MarketingAcquisition from './views/MarketingAcquisition.jsx'

const VIEWS = {
  overview: { title: 'Overview', comp: Overview },
  revenue: { title: 'Receita & Vendas', comp: RevenueSales },
  customers: { title: 'Clientes & Retenção', comp: CustomersRetention },
  products: { title: 'Produtos & Operações', comp: ProductsOps },
  marketing: { title: 'Marketing & Aquisição', comp: MarketingAcquisition },
}

export default function App() {
  const { loading, error, data } = useData()
  const [view, setView] = useState('overview')
  const [filters, setFilters] = useState({ year: 'all', category: 'all', country: 'all' })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50">
        <div className="animate-pulse text-sm">Carregando dados…</div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center">
          <p className="text-rose-400 font-medium mb-2">Não foi possível carregar os dados</p>
          <p className="text-white/50 text-sm">{error.message}</p>
          <p className="text-white/30 text-xs mt-3">Rode <code className="text-white/60">npm run build:data</code> e recarregue.</p>
        </div>
      </div>
    )
  }

  const ViewComp = VIEWS[view].comp

  return (
    <div className="min-h-screen flex">
      <Sidebar active={view} onSelect={setView} />

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-4 bg-neutral-950/60 backdrop-blur-lg border-b border-white/5">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight font-display">{VIEWS[view].title}</h1>
            <p className="text-xs text-white/40">E-commerce Analytics · 2020–2026</p>
          </div>
          <FilterBar meta={data.meta} filters={filters} setFilters={setFilters} />
        </header>

        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <ViewComp data={data} filters={filters} onNavigate={setView} />
        </div>
      </main>
    </div>
  )
}
