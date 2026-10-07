# Variant 2 — MERIDIAN // COMMERCE DESK

**Concept.** A revenue-operations *terminal*: the confident, high-signal energy of a Bloomberg/trading desk applied to the e-commerce dataset. Everything is a readout — a scrolling KPI ticker tape, a live session clock, hairline-ruled panels, tabular figures, and a command-line status bar at the foot. The deliberate departure from the existing dark "glass bento" is **warmth + density + hard edges**: zero border-radius, zero glassmorphism, no soft rounded cards. It reads as a power tool, not a marketing dashboard.

**Palette (hex).**
- `#0a0907` warm near-black base / `#100e0a` panel
- `#E7DCC4` parchment (primary readable data) + `#867a5f` muted labels
- `#FFB020` amber phosphor accent (bloom on hero figures) + `#FFCB5C` bright
- `#57E39A` up / `#FF5F56` down — semantic, not decorative (up/down coloring is *true* to a financial terminal, so it's earned)
- Hairlines: `rgba(255,178,48,.16)`

**Type.** One family carries almost everything — **JetBrains Mono** (300–800) for every number, label, and table, so the whole layout snaps to a monospace character grid with genuine tabular alignment. **Space Grotesk** appears only as the etched masthead nameplate and the big hero figure — an engineered "bezel" voice against the mono body.

**Layout.** Masthead bezel → animated ticker tape → a strict 12-column hairline grid (gaps are the rules, via a colored container behind 1px gutters). Hero = full monthly revenue time-series (75 real periods, 2020–2026) with an MA/3 phosphor overlay and a hover crosshair readout; flanked by a stacked KPI readout with inline sparklines. Below: category rank bars, channel/geo/product/discount data tables, payment + device mix, tier LTV, order-status and delivery-days micro-charts. Dense, but every row is aligned and hierarchical. All charts are hand-built inline SVG/CSS — no chart library.

**The aesthetic risk.** Amber-CRT phosphor instead of the safe "hacker green" (or generic acid-accent-on-black) terminal cliché: a warm vintage-monitor hue with a faint scanline overlay and a soft bloom on key figures. The bet is that the amber warmth reads as *premium ops desk* rather than gimmick — held in check by keeping scanlines near-invisible (~3% at 3px pitch), restricting glow to hero numbers only, and respecting `prefers-reduced-motion` (ticker, blink, and crosshair all calm down). Boldness is spent in exactly one place; everything else stays quiet and legible.
