# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

This is a **React + Vite dashboard** that visualizes the e-commerce data in `dataset/`, styled after `design-system/`.

Stack: React 18 + Vite 5 + Recharts + Tailwind CSS 3. Data is **pre-processed to JSON at build time** by `scripts/build-data.mjs` (reads the CSVs with PapaParse, emits aggregated JSONs to `public/data/`), so the browser never parses the raw 25k-row CSVs.

### Commands
- `npm install` — install dependencies (Node.js required; installed here via winget `OpenJS.NodeJS.LTS`).
- `npm run build:data` — regenerate `public/data/*.json` from the CSVs.
- `npm run dev` — start the Vite dev server (runs `build:data` first via `predev`) at http://localhost:5173.
- `npm run build` — production build to `dist/` (runs `build:data` first via `prebuild`).
- `npm run preview` — serve the production build locally.

There is no test runner or linter configured yet.

### Source layout
- `scripts/build-data.mjs` — CSV → JSON aggregation (KPIs, monthly, categories, products, geo, segments, cohorts, RFM, order behavior).
- `src/hooks/useData.js` — loads all JSONs once. `src/lib/` — `format.js` (USD/%/int) and `colors.js` (palette/tier/RFM colors).
- `src/components/` — `Card.jsx` (glass shell replicating the design-system border-gradient trick), `KpiCard`, `ChartCard`, `Sidebar`, `FilterBar`, `ChartTooltip`.
- `src/views/` — one file per section: `Overview`, `RevenueSales`, `CustomersRetention`, `ProductsOps`, `MarketingAcquisition`. Global filters (year/category/country) live in `App.jsx`.

Note: `orders.total_amount_usd` is order-level revenue (~$3.1M total); `customers.total_spend_usd` is a separate customer-lifetime (LTV) field (~$12.4M) — the UI labels them distinctly ("Receita de Pedidos" vs "Gasto/LTV").

## `dataset/` — e-commerce data

Four CSVs describing an online store, joined through `customer_id`:

- `customers.csv` (~8k rows) — one row per customer: demographics (`country`, `age`, `gender`), lifecycle (`registration_date`, `membership_tier`, `churned`), behavior (`total_orders`, `total_spend_usd`, `avg_order_value_usd`, `days_since_last_purchase`, `preferred_category/device/payment_method`, `acquisition_channel`), and engagement (`reviews_given`, `avg_review_score`, `returns_made`, `wishlist_items`, `newsletter_subscribed`).
- `orders.csv` (~25k rows) — one row per line item: `order_id`, `customer_id`, date/time breakdown (`order_date`, `year`, `month`, `quarter`, `day_of_week`), product info (`product_name`, `category`, `unit_price_usd`, `quantity`), pricing (`subtotal_usd`, `discount_pct`, `discount_amount_usd`, `shipping_fee_usd`, `tax_pct`/`tax_amount_usd`, `total_amount_usd`), fulfillment (`payment_method`, `device_used`, `delivery_days`, `delivery_date`, `order_status`, `returned`, `customer_rating`), and session behavior (`session_duration_minutes`, `pages_viewed_before_purchase`, `is_repeat_customer`).
- `monthly_revenue.csv` — pre-aggregated monthly rollup (`year`, `month`, `quarter`, `orders`, `revenue_usd`, `avg_order_value`, `avg_discount_pct`, `return_rate`, `unique_customers`, `new_customers`), useful directly for time-series charts without recomputing from `orders.csv`.
- `product_summary.csv` — pre-aggregated per-product rollup (`category`, `product_name`, `total_orders`, `total_revenue_usd`, `avg_price`, `avg_rating`, `return_rate`, `avg_discount_pct`, `avg_delivery_days`).

Prefer the pre-aggregated `monthly_revenue.csv`/`product_summary.csv` for summary charts, and fall back to `orders.csv`/`customers.csv` for anything requiring per-order or per-customer granularity or custom cuts.

## `design-system/` — visual style reference

`design-system/index.html` is a self-contained static export (not example app code) meant purely as a **style reference** for how the eventual dashboard should look. Its actual content — a smart-garden/irrigation control panel ("Aurora Garden Control") — is unrelated to the e-commerce dataset and should not be treated as the target UI; only the visual language should be reused:

- **Layout**: a responsive CSS grid of rounded "widget" cards (`grid-cols-1 md:grid-cols-8 lg:grid-cols-12`), each card spanning different column counts, mimicking a bento-grid dashboard.
- **Styling**: Tailwind utility classes only (no compiled Tailwind config in this repo — classes are applied directly in markup). Dark theme (`bg-neutral-950`, `text-white`), cards use `rounded-3xl`, `backdrop-blur-lg`, and a `from-white/10 to-white/0` gradient for the "glass" look, plus a hairline border achieved via a `--border-gradient` CSS variable and a shared `::before` mask trick (defined inline in `<head>`).
- **Accent cards**: some cards use solid saturated backgrounds (`bg-cyan-500`, `bg-emerald-600`, `bg-yellow-400`, `bg-sky-600`) to highlight key widgets against the otherwise neutral grid.
- **Icons**: Iconify `solar` icon set (duotone style, inlined as raw `<svg>` or via `data-icon="solar:*"` + `iconify_*.js` runtime) and `lucide_latest_*.js` for a few icons, initialized via `lucide.createIcons()` on `DOMContentLoaded`.
- **Fonts**: many Google Fonts are pre-linked as self-hosted subset stylesheets (`assets/css2_*.css`, one per font family — Geist, Roboto, Montserrat, Poppins, Playfair Display, Instrument Serif, Merriweather, Bricolage Grotesque, Plus Jakarta Sans, Manrope, Space Grotesk, Work Sans, PT Serif, Geist Mono, Space Mono, Quicksand, Nunito), applied via `.font-*` utility classes. Only a subset will likely be needed for the real app.
- **Background**: an animated gradient background is injected via Unicorn Studio (`unicornStudio.umd.js` loaded from a CDN, keyed to a `data-us-project` id) — a decorative flourish, not required for the dashboard functionality.
- `design-system/assets/` contains the hashed/renamed font, icon, script, and image files referenced above; filenames are content-hashed and not meaningful individually.

When building the actual dashboard, treat `index.html` as a component/style catalog to extract patterns from (card shells, spacing, color roles, border-gradient technique), not as boilerplate to build on top of directly.
