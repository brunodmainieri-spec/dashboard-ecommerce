# Variant 1 — "The Commerce Annual"

**Concept.** Not a dashboard — the cover spread and lead exhibits of a printed *annual report*, No. 07 in a running series. The e-commerce numbers are treated as an editor's fiscal review: a masthead, a headline figure, a ledger strip, and six numbered "Figures" laid on an asymmetric editorial grid. Every widget reads as an exhibit in a magazine, not a card in a bento box. This is a deliberate departure from the existing dark glass/bento/Tailwind language.

**Palette (duotone luxe, not the cream-and-terracotta default).**
- `#1c0c1a` deep plum ink — ground
- `#2a1327` / `#371a32` — raised panel + hairline tints
- `#f4ecde` warm bone — primary type
- `#cdb9c6` / `#a983a0` — muted mauve labels & captions
- `#e2b358` champagne gold — the luxe accent (rules, revenue line, bars)
- `#ff5a36` persimmon — the ONE daring highlight, rationed to two moments (the +12.7% YoY badge and the Jan-2026 chart peak)

**Type.** Display: **Bodoni Moda** — the high-contrast Didone of fashion/luxury print, used large and italic for the masthead, hero figure, and every exhibit title. Body/labels: **Archivo** (a quiet grotesque). Data/ledger: **Space Mono**, so every figure reads like a printed stock page. Three roles, each doing one job.

**Layout.** Centered masthead with gold rules and Roman-numeral fiscal dates → asymmetric hero (1.35fr editorial copy with a Bodoni drop-cap : 0.95fr giant `$3.14M`) → a 5-cell ruled ledger strip → a 12-column exhibit grid mixing full-width, 7/5, and 5/7 splits, including a serif pull-quote panel for rhythm. A fixed vertical "spine" runs the publication name up the left margin.

**The aesthetic risk.** Rendering the hero KPI as a bleed-scale Didone number (up to ~11rem) with italic gold `M`, and staging a slow ink-draw of the 75-month revenue line on load — betting that oversized editorial typography plus restraint reads as *authored luxury* rather than a data tool. Boldness is spent in one place (the type and the single line); everything else stays hairline-quiet. Motion respects `prefers-reduced-motion`; focus is visible.

**Data honesty.** Order revenue ($3.14M / 25,000 orders) is labelled distinctly from lifetime member revenue (tiers, channels, geography), which sums higher — kept in separate exhibits with explicit sub-captions so the two never get conflated.
