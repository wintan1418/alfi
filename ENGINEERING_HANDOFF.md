# Pacearena Affiliate OS — Engineering Handoff

> **Audience:** Claude Code (or any engineer picking this up)
> **Stack:** Rails 8, Hotwire, Tailwind, Sidekiq, Postgres 15+, Cloudflare R2
> **Companion docs:** `PRD.md` (product), `db_migrate_initial_schema.rb` (schema), `Gemfile` (deps)

This doc covers the third-party integrations: which APIs we use, how to obtain access, what to put in env vars, and reference Ruby code for each. Read the PRD first — it explains *why* before this explains *how*.

---

## Integration overview

| Concern | Provider | Why this one | Cost (Apr 2026) |
|---|---|---|---|
| **Temu product data** | Apify (`piotrv1001/temu-listings-scraper`) **or** Piloterr | No public Temu affiliate API exists; these are the only stable options | Apify: pay-per-result (~$0.30/1k items); Piloterr: from $29/mo |
| **Temu affiliate link** | Manual paste from Temu affiliate dashboard | "Convert Link" tool is UI-only, has no API. No way to programmatically generate. | Free |
| **Telegram posting** | Telegram Bot API (direct) | Free, instant, no approvals | Free |
| **Pinterest posting** | Pinterest API v5 (direct) | Best-fit for Temu products; verified-domain link safety | Free, business account |
| **X / Twitter posting** | X API v2 Basic (direct) | Reasonable rate limits | $200/mo |
| **AI content generation** | Anthropic API (Claude Sonnet 4.6) | Best copy quality | ~$3/M input, $15/M output |
| **Image hosting** | Cloudflare R2 | Zero egress fees (Pinterest pulls images repeatedly) | $0.015/GB-month, free egress |
| **IP geolocation** | MaxMind GeoLite2 (offline DB) | No API call per click | Free with account |

**Buffer is intentionally not in V1.** Their public API is in invite-only beta as of early 2026, and their personal API key rotates every 30 days. We post directly to each platform — more code initially, more control forever.

---

## 1. Temu product data

### The truth about Temu's APIs

There is **no Temu affiliate API**. The "Temu API" you'll find in search results is for *sellers* managing their own product listings, not for affiliates pulling the catalog.

The only reliable paths:

1. **Manual paste** (V1 default): Owner finds product on Temu, pastes URL into our app
2. **Apify scraper** (V1 enhancement): Bulk product discovery via the `piotrv1001/temu-listings-scraper` actor
3. **Piloterr** (alternative): REST API for single-product lookups

### Apify integration

**How to obtain:**

1. Sign up at https://apify.com (free tier: $5/mo credits)
2. Settings → Integrations → API tokens → create token
3. Find actor: https://apify.com/piotrv1001/temu-listings-scraper
4. Note the actor ID (format: `username~actor-name`, e.g., `piotrv1001~temu-listings-scraper`)

**Env vars:**

```bash
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxx
APIFY_TEMU_ACTOR_ID=piotrv1001~temu-listings-scraper
```

**Service object:**

```ruby
# app/services/apify/temu_scraper.rb
module Apify
  class TemuScraper
    BASE_URL = "https://api.apify.com/v2"

    def initialize(token: ENV.fetch("APIFY_API_TOKEN"),
                   actor_id: ENV.fetch("APIFY_TEMU_ACTOR_ID"))
      @token = token
      @actor_id = actor_id
    end

    # Synchronous run — blocks until complete. Use in Sidekiq job, not web request.
    # Returns array of product hashes.
    def fetch_products(search_query:, max_items: 20)
      run = start_run(search_query: search_query, max_items: max_items)
      run = poll_until_complete(run["id"])
      raise RunFailed, run["statusMessage"] unless run["status"] == "SUCCEEDED"

      fetch_dataset(run["defaultDatasetId"])
    end

    # Single product detail by URL
    def fetch_product(url:)
      run = start_run(start_urls: [{ url: url }], max_items: 1)
      run = poll_until_complete(run["id"])
      raise RunFailed, run["statusMessage"] unless run["status"] == "SUCCEEDED"

      fetch_dataset(run["defaultDatasetId"]).first
    end

    private

    def start_run(input)
      response = HTTParty.post(
        "#{BASE_URL}/acts/#{@actor_id}/runs?token=#{@token}",
        headers: { "Content-Type" => "application/json" },
        body: input.to_json,
        timeout: 30
      )
      raise StartFailed, response.body unless response.success?
      response.parsed_response["data"]
    end

    def poll_until_complete(run_id, timeout: 300, interval: 5)
      deadline = Time.current + timeout
      loop do
        response = HTTParty.get("#{BASE_URL}/actor-runs/#{run_id}?token=#{@token}", timeout: 10)
        run = response.parsed_response["data"]
        return run if %w[SUCCEEDED FAILED ABORTED TIMED-OUT].include?(run["status"])
        raise Timeout, "Run #{run_id} timed out" if Time.current > deadline
        sleep interval
      end
    end

    def fetch_dataset(dataset_id)
      response = HTTParty.get(
        "#{BASE_URL}/datasets/#{dataset_id}/items?token=#{@token}&clean=true",
        timeout: 30
      )
      response.parsed_response
    end

    class StartFailed < StandardError; end
    class RunFailed < StandardError; end
    class Timeout < StandardError; end
  end
end
```

**Key thing Gemini got wrong:** Apify runs are async. You start a run, poll until it finishes, then fetch the dataset. The example in Gemini's response that just calls `runs?token=...` and reads `defaultDatasetId` immediately would return an empty dataset because the run hasn't finished yet.

**Rate limit hygiene:** Apify charges per result. Cache aggressively. Run discovery scrapes once a day at most (cron via `sidekiq-cron`).

### Piloterr alternative

**How to obtain:** Sign up at https://www.piloterr.com, generate API key, endpoint is `/api/v2/temu/product`.

```ruby
# app/services/piloterr/temu_client.rb
module Piloterr
  class TemuClient
    BASE_URL = "https://piloterr.com/api/v2/temu"

    def fetch_product(url:)
      response = HTTParty.get(
        "#{BASE_URL}/product",
        query: { query: url },
        headers: { "x-api-key" => ENV.fetch("PILOTERR_API_KEY") },
        timeout: 30
      )
      raise FetchFailed, response.body unless response.success?
      response.parsed_response
    end

    class FetchFailed < StandardError; end
  end
end
```

Piloterr is simpler if you only need single-product lookups (the `paste a URL` flow). Apify wins for bulk discovery.

---

## 2. Temu affiliate links — the manual reality

**There is no programmatic way to generate a Temu affiliate link.** Their "Convert Link" tool is a UI form with anti-bot protections. Two options, neither great:

1. **Manual paste (V1)** — Owner generates affiliate link in Temu dashboard, pastes both `source_url` and `affiliate_url` into app. 10 seconds per product. Boring but bulletproof.
2. **Headless browser (V2 maybe)** — Playwright session that logs into Temu affiliate dashboard, fills the form, scrapes the result. Fragile, ToS-grey.

**The PRD's `Product` model has both `source_url` (what you paste from Temu's app) and `affiliate_url` (what you paste from Temu affiliate dashboard).** Don't try to derive one from the other.

---

## 3. Telegram bot

**How to obtain:**

1. Open Telegram, message `@BotFather`
2. `/newbot`, follow prompts, get bot token
3. Create a Telegram channel for posting
4. Add your bot as channel admin with "Post Messages" permission
5. Get channel ID: send any message to channel, forward to `@userinfobot`, copy `Forwarded from chat: -100xxxxxxxxxx`

**Env vars:**

```bash
TELEGRAM_BOT_TOKEN=123456789:AAAAxxxxxxxxxxxxxxxxxxxxxxxxxxx
# Channel IDs stored in ChannelAccount.encrypted_credentials, not env
```

**Service:**

```ruby
# app/services/telegram/publisher.rb
module Telegram
  class Publisher
    def initialize(channel_account)
      @channel = channel_account
      @creds = channel_account.decrypted_credentials  # { bot_token:, chat_id: }
    end

    # Returns hash with :message_id and :url, or raises PublishFailed
    def publish_with_image(image_url:, caption:)
      response = client.send_photo(
        chat_id: @creds["chat_id"],
        photo: image_url,
        caption: caption,
        parse_mode: "Markdown"
      )

      message_id = response.dig("result", "message_id")
      raise PublishFailed, response unless message_id

      {
        message_id: message_id,
        url: telegram_url(@channel.handle, message_id)
      }
    end

    def publish_with_media_group(image_urls:, caption:)
      media = image_urls.first(10).each_with_index.map do |url, idx|
        {
          type: "photo",
          media: url,
          caption: idx.zero? ? caption : nil,
          parse_mode: idx.zero? ? "Markdown" : nil
        }.compact
      end

      response = client.send_media_group(
        chat_id: @creds["chat_id"],
        media: media.to_json
      )

      first_message_id = response.dig("result", 0, "message_id")
      raise PublishFailed, response unless first_message_id

      {
        message_id: first_message_id,
        url: telegram_url(@channel.handle, first_message_id)
      }
    end

    private

    def client
      @client ||= ::Telegram::Bot::Api.new(@creds["bot_token"])
    end

    def telegram_url(handle, message_id)
      h = handle.to_s.delete_prefix("@")
      "https://t.me/#{h}/#{message_id}"
    end

    class PublishFailed < StandardError; end
  end
end
```

**Constraints:**
- Caption max: 1024 chars (with image), 4096 chars (text only)
- Media group: max 10 images, caption only on first
- Rate limit: 30 messages/sec global, 1/sec per chat — generous for our volume
- Markdown parsing: use `Markdown` mode, not `MarkdownV2` (V2 requires escaping every special char and is painful)

---

## 4. Pinterest API

**How to obtain:**

1. Convert your account to Pinterest Business: https://business.pinterest.com
2. **Verify your domain**: Settings → Claim → enter domain → add DNS TXT record. **This is critical** for affiliate-friendly link handling.
3. Apply for API access: https://developers.pinterest.com → Create app
4. App requires: name, redirect URI, scopes (`boards:read`, `pins:read`, `pins:write`, `user_accounts:read`)
5. Approval is usually 1-3 days
6. Implement OAuth 2.0 flow to get user access token

**Env vars:**

```bash
PINTEREST_APP_ID=xxxxxxxx
PINTEREST_APP_SECRET=xxxxxxxxxxxxxxxx
PINTEREST_REDIRECT_URI=https://yourdomain.com/oauth/pinterest/callback
# Per-account access_token + refresh_token in ChannelAccount.encrypted_credentials
```

**Publisher:**

```ruby
# app/services/pinterest/publisher.rb
module Pinterest
  class Publisher
    BASE_URL = "https://api.pinterest.com/v5"

    def initialize(channel_account)
      @channel = channel_account
      @creds = channel_account.decrypted_credentials  # { access_token:, refresh_token:, expires_at:, board_id: }
    end

    def create_pin(image_url:, title:, description:, link:, board_id: nil)
      ensure_fresh_token!

      payload = {
        board_id: board_id || @creds["board_id"],
        title: title.first(100),
        description: description.first(500),
        link: link,  # the short-link URL, NOT the raw affiliate URL
        media_source: {
          source_type: "image_url",
          url: image_url
        }
      }

      response = HTTParty.post(
        "#{BASE_URL}/pins",
        headers: auth_headers,
        body: payload.to_json,
        timeout: 30
      )

      raise PublishFailed, response.body unless response.success?

      {
        pin_id: response.parsed_response["id"],
        url: "https://www.pinterest.com/pin/#{response.parsed_response['id']}"
      }
    end

    def list_boards
      ensure_fresh_token!
      response = HTTParty.get(
        "#{BASE_URL}/boards",
        headers: auth_headers,
        timeout: 15
      )
      response.parsed_response["items"]
    end

    private

    def auth_headers
      { "Authorization" => "Bearer #{@creds['access_token']}", "Content-Type" => "application/json" }
    end

    # Pinterest tokens last ~30 days; refresh tokens last ~1 year
    def ensure_fresh_token!
      return if @creds["expires_at"] && Time.parse(@creds["expires_at"]) > 5.minutes.from_now
      refresh_token!
    end

    def refresh_token!
      response = HTTParty.post(
        "#{BASE_URL}/oauth/token",
        headers: { "Content-Type" => "application/x-www-form-urlencoded" },
        basic_auth: { username: ENV.fetch("PINTEREST_APP_ID"), password: ENV.fetch("PINTEREST_APP_SECRET") },
        body: { grant_type: "refresh_token", refresh_token: @creds["refresh_token"] },
        timeout: 15
      )
      raise TokenRefreshFailed, response.body unless response.success?
      data = response.parsed_response
      @channel.update_credentials!(
        access_token: data["access_token"],
        refresh_token: data["refresh_token"] || @creds["refresh_token"],
        expires_at: (Time.current + data["expires_in"].seconds).iso8601
      )
      @creds = @channel.decrypted_credentials
    end

    class PublishFailed < StandardError; end
    class TokenRefreshFailed < StandardError; end
  end
end
```

**Critical Pinterest gotchas:**

1. **The `link` field must point to your short-link domain, not directly to Temu.** Pinterest's spam systems flag direct affiliate-platform URLs aggressively. Send to `https://yourdomain.com/r/abc123` which then redirects to the Temu affiliate URL.
2. **Image URL must be publicly accessible and stable.** Don't use Temu CDN URLs (they expire). Always re-host on R2.
3. **Image requirements**: 2:3 ratio works best (1000×1500), JPEG/PNG, max 32MB.
4. **Domain verification** is non-negotiable. Pins from non-verified domains get suppressed.

---

## 5. X / Twitter API

**How to obtain:**

1. Apply at https://developer.x.com — Basic tier ($200/month) is required for write access
2. Create app, get API keys + bearer token
3. Implement OAuth 2.0 user context for posting on your account's behalf

**Env vars:**

```bash
X_API_KEY=xxxxxxxxxxxx
X_API_SECRET=xxxxxxxxxxxxxxxxxxxx
X_CLIENT_ID=xxxxxxxxxxxx
X_CLIENT_SECRET=xxxxxxxxxxxxxxxx
# User access tokens in ChannelAccount.encrypted_credentials
```

**Publisher:**

```ruby
# app/services/x/publisher.rb
module X
  class Publisher
    BASE_URL = "https://api.twitter.com/2"
    UPLOAD_URL = "https://upload.twitter.com/1.1/media/upload.json"

    def initialize(channel_account)
      @channel = channel_account
      @creds = channel_account.decrypted_credentials
    end

    def post_tweet(text:, image_urls: [])
      ensure_fresh_token!

      media_ids = image_urls.first(4).map { |url| upload_media(url) }

      payload = { text: text.first(280) }
      payload[:media] = { media_ids: media_ids } if media_ids.any?

      response = HTTParty.post(
        "#{BASE_URL}/tweets",
        headers: oauth2_headers,
        body: payload.to_json,
        timeout: 30
      )

      raise PublishFailed, response.body unless response.success?
      tweet_id = response.parsed_response.dig("data", "id")
      {
        tweet_id: tweet_id,
        url: "https://x.com/#{@channel.handle}/status/#{tweet_id}"
      }
    end

    private

    # Media upload still uses v1.1 OAuth 1.0a — yes, this is annoying.
    # Use the `oauth` gem or hand-roll. Worth abstracting into a UploadClient.
    def upload_media(url)
      raise NotImplementedError, "See X::MediaUploader; uses OAuth 1.0a"
    end

    def oauth2_headers
      { "Authorization" => "Bearer #{@creds['access_token']}", "Content-Type" => "application/json" }
    end

    def ensure_fresh_token!
      # X access tokens expire in 2h; use refresh_token grant
      # Same pattern as Pinterest
    end

    class PublishFailed < StandardError; end
  end
end
```

**X gotchas:**

1. **Posting tweets uses OAuth 2.0, but media upload still uses OAuth 1.0a.** This is a real X API quirk. Plan for both.
2. **280 char limit includes URLs** — but URLs are auto-shortened to 23 chars regardless of actual length. Budget accordingly.
3. **Rate limit**: 200 tweets/15min on Basic tier. Plenty.
4. **No raw affiliate links.** Same as Pinterest — go through your short-link domain.

---

## 6. AI content generation (Anthropic)

**How to obtain:**

1. Sign up at https://console.anthropic.com
2. Add billing
3. Settings → API Keys → Create Key

**Env vars:**

```bash
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxx
```

**Service:**

```ruby
# app/services/content/angle_generator.rb
module Content
  class AngleGenerator
    PROMPT_VERSION = "v1"
    MODEL = "claude-sonnet-4-6"  # or claude-haiku-4-5 for cost optimization

    PLATFORM_CONSTRAINTS = {
      telegram: { caption_max: 1024, supports_markdown: true, hashtags: "optional" },
      pinterest: { title_max: 100, desc_max: 500, hashtags: "minimal" },
      x: { total_max: 280, hashtags: "1-2 max" },
      instagram: { caption_max: 2200, hashtags: "5-15 ideal" },
      tiktok: { script_seconds: 30, hook_first_3s: true }
    }.freeze

    TONE_GUIDES = {
      practical: "Deal-hunter voice. Lead with price math. 'Stop paying X when Y exists.' Direct, useful.",
      premium: "Curated taste voice. 'The X I keep recommending.' Aspirational but grounded. Lifestyle framing.",
      witty: "Gen-Z casual. Lowercase. Punchy hooks. Self-aware. 'ok but why is this actually...'"
    }.freeze

    def initialize(product)
      @product = product
      @client = ::Anthropic::Client.new(access_token: ENV.fetch("ANTHROPIC_API_KEY"))
    end

    # Generates 3 tones for a single platform. Call this in parallel for multiple platforms via Sidekiq batch.
    def generate(platform:)
      response = @client.messages.create(
        parameters: {
          model: MODEL,
          max_tokens: 2000,
          system: system_prompt(platform: platform),
          messages: [{ role: "user", content: user_prompt }]
        }
      )

      parse_response(response, platform: platform)
    end

    private

    def system_prompt(platform:)
      constraints = PLATFORM_CONSTRAINTS[platform]
      <<~PROMPT
        You write affiliate marketing posts for Temu products on #{platform}.

        Platform constraints: #{constraints.to_json}

        You always produce three variants in different tones:
        - practical: #{TONE_GUIDES[:practical]}
        - premium: #{TONE_GUIDES[:premium]}
        - witty: #{TONE_GUIDES[:witty]}

        Output STRICT JSON only, no preamble:
        {
          "practical": { "hook": "...", "body": "...", "hashtags": ["..."], "cta": "..." },
          "premium":   { "hook": "...", "body": "...", "hashtags": ["..."], "cta": "..." },
          "witty":     { "hook": "...", "body": "...", "hashtags": ["..."], "cta": "..." }
        }

        - hook: max 80 chars, the scroll-stopper
        - body: full post text within platform limits
        - hashtags: array of strings without # prefix
        - cta: short call-to-action

        Use Naira pricing alongside USD where relevant. Audience is Nigeria-primary.
        Never use the word "amazing". Never use generic emoji-stuffing.
      PROMPT
    end

    def user_prompt
      <<~PROMPT
        Product: #{@product.title}
        Price: #{@product.formatted_price}
        Description: #{@product.description&.first(500)}
        Category: #{@product.category}

        Generate the three tones now.
      PROMPT
    end

    def parse_response(response, platform:)
      text = response.dig("content", 0, "text")
      json = JSON.parse(text)

      %w[practical premium witty].map do |tone|
        ContentAngle.new(
          product: @product,
          platform: platform,
          tone: tone,
          hook: json[tone]["hook"],
          body: json[tone]["body"],
          hashtags: json[tone]["hashtags"],
          cta: json[tone]["cta"],
          generated_by: "#{MODEL}:#{PROMPT_VERSION}",
          status: :draft
        )
      end
    end
  end
end
```

**Cost expectations:** ~1.5k input tokens + ~1.5k output tokens per platform per product = ~$0.026 per platform on Sonnet 4.6. Four platforms × 50 products/month = ~$5/mo. Negligible.

---

## 7. Cloudflare R2 (image hosting)

**How to obtain:**

1. Cloudflare account → R2 → enable
2. Create bucket (e.g., `pacearena-products`)
3. R2 → Manage R2 API Tokens → Create API token (with bucket read/write)
4. Settings → Public access → enable for the bucket OR set up custom domain (`media.yourdomain.com`)

**Env vars:**

```bash
R2_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxx
R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_BUCKET=pacearena-products
R2_PUBLIC_URL=https://media.yourdomain.com  # custom domain for public bucket
```

**`config/storage.yml`:**

```yaml
cloudflare:
  service: S3
  access_key_id: <%= ENV["R2_ACCESS_KEY_ID"] %>
  secret_access_key: <%= ENV["R2_SECRET_ACCESS_KEY"] %>
  region: auto
  bucket: <%= ENV["R2_BUCKET"] %>
  endpoint: <%= "https://#{ENV['R2_ACCOUNT_ID']}.r2.cloudflarestorage.com" %>
  force_path_style: true
  public: true
```

`config/environments/production.rb`: `config.active_storage.service = :cloudflare`

**Public URL helper:**

```ruby
# app/models/product_image.rb
class ProductImage < ApplicationRecord
  belongs_to :product
  has_one_attached :file

  # Use custom domain instead of slow Rails proxy URLs for public-facing posts
  def public_url
    return nil unless file.attached?
    "#{ENV.fetch('R2_PUBLIC_URL')}/#{file.key}"
  end
end
```

**Why this matters:** Pinterest pulls your image URL repeatedly when re-pinned. S3 egress would cost money; R2 is free. Over time this is meaningful.

---

## 8. The short-link redirect controller

```ruby
# app/controllers/short_links_controller.rb
class ShortLinksController < ApplicationController
  # No auth, no CSRF — public redirect endpoint
  skip_before_action :verify_authenticity_token, raise: false
  skip_before_action :authenticate_user!, raise: false

  # GET /r/:slug
  def show
    link = ShortLink.find_by!(slug: params[:slug])

    # Log click async — must not block the redirect
    LogClickJob.perform_later(
      short_link_id: link.id,
      ip: request.remote_ip,
      ua: request.user_agent,
      referrer: request.referrer,
      clicked_at: Time.current
    )

    redirect_to link.destination_url, allow_other_host: true, status: :found
  rescue ActiveRecord::RecordNotFound
    redirect_to root_path, status: :found
  end
end

# config/routes.rb
get "/r/:slug", to: "short_links#show", as: :short_link
```

```ruby
# app/jobs/log_click_job.rb
class LogClickJob < ApplicationJob
  queue_as :clicks  # separate queue, low priority

  def perform(short_link_id:, ip:, ua:, referrer:, clicked_at:)
    link = ShortLink.find(short_link_id)
    parser = DeviceDetector.new(ua)
    geo = Geocoder.search(ip).first

    is_bot = parser.bot? || telegram_or_pinterest_preview?(ua)

    link.click_events.create!(
      ip: ip,
      country: geo&.country_code,
      city: geo&.city,
      ua: ua,
      device_type: parser.device_type || (parser.bot? ? "bot" : "unknown"),
      referrer: referrer,
      is_bot: is_bot,
      clicked_at: clicked_at
    )

    return if is_bot
    link.increment!(:click_count)
    link.update_column(:last_clicked_at, clicked_at)
  end

  private

  def telegram_or_pinterest_preview?(ua)
    ua.to_s.match?(/TelegramBot|Pinterest|facebookexternalhit|Twitterbot/i)
  end
end
```

---

## 9. Encrypted credentials on `ChannelAccount`

```ruby
# app/models/channel_account.rb
class ChannelAccount < ApplicationRecord
  encrypts :encrypted_credentials  # Rails 8 encrypts; configure keys in credentials.yml.enc

  enum :platform, { telegram: 0, pinterest: 1, x: 2, instagram: 3, tiktok: 4 }

  def decrypted_credentials
    return {} if encrypted_credentials.blank?
    JSON.parse(encrypted_credentials)
  end

  def update_credentials!(**new_creds)
    merged = decrypted_credentials.merge(new_creds.stringify_keys)
    update!(encrypted_credentials: merged.to_json)
  end

  def credentials_valid?
    case platform.to_sym
    when :telegram then decrypted_credentials["bot_token"].present? && decrypted_credentials["chat_id"].present?
    when :pinterest then decrypted_credentials["access_token"].present?
    when :x then decrypted_credentials["access_token"].present?
    end
  end
end
```

**Generate Rails encryption keys:** `bin/rails db:encryption:init` — paste output into `config/credentials.yml.enc`.

---

## 10. Environment variable manifest (`.env.example`)

```bash
# Database
DATABASE_URL=postgres://localhost/pacearena_dev

# Rails
RAILS_MASTER_KEY=...  # in config/master.key, never commit

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=pacearena-products
R2_PUBLIC_URL=https://media.yourdomain.com

# Apify (Temu scraping)
APIFY_API_TOKEN=
APIFY_TEMU_ACTOR_ID=piotrv1001~temu-listings-scraper

# Piloterr (alternative)
PILOTERR_API_KEY=

# Anthropic (AI content)
ANTHROPIC_API_KEY=

# Telegram (bot token shared, channel IDs per ChannelAccount)
TELEGRAM_BOT_TOKEN=

# Pinterest
PINTEREST_APP_ID=
PINTEREST_APP_SECRET=
PINTEREST_REDIRECT_URI=https://yourdomain.com/oauth/pinterest/callback

# X / Twitter
X_API_KEY=
X_API_SECRET=
X_CLIENT_ID=
X_CLIENT_SECRET=

# MaxMind GeoIP (download GeoLite2-City.mmdb)
MAXMIND_DB_PATH=db/GeoLite2-City.mmdb

# Sidekiq web UI
SIDEKIQ_USERNAME=admin
SIDEKIQ_PASSWORD=  # generate strong
```

---

## 11. Order of operations for Claude Code

1. `rails new pacearena --database=postgresql --css=tailwind --javascript=importmap --skip-jbuilder`
2. Replace generated `Gemfile` with the one provided, `bundle install`
3. Run the migration in `db_migrate_initial_schema.rb`
4. `bin/rails generate authentication` (Rails 8 native auth) → wire `User.role` enum
5. Build models with associations matching the schema
6. Build the `ProductIngestJob` + manual paste form first — get a product end-to-end into the DB with images on R2
7. Build `Content::AngleGenerator` + `ContentGenerationJob` — verify AI output for one product
8. Build the magic-moment approval UI (Hotwire-heavy: Turbo Frames per platform card, Turbo Streams to update on approve)
9. Build `ShortLink` model + redirect controller — test that clicks log without blocking redirect
10. Build `Telegram::Publisher` + `PostPublishJob` — get one product live on Telegram with a real short link
11. Then: Pinterest (after domain verification), X (after API tier sorted), CSV import, dashboard analytics

Don't build #10 before #1-9 work end to end. The first product successfully posted to Telegram with a tracked click is the proof-of-life moment.

---

## 12. Things to defer until they actually hurt

- Multi-tenancy
- Webhook receivers for platform events (deletions, edits)
- A/B testing of prompts
- TikTok or Instagram automation
- Headless-browser Temu link conversion
- Background re-scrape for price changes
- Email/Slack notifications

These are real concerns, but adding them to V1 means V1 doesn't ship.

---

*End of handoff doc. Pair with PRD.md for context, db_migrate_initial_schema.rb for the schema, Gemfile for deps.*
