// Paleta consistente para gráficos, alinhada ao design-system (acentos cyan/emerald/sky/violet).

export const ACCENT = {
  cyan: '#06b6d4',
  emerald: '#10b981',
  sky: '#0ea5e9',
  violet: '#8b5cf6',
  amber: '#f59e0b',
  rose: '#f43f5e',
  lime: '#84cc16',
  pink: '#ec4899',
}

// Sequência para séries genéricas (barras/linhas de categorias)
export const SERIES = [
  '#06b6d4',
  '#8b5cf6',
  '#10b981',
  '#0ea5e9',
  '#f59e0b',
  '#ec4899',
  '#84cc16',
  '#f43f5e',
  '#14b8a6',
  '#a78bfa',
  '#22d3ee',
  '#fb923c',
  '#4ade80',
  '#60a5fa',
]

// Cores fixas por tier de membership
export const TIER_COLORS = {
  Platinum: '#06b6d4',
  Gold: '#f59e0b',
  Silver: '#94a3b8',
  Free: '#8b5cf6',
}

// Cores por segmento RFM
export const RFM_COLORS = {
  'Campeões': '#10b981',
  'Leais': '#06b6d4',
  'Potenciais': '#0ea5e9',
  'Novos / Promissores': '#84cc16',
  'Em risco': '#f59e0b',
  'Adormecidos': '#a78bfa',
  'Perdidos': '#f43f5e',
}

export const colorFor = (i) => SERIES[i % SERIES.length]
