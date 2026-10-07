// Formatação consistente de moeda, números e percentuais (pt-BR, valores em USD).

export const usd = (n, opts = {}) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: opts.decimals ?? 0,
    minimumFractionDigits: opts.decimals ?? 0,
  }).format(n ?? 0)

// Abrevia valores grandes: 3136404 -> $3.1M
export const usdCompact = (n) => {
  const v = n ?? 0
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
  return `$${v.toFixed(0)}`
}

export const int = (n) => new Intl.NumberFormat('pt-BR').format(Math.round(n ?? 0))

export const pct = (n, decimals = 1) => `${(n ?? 0).toFixed(decimals)}%`

export const compact = (n) => {
  const v = n ?? 0
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(1)}K`
  return String(v)
}
