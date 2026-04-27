# alfi — Affiliate OS

Solo-operated affiliate-marketing automation for Temu products. Owner pastes products → Claude generates copy in 3 tones per platform → owner approves → publishes to Telegram/Pinterest/X → tracks clicks via short links. The UI brand is **alfi** (lowercase, α wordmark on amber); the Rails app/dir is still `affiliate`.

Read `ENGINEERING_HANDOFF.md` for integration-level intent. Read `design_handoff_alfi/README.md` + `styles.css` + the screen `.jsx` files for design source of truth (high-fidelity, recreate visually 1:1 in ERB). Read this file for the rules that apply to writing code in *this* repo.

## Stack
- Ruby 3.4.3, Rails 8.1.3, PostgreSQL 15+
- **Solid Queue / Solid Cache / Solid Cable** — Postgres-backed. No Redis. No Sidekiq.
- Tailwind 4 via `@tailwindcss/cli` + esbuild via `jsbundling-rails`
- Hotwire (Turbo + Stimulus)
- Active Storage on Cloudflare R2 (S3-compatible)
- Kamal for deploy

The handoff doc was written before this repo settled on the Rails 8 default stack. **When the handoff says Sidekiq, importmap, or HTTParty, ignore those and use Solid Queue, esbuild, and Faraday.** The integration intent is still correct; the plumbing names changed.

## Dev loop
- `bin/dev` — runs web + js + css watchers (see `Procfile.dev`)
- `bin/rails test` — minitest unit/integration; system tests via Capybara/Selenium
- `bin/rails db:prepare` — also creates `*_queue`, `*_cache`, `*_cable` databases

## Architecture rules

**Service objects** live in `app/services/<provider>/<role>.rb`:
- `Apify::TemuScraper`, `Telegram::Publisher`, `Pinterest::Publisher`, `Content::AngleGenerator`, etc.
- HTTP via Faraday + faraday-retry. Never `HTTParty`.
- Never call external APIs from controllers — always async via Active Job.

**Background jobs** (Solid Queue):
- Idempotent. Use `dedupe_key` (e.g. `post.id`) so retries don't double-post.
- Per-platform queues (`:telegram`, `:pinterest`, `:x`, `:clicks`) configured in `config/queue.yml`.
- Recurring schedules in `config/recurring.yml`.

**Public links** always go through `/r/:slug` redirect. Never expose raw `affiliate_url` in posts — Pinterest and X spam-flag direct affiliate domains.

## UI / design system

Design tokens and component classes live in `app/assets/stylesheets/application.tailwind.css` (ported verbatim from `design_handoff_alfi/styles.css`). **Use the named classes — `.btn`, `.card`, `.tag.live`, `.platform.tg`, `.kpi`, `.tbl`, `.sb-item.active` — for branded components.** Tailwind 4 utilities are fine for layout glue (`flex gap-4`) but don't reinvent buttons/cards/tags via utilities. The class catalogue is documented in the design handoff and in the `design_alfi_tokens.md` memory.

**Load-bearing rules (don't change)**:
- Three-tone vocabulary: Practical / Premium / Witty (badge chars P / M / W)
- Amber as the money signal (live / earning / hot)
- Italic-serif for emotional moments (KPI numbers, page H1s, greetings); mono for labels (uppercase 10px tracked 0.08em)
- Native-looking platform previews on the angle picker — Telegram bubble, Pinterest pin, X tweet, TikTok dark script card, Instagram square

**Fonts**: Inter (UI), Instrument Serif (headlines, italic + roman), JetBrains Mono (labels, IDs, slugs). Loaded via Google Fonts CDN in the layout.

**Theme**: light/dark via `[data-theme]` on `<html>`. Toggle controlled by a Stimulus controller that flips a cookie + the attribute.

**10-route IA** (sidebar order): Dashboard, Products, Calendar, Analytics, Earnings · Workshop: Reconcile, Short links, Prompt library · Settings.

**Click tracking**: redirect must respond <50ms. All logging is async via `LogClickJob`. Bot filter regex: `TelegramBot|Pinterest|facebookexternalhit|Twitterbot`. Bots are recorded with `is_bot: true` and do **not** increment `short_link.click_count`.

## Data conventions

- **Money**: integer minor units (`price_cents`) + ISO currency code column (`USD`, `NGN`). Naira primary, USD secondary; convert at display time.
- **Time zone**: `Africa/Lagos` (set in `config/application.rb`). DB stores UTC.
- **JSON metadata**: use `jsonb`, never `text`.
- **Slugs**: `citext` columns, unique indexes.

## Credentials
- Rails master key in `config/master.key` (gitignored).
- Per-`ChannelAccount` OAuth tokens encrypted via Active Record Encryption on a `credentials_blob:jsonb` column.
- Shared API keys (`ANTHROPIC_API_KEY`, `APIFY_API_TOKEN`, `TELEGRAM_BOT_TOKEN`, R2 keys) in env. See `.env.example`.

## AI content
- Default model: `claude-sonnet-4-6` (best copy quality).
- Cheap alternative: `claude-haiku-4-5` for classification / bulk regeneration.
- Strict JSON outputs. Prompt version recorded on every `ContentAngle.generated_by` (e.g. `claude-sonnet-4-6:v1`).

## Image variants (Active Storage on R2)
- `pinterest_pin` — 1000×1500, JPEG q85 (2:3 vertical, Pinterest-optimal)
- `telegram_card` — 1280×720, JPEG q90
- `twitter_card` — 1200×675, JPEG q85
- Always re-host on R2; never put Temu CDN URLs into a post (they expire).

## Don't build (Phase 4+)
- Multi-tenancy
- A/B prompt testing
- TikTok / Instagram automation
- Headless-browser Temu link conversion
- Webhook receivers for platform deletes/edits
- Background re-scrape for price changes
- Email/Slack notifications
