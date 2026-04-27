# Handoff: Alfi — Affiliate Automation Tool

## Overview

Alfi is an internal-use, single-operator tool for running Temu affiliate marketing at scale. It collapses the manual seven-step workflow (find product → write copy → format → post → track → reconcile → report) into one approve-and-ship pipeline. Built for **one operator + future assistant**, not multi-tenant SaaS.

The core design idea: **the unit of work is the angle, not the post.** For every product, on every platform, AI generates 3 distinct tones (Practical / Premium / Witty). The operator curates winners, schedules them, and ships across all channels at once.

## About the design files

The files in this bundle are **design references created in HTML/JSX as a clickable prototype** — they show intended look, layout, copy, and interactions. They are NOT production code to copy verbatim. The task is to **recreate these designs in the target codebase's environment** (the engineering plan in the original PRD calls for a Rails app — implement in Rails + Hotwire/Turbo + Stimulus, or whatever the team has standardized on).

If you're starting fresh: Rails 7 + Hotwire + Tailwind matches the doc's spec. The HTML prototype uses inline React for speed of iteration only — do not ship React unless the team has already chosen it.

## Fidelity

**High-fidelity.** Pixel-perfect mockups with final colors, typography, spacing, and copy. Recreate visually 1:1 using the codebase's component primitives. The operator/terminal aesthetic is intentional and load-bearing — please preserve it.

## Screens

The app has 10 routes. Sidebar order is the canonical IA.

### 1. Dashboard (`/`)
Operator's morning landing page. Three rows:
- **Header**: italic-serif greeting "Good morning, Pastro." + sync status + primary CTA "Add product"
- **KPI strip** (4 cells, 1320px max-width): Earnings MTD, Clicks Today, CTR 7-day, Posts This Week. Each has a sparkline in the bottom-right corner of the cell, a delta with up/down arrow, and a serif-numeral big value.
- **Two-column grid (1.6fr / 1fr)**:
  - Left: Review queue — list of product cards with thumbnail, title, ID, score bar, clicks, earned, status tag
  - Right: Live click feed — timestamped, with platform pill, country, +$ earned in green
- **Second two-column row (1fr / 1fr)**: Top performers MTD (table), Today's schedule (timeline list with platform color stripes)

### 2. Products list (`/products`)
- Header + filter pills (All / Live / Review queue / Scheduled / Paused) with counts
- Same product row pattern as Dashboard's review queue, but full list

### 3. Add product (`/products/new`)
Three-step flow, currently shows step 1 + pipeline:
- URL paste box with link icon, "Generate" primary button, bulk paste + hot-items shortcuts below
- Pipeline card showing 7 sequential AI steps (Apify scrape → deeplink → 3 tone generations × 5 platforms → render Pinterest pin variants → quality check) with green checkmarks for done, pulsing amber dot for current
- Buttons: "Save & add another" + "Continue to angles"

### 4. Product detail (`/products/:id`) — **THE HEART OF THE PRODUCT**
Three-column layout (320px / fluid / 300px):
- **Left rail**: product photo, ID/import date, serif title, price + margin, 5 stat rows (score, clicks, earned, posts, angles), affiliate link with copy/preview buttons, source URL, optional flagged note in amber pill
- **Center**: "Step 2/3 — Curate angles" + tabs for each platform (Telegram / Pinterest / X / TikTok / Instagram). Selected platform shows **3 inline native-looking previews** side by side — one per tone (Practical / Premium / Witty). Cards have:
  - Header with tone letter badge (P / M / W), tone label, "Winner" tag if selected, edit + regenerate icons
  - Italic tone description
  - **Native preview** of how the post will look on that platform (real visual mock — Telegram blue chat bubble, Pinterest pin card with image overlay, X tweet with avatar/handle/engagement counts, TikTok dark assist-mode script, Instagram story-format card)
  - Footer: prompt version, char count, "Pick this" / "✓ Selected" button
  - Below the cards: full matrix table showing all platforms × all tones, click any cell to switch
- **Right rail**: "Step 3/3 Ship.", selected angles summary, schedule options (Ship now / Stagger across day / Custom), tracking explanation, primary CTA "Ship 5 posts" + "Save as draft"

### 5. Calendar (`/calendar`)
- Week view, 7 days × 7 hours grid
- Each scheduled post is a colored chip with platform border-left stripe, title, tone, "live" or "recurring" mono tags
- Today's column gets a subtle amber tint
- Top controls: prev/today/next + Week/Month toggle

### 6. Analytics (`/analytics`)
- Big daily earnings line chart (27-day, with hovering dots)
- Tone × Platform earnings heatmap (5 platforms × 3 tones, amber intensity)
- Best time to post horizontal bar chart with insight callout
- Top angles MTD table (impressions / clicks / CTR / EPC / earned)

### 7. Earnings & reconciliation (`/earnings`)
- 4 KPIs (Reported, Auto-matched %, Needs review, Variance)
- Reconciliation queue table — each row has confidence-scored "suggested match" with a progress bar, "Confirm" or "Manual link" actions
- Monthly statements table

### 8. Prompt library (`/prompts`)
Two-column (380px / fluid):
- Left: list of all prompts grouped by Active / Archived, each row shows tone, platform, version, runs, EPC
- Right: editor for the selected prompt — version performance bars, syntax-colored Liquid template source, variables in scope table

### 9. Short links (`/links`)
- 4 KPIs (Active links, Clicks 30d, Top EPC, Bot traffic blocked)
- Table: slug (with `alfi.co/` prefix in mono), target description, clicks, CTR, earned, status, link/chart actions

### 10. Settings (`/settings`)
Two-column section pattern (240px label / fluid content):
- Channels — 5 rows with platform avatar, name, status tag, detail mono line, configure button
- Domain & short links — alfi.co verification card (DNS, SSL, Pinterest)
- AI prompts — version table with EPC perf
- Discovery — 3 toggle rows (daily sync, auto-generate, auto-schedule)

## Design tokens

All in `styles.css`. Colors are oklch — convert to hex at handoff time if needed.

### Colors — light theme
| Token | Value | Use |
|---|---|---|
| `--bg` | oklch(0.985 0.003 80) ≈ `#fbf9f5` | Page background |
| `--bg-2` | oklch(0.97 0.004 80) ≈ `#f5f1ea` | Sidebar, table headers |
| `--bg-3` | oklch(0.945 0.005 80) ≈ `#ece6dc` | Hover, sparkline track |
| `--surface` | white | Cards |
| `--line` | oklch(0.9 0.005 80) ≈ `#dfd9cf` | Borders |
| `--ink` | oklch(0.22 0.005 80) ≈ `#2c2620` | Primary text |
| `--ink-2` | oklch(0.42 0.005 80) | Secondary text |
| `--ink-3` | oklch(0.6 0.005 80) | Tertiary / mono labels |
| `--accent` | oklch(0.72 0.16 60) ≈ `#e8a04a` | Amber — tracked / live / earning |
| `--accent-bg` | oklch(0.96 0.04 70) ≈ `#fbeed4` | Amber wash |
| `--pos` | oklch(0.62 0.13 155) ≈ `#3fa372` | Earnings green |
| `--neg` | oklch(0.6 0.18 25) ≈ `#d65a3a` | Errors |
| `--info` | oklch(0.6 0.12 240) ≈ `#5a8fd6` | Scheduled/info |

### Platform color stripes
| Platform | Token | Hex |
|---|---|---|
| Telegram | `--tg` | `#3a86d4` |
| Pinterest | `--pin` | `#cb3a2a` |
| X | `--x` | near-black `#2c2620` (light) / `#e8e6e0` (dark) |
| TikTok | `--tt` | `#c14da0` |
| Instagram | `--ig` | `#d04373` |

### Dark theme
Defined under `[data-theme="dark"]` in `styles.css`. Same accent hue, tinted backgrounds, lighter ink.

### Typography
- Body / UI: **Inter** 400/500/600/700
- Numbers, IDs, slugs, mono labels: **JetBrains Mono** 400/500/600
- Section headlines, KPI big numbers, page titles: **Instrument Serif** italic
- Base font-size: 14px. Body line-height: 1.5.
- Type scale used: 10px (mono micro-labels uppercase tracked 0.08em), 11px, 12px (body sm), 13px (body), 14px (button), 16px, 18px, 22px, 24px, 26px, 28px (KPI), 32px (page H1)

### Spacing
4 / 6 / 8 / 10 / 12 / 14 / 16 / 18 / 20 / 22 / 24 / 28 / 32 (px). Page content uses `padding: 24px 28px 60px` and `max-width: 1320px`.

### Radii
- 4px chips/tags
- 6px buttons, inputs, small cards
- 10px main cards (`--radius-lg`)

### Shadows
- `--shadow-sm`: subtle 1px card lift
- `--shadow-md`: 4px/16px card hover

### Tags / pills
- `.tag.live`: pos-bg + pos with 5px dot
- `.tag.scheduled`: info-bg + info
- `.tag.flagged`: accent-bg + accent-fg (used for "Hot")
- `.tag.warn`: neg-bg + neg
- `.tag.draft`: bg-3 + ink-3
- All uppercase mono 10px tracked 0.04em

## Interactions & behavior

- **Theme toggle**: top-right sun/moon icon flips `[data-theme]` on `<html>`, all colors transition instantly via CSS vars
- **Sidebar**: active item gets surface bg + 1px line border + sm shadow. Counts pill appears for items with pending work
- **Product card click anywhere → product detail**
- **Angle card "Pick this" → toggles selection**, card gets 1.5px amber border + 4px amber glow shadow + amber tint header. Bottom of card shows "✓ Selected" instead of "Pick this"
- **Cross-platform matrix**: clicking any cell sets the active tab AND selects that tone for that platform
- **Live feed**: pulse animation on the streaming dot (`.dot-pulse` keyframes in styles.css)
- **Hover**: rows get bg-2 background; buttons get bg-3
- **Add product pipeline**: "current" step has amber circle with pulsing white dot; "done" steps are solid pos green with checkmark and timing label

## State

- `theme: 'light' | 'dark'`
- `route: { name, product? }` — see `app.jsx` switch for all routes
- Per product detail: `selected: { tg, pin, x, tt, ig }` mapping platform → tone
- Per analytics: date range filter, currently hardcoded
- Per reconciliation: per-row confirm/manual-link state

## Files in this bundle

- **`preview.html`** — opens the prototype inside a fake browser chrome (good demo entry point)
- **`alfi-share-standalone.html`** — single-file 500KB build, works fully offline. Open in any browser. Send to non-technical reviewers.
- **`app.html`** — entrypoint that mounts the React prototype
- **`app.jsx`** — top-level router + theme controller
- **`shell.jsx`** — Sidebar, TopBar, KPI, Sparkline, Platform pill, Icon set
- **`data.jsx`** — sample data: products, tones, angle copy, posts, click feed, KPIs
- **`screens-dashboard.jsx`** — Dashboard screen + ProductRow + ScoreBar
- **`screens-product.jsx`** — Product detail with all 5 native platform previews (Telegram / Pinterest / X / TikTok / Instagram)
- **`screens-rest.jsx`** — Products list, Add product, Calendar, Analytics, Earnings, Settings
- **`screens-prompts.jsx`** — Prompt library
- **`screens-links.jsx`** — Short links manager
- **`styles.css`** — all design tokens, app shell, components, light + dark themes

## Implementation guidance

1. Start with `styles.css` — port the tokens to the target framework's theming system (Tailwind config, CSS-in-JS theme, etc.) before writing any components.
2. Build the **app shell** first (sidebar + topbar + content slot) — it's the same on every screen.
3. Build the **Product detail screen second**. It's the highest-value, hardest screen, and validates the design system end-to-end. The 5 native platform previews are bespoke — recreate each one carefully.
4. Build remaining screens in any order; they all reuse the same primitives (KPI strip, card, table, tag, platform pill).
5. Connect to the real backend last. The doc specifies Apify for product scraping, GPT-4o for copy generation, and CSV import for earnings reconciliation.

## Don't change without asking

- Three-tone vocabulary (Practical / Premium / Witty) — load-bearing for the entire UX
- Amber-as-money color signal (live / earning / hot)
- Italic-serif headlines for emotional moments (KPI numbers, page H1s, section openers) paired with mono micro-labels
- Native-looking platform previews on the angle picker — this is the "is it actually going to look right?" answer

— design ref complete.
