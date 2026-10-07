// Pré-processa os CSVs de dataset/ em JSONs agregados prontos para os gráficos.
// Roda automaticamente antes de `npm run dev` e `npm run build` (ver package.json).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Papa from 'papaparse'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DATASET = path.join(ROOT, 'dataset')
const OUT = path.join(ROOT, 'public', 'data')

// ---------- helpers ----------
const readCsv = (file) =>
  Papa.parse(fs.readFileSync(path.join(DATASET, file), 'utf8'), {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  }).data

const num = (v) => {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : 0
}
const round = (n, d = 2) => {
  const f = 10 ** d
  return Math.round(n * f) / f
}
const sum = (arr, f) => arr.reduce((a, x) => a + f(x), 0)
const mean = (arr, f) => (arr.length ? sum(arr, f) / arr.length : 0)
const distinct = (arr, f) => [...new Set(arr.map(f))].filter((x) => x !== '' && x != null)

function groupBy(arr, keyFn) {
  const m = new Map()
  for (const x of arr) {
    const k = keyFn(x)
    if (!m.has(k)) m.set(k, [])
    m.get(k).push(x)
  }
  return m
}

const writeJson = (name, data) => {
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(data))
  const kb = (fs.statSync(path.join(OUT, name)).size / 1024).toFixed(0)
  console.log(`  ✓ ${name} (${kb} KB)`)
}

// ---------- load ----------
console.log('Lendo CSVs...')
const customers = readCsv('customers.csv')
const orders = readCsv('orders.csv')
const monthlyRaw = readCsv('monthly_revenue.csv')
const productsRaw = readCsv('product_summary.csv')
console.log(
  `  customers=${customers.length} orders=${orders.length} monthly=${monthlyRaw.length} products=${productsRaw.length}`,
)

fs.mkdirSync(OUT, { recursive: true })

// ---------- meta (valores de filtro) ----------
const meta = {
  generatedAt: new Date().toISOString(),
  countries: distinct(customers, (c) => c.country).sort(),
  categories: distinct(orders, (o) => o.category).sort(),
  tiers: ['Free', 'Silver', 'Gold', 'Platinum'],
  channels: distinct(customers, (c) => c.acquisition_channel).sort(),
  devices: distinct(orders, (o) => o.device_used).sort(),
  payments: distinct(orders, (o) => o.payment_method).sort(),
  years: distinct(orders, (o) => o.year).map(Number).sort((a, b) => a - b),
}
writeJson('meta.json', meta)

// ---------- monthly (passthrough + derivados) ----------
const monthly = monthlyRaw
  .map((r) => ({
    year: num(r.year),
    month: num(r.month),
    quarter: r.quarter,
    label: `${r.year}-${String(r.month).padStart(2, '0')}`,
    orders: num(r.orders),
    revenue: round(num(r.revenue_usd)),
    aov: round(num(r.avg_order_value)),
    discount: round(num(r.avg_discount_pct)),
    returnRate: round(num(r.return_rate)),
    uniqueCustomers: num(r.unique_customers),
    newCustomers: num(r.new_customers),
  }))
  .sort((a, b) => a.year - b.year || a.month - b.month)

// média móvel 3m + crescimento YoY
monthly.forEach((m, i) => {
  const win = monthly.slice(Math.max(0, i - 2), i + 1)
  m.revenueMA3 = round(mean(win, (x) => x.revenue))
  const prevYear = monthly.find((x) => x.year === m.year - 1 && x.month === m.month)
  m.revenueYoY = prevYear ? round(((m.revenue - prevYear.revenue) / prevYear.revenue) * 100, 1) : null
})
writeJson('monthly.json', monthly)

// ---------- KPIs (globais + por ano, a partir de orders) ----------
function kpiSlice(rows) {
  const revenue = sum(rows, (o) => num(o.total_amount_usd))
  const n = rows.length
  const returned = rows.filter((o) => o.returned === '1').length
  return {
    revenue: round(revenue),
    orders: n,
    aov: round(n ? revenue / n : 0),
    uniqueCustomers: distinct(rows, (o) => o.customer_id).length,
    returnRate: round(n ? (returned / n) * 100 : 0, 1),
  }
}
const churned = customers.filter((c) => c.churned === '1').length
const churnRate = round((churned / customers.length) * 100, 1)
const ordersByYear = groupBy(orders, (o) => o.year)
const byYear = {}
for (const [y, rows] of ordersByYear) byYear[y] = kpiSlice(rows)

// YoY receita: últimos 12 meses vs 12 anteriores (do rollup mensal)
const last24 = monthly.slice(-24)
const prev12 = last24.slice(0, 12)
const last12 = last24.slice(-12)
const revLast12 = sum(last12, (m) => m.revenue)
const revPrev12 = sum(prev12, (m) => m.revenue)

const kpis = {
  all: {
    ...kpiSlice(orders),
    totalCustomers: customers.length,
    activeCustomers: customers.length - churned,
    churnRate,
    newCustomers12m: sum(last12, (m) => m.newCustomers),
    revenueYoY: revPrev12 ? round(((revLast12 - revPrev12) / revPrev12) * 100, 1) : null,
  },
  byYear,
}
writeJson('kpis.json', kpis)

// ---------- rating por categoria (via product_summary, ponderado) ----------
const prodByCat = groupBy(productsRaw, (p) => p.category)
const catRating = {}
for (const [cat, ps] of prodByCat) {
  const w = sum(ps, (p) => num(p.total_orders))
  catRating[cat] = w ? round(sum(ps, (p) => num(p.avg_rating) * num(p.total_orders)) / w) : 0
}

// ---------- by_category (de orders) ----------
const byCategory = [...groupBy(orders, (o) => o.category)]
  .map(([category, rows]) => {
    const revenue = sum(rows, (o) => num(o.total_amount_usd))
    const returned = rows.filter((o) => o.returned === '1').length
    return {
      category,
      revenue: round(revenue),
      orders: rows.length,
      aov: round(revenue / rows.length),
      returnRate: round((returned / rows.length) * 100, 1),
      avgDiscount: round(mean(rows, (o) => num(o.discount_pct)), 1),
      avgRating: catRating[category] ?? 0,
      units: sum(rows, (o) => num(o.quantity)),
    }
  })
  .sort((a, b) => b.revenue - a.revenue)
writeJson('by_category.json', byCategory)

// ---------- products (passthrough) ----------
const products = productsRaw
  .map((p) => ({
    category: p.category,
    name: p.product_name,
    orders: num(p.total_orders),
    revenue: round(num(p.total_revenue_usd)),
    avgPrice: round(num(p.avg_price)),
    rating: round(num(p.avg_rating), 2),
    returnRate: round(num(p.return_rate), 1),
    avgDiscount: round(num(p.avg_discount_pct), 1),
    deliveryDays: round(num(p.avg_delivery_days), 1),
  }))
  .sort((a, b) => b.revenue - a.revenue)
writeJson('products.json', products)

// ---------- by_geo (de customers) ----------
const byGeo = [...groupBy(customers, (c) => c.country)]
  .map(([country, rows]) => {
    const ch = rows.filter((c) => c.churned === '1').length
    return {
      country,
      customers: rows.length,
      revenue: round(sum(rows, (c) => num(c.total_spend_usd))),
      aov: round(mean(rows, (c) => num(c.avg_order_value_usd))),
      avgOrders: round(mean(rows, (c) => num(c.total_orders)), 1),
      churnRate: round((ch / rows.length) * 100, 1),
    }
  })
  .sort((a, b) => b.revenue - a.revenue)
writeJson('by_geo.json', byGeo)

// ---------- segments ----------
function custAgg(rows) {
  const ch = rows.filter((c) => c.churned === '1').length
  return {
    customers: rows.length,
    revenue: round(sum(rows, (c) => num(c.total_spend_usd))),
    avgSpend: round(mean(rows, (c) => num(c.total_spend_usd))),
    avgOrders: round(mean(rows, (c) => num(c.total_orders)), 1),
    churnRate: round((ch / rows.length) * 100, 1),
  }
}
const ageBucket = (a) => {
  const n = num(a)
  if (n < 25) return '18-24'
  if (n < 35) return '25-34'
  if (n < 45) return '35-44'
  if (n < 55) return '45-54'
  if (n < 65) return '55-64'
  return '65+'
}
const tierOrder = { Free: 0, Silver: 1, Gold: 2, Platinum: 3 }
const segments = {
  byTier: [...groupBy(customers, (c) => c.membership_tier)]
    .map(([tier, rows]) => ({ tier, ...custAgg(rows) }))
    .sort((a, b) => (tierOrder[a.tier] ?? 9) - (tierOrder[b.tier] ?? 9)),
  byChannel: [...groupBy(customers, (c) => c.acquisition_channel)]
    .map(([channel, rows]) => ({ channel, ...custAgg(rows) }))
    .sort((a, b) => b.revenue - a.revenue),
  byGender: [...groupBy(customers, (c) => c.gender)].map(([gender, rows]) => ({
    gender,
    ...custAgg(rows),
  })),
  byAge: [...groupBy(customers, (c) => ageBucket(c.age))]
    .map(([bucket, rows]) => ({ bucket, ...custAgg(rows) }))
    .sort((a, b) => a.bucket.localeCompare(b.bucket)),
  byNewsletter: [...groupBy(customers, (c) => c.newsletter_subscribed)]
    .map(([sub, rows]) => ({ subscribed: sub === '1', ...custAgg(rows) }))
    .sort((a, b) => Number(a.subscribed) - Number(b.subscribed)),
  byDevice: [...groupBy(orders, (o) => o.device_used)].map(([device, rows]) => {
    const revenue = sum(rows, (o) => num(o.total_amount_usd))
    return {
      device,
      orders: rows.length,
      revenue: round(revenue),
      aov: round(revenue / rows.length),
      avgSession: round(mean(rows, (o) => num(o.session_duration_minutes)), 1),
      avgPages: round(mean(rows, (o) => num(o.pages_viewed_before_purchase)), 1),
    }
  }),
  byPayment: [...groupBy(orders, (o) => o.payment_method)]
    .map(([method, rows]) => ({
      method,
      orders: rows.length,
      revenue: round(sum(rows, (o) => num(o.total_amount_usd))),
    }))
    .sort((a, b) => b.revenue - a.revenue),
}
writeJson('segments.json', segments)

// ---------- cohorts (retenção por mês da 1ª compra, de orders) ----------
const ym = (dateStr) => {
  const [y, m] = dateStr.split('-')
  return num(y) * 12 + num(m) - 1
}
const firstOrder = new Map() // customer_id -> ym index
for (const o of orders) {
  const t = ym(o.order_date)
  const cur = firstOrder.get(o.customer_id)
  if (cur == null || t < cur) firstOrder.set(o.customer_id, t)
}
const cohortMap = new Map() // cohortYm -> { size:Set, offsets: Map(offset->Set) }
for (const o of orders) {
  const c0 = firstOrder.get(o.customer_id)
  const offset = ym(o.order_date) - c0
  if (offset < 0 || offset > 11) continue
  if (!cohortMap.has(c0)) cohortMap.set(c0, { members: new Set(), offsets: new Map() })
  const co = cohortMap.get(c0)
  co.members.add(o.customer_id)
  if (!co.offsets.has(offset)) co.offsets.set(offset, new Set())
  co.offsets.get(offset).add(o.customer_id)
}
const cohorts = [...cohortMap.entries()]
  .map(([c0, co]) => {
    const size = co.members.size
    const retention = Array.from({ length: 12 }, (_, off) =>
      round(((co.offsets.get(off)?.size || 0) / size) * 100, 0),
    )
    return { cohort: `${Math.floor(c0 / 12)}-${String((c0 % 12) + 1).padStart(2, '0')}`, size, retention }
  })
  .filter((c) => c.size >= 20)
  .sort((a, b) => a.cohort.localeCompare(b.cohort))
writeJson('cohorts.json', cohorts)

// ---------- RFM (de customers) ----------
const quintiles = (values) => {
  const s = [...values].sort((a, b) => a - b)
  return [0.2, 0.4, 0.6, 0.8].map((q) => s[Math.floor(q * (s.length - 1))])
}
const rQ = quintiles(customers.map((c) => num(c.days_since_last_purchase)))
const fQ = quintiles(customers.map((c) => num(c.total_orders)))
const mQ = quintiles(customers.map((c) => num(c.total_spend_usd)))
const scoreAsc = (v, q) => (v <= q[0] ? 1 : v <= q[1] ? 2 : v <= q[2] ? 3 : v <= q[3] ? 4 : 5)
const scoreDesc = (v, q) => 6 - scoreAsc(v, q) // recency: menor = melhor

function rfmSegment(r, f, m) {
  const fm = (f + m) / 2
  if (r >= 4 && fm >= 4) return 'Campeões'
  if (r >= 3 && fm >= 3) return 'Leais'
  if (r >= 4 && fm < 3) return 'Novos / Promissores'
  if (r >= 3 && fm < 3) return 'Potenciais'
  if (r <= 2 && fm >= 3) return 'Em risco'
  if (r <= 2 && fm >= 2) return 'Adormecidos'
  return 'Perdidos'
}
const rfmPoints = customers.map((c) => {
  const recDays = num(c.days_since_last_purchase)
  const freq = num(c.total_orders)
  const mon = num(c.total_spend_usd)
  const r = scoreDesc(recDays, rQ)
  const f = scoreAsc(freq, fQ)
  const m = scoreAsc(mon, mQ)
  return { r: freq, m: round(mon), rec: recDays, seg: rfmSegment(r, f, m) }
})
const rfmSummary = [...groupBy(rfmPoints, (p) => p.seg)]
  .map(([seg, rows]) => ({
    segment: seg,
    customers: rows.length,
    share: round((rows.length / rfmPoints.length) * 100, 1),
    avgMonetary: round(mean(rows, (p) => p.m)),
    avgFrequency: round(mean(rows, (p) => p.r), 1),
    avgRecency: round(mean(rows, (p) => p.rec), 0),
  }))
  .sort((a, b) => b.customers - a.customers)
// downsample scatter para no máx ~3000 pontos
const step = Math.max(1, Math.ceil(rfmPoints.length / 3000))
const rfmScatter = rfmPoints.filter((_, i) => i % step === 0).map((p) => ({
  x: p.r,
  y: p.m,
  rec: p.rec,
  seg: p.seg,
}))
writeJson('rfm.json', { summary: rfmSummary, scatter: rfmScatter })

// ---------- orders_behavior ----------
const deliveryDist = [...groupBy(orders.filter((o) => o.delivery_days !== ''), (o) => num(o.delivery_days))]
  .map(([days, rows]) => ({ days, orders: rows.length }))
  .sort((a, b) => a.days - b.days)

const discountBucket = (p) => {
  const n = num(p)
  if (n === 0) return '0%'
  if (n <= 10) return '1-10%'
  if (n <= 20) return '11-20%'
  if (n <= 30) return '21-30%'
  return '31%+'
}
const discountBuckets = [...groupBy(orders, (o) => discountBucket(o.discount_pct))]
  .map(([bucket, rows]) => {
    const returned = rows.filter((o) => o.returned === '1').length
    return {
      bucket,
      orders: rows.length,
      revenue: round(sum(rows, (o) => num(o.total_amount_usd))),
      aov: round(mean(rows, (o) => num(o.total_amount_usd))),
      returnRate: round((returned / rows.length) * 100, 1),
    }
  })
  .sort((a, b) => a.bucket.localeCompare(b.bucket))

const dowOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const byDayOfWeek = [...groupBy(orders, (o) => o.day_of_week)]
  .map(([day, rows]) => ({
    day,
    orders: rows.length,
    revenue: round(sum(rows, (o) => num(o.total_amount_usd))),
  }))
  .sort((a, b) => dowOrder.indexOf(a.day) - dowOrder.indexOf(b.day))

const statusBreakdown = [...groupBy(orders, (o) => o.order_status)]
  .map(([status, rows]) => ({ status, orders: rows.length }))
  .sort((a, b) => b.orders - a.orders)

const sStep = Math.max(1, Math.ceil(orders.length / 2000))
const sessionScatter = orders
  .filter((_, i) => i % sStep === 0)
  .map((o) => ({
    x: round(num(o.session_duration_minutes), 1),
    y: num(o.pages_viewed_before_purchase),
    returned: o.returned === '1',
  }))

writeJson('orders_behavior.json', {
  deliveryDist,
  discountBuckets,
  byDayOfWeek,
  statusBreakdown,
  sessionScatter,
})

console.log('Pronto. JSONs em public/data/')
