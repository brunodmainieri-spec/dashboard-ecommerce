// Barra de filtros globais. Um <select> "glass" por dimensão.
function Select({ label, value, onChange, options }) {
  return (
    <label className="flex items-center gap-2 text-xs text-white/50">
      <span className="hidden sm:inline">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="glass-border rounded-full bg-white/[0.06] px-3 py-1.5 text-sm text-white/90 outline-none focus:bg-white/10 [&>option]:bg-neutral-900"
        style={{ '--border-radius-before': '9999px' }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function FilterBar({ meta, filters, setFilters }) {
  const opt = (arr, allLabel) => [{ value: 'all', label: allLabel }, ...arr.map((v) => ({ value: String(v), label: String(v) }))]
  const set = (k) => (v) => setFilters((f) => ({ ...f, [k]: v }))

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <Select label="Ano" value={filters.year} onChange={set('year')} options={opt(meta.years, 'Todos os anos')} />
      <Select label="Categoria" value={filters.category} onChange={set('category')} options={opt(meta.categories, 'Todas categorias')} />
      <Select label="País" value={filters.country} onChange={set('country')} options={opt(meta.countries, 'Todos os países')} />
      {(filters.year !== 'all' || filters.category !== 'all' || filters.country !== 'all') && (
        <button
          onClick={() => setFilters({ year: 'all', category: 'all', country: 'all' })}
          className="rounded-full px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 transition"
        >
          Limpar
        </button>
      )}
    </div>
  )
}
