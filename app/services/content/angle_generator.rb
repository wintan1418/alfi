require "anthropic"

module Content
  # Generates 3-tone × 1-platform copy via Claude. Call once per platform per
  # product (5 platforms = 5 API calls; ~$0.026/platform on Sonnet 4.6).
  #
  # Persists 3 ContentAngle records (one per tone) on success.
  # Falls back to AngleStub when ANTHROPIC_API_KEY is missing.
  class AngleGenerator
    PROMPT_VERSION = "v1".freeze
    MODEL = "claude-sonnet-4-6".freeze

    PLATFORM_RULES = {
      telegram:  "80–180 words. Line breaks for scannability. One emoji max (→ ↓ 🔗) only if it adds info. End with $price + tracked link.",
      pinterest: "Lead with a 4–8 word visual hook (this becomes pin overlay). 2–3 sentences. 4–6 lowercase hashtags. Never expose raw temu URL.",
      x:         "220 chars max. 1–3 short lines. No hashtags. Personality > information.",
      tiktok:    "Script with timestamps. Hook in first 3s. 15-30s total runtime.",
      instagram: "Caption max 2200 chars. 5–15 hashtags. End with 'link in bio'."
    }.freeze

    TONE_GUIDES = {
      practical: "Plainspoken. Use-case first. The 'this just works' angle. Lead with what the product does.",
      premium:   "Aspirational. Lifestyle. The 'you deserve it' angle. Avoid being preachy.",
      witty:     "Punchy. Conversational. The 'stop scrolling' angle. Self-aware. Lowercase OK."
    }.freeze

    def initialize(product, client: nil)
      @product = product
      @client = client || ::Anthropic::Client.new(access_token: ENV.fetch("ANTHROPIC_API_KEY"))
    end

    # Generates 3 tones for one platform. Returns an array of 3 saved ContentAngle records.
    def generate(platform:)
      response = @client.messages(
        parameters: {
          model: MODEL,
          max_tokens: 2000,
          system: system_prompt(platform: platform),
          messages: [ { role: "user", content: user_prompt(platform: platform) } ]
        }
      )

      json = parse_strict_json(response.dig("content", 0, "text"))
      persist(platform: platform, json: json)
    end

    private

    def system_prompt(platform:)
      <<~PROMPT
        You write affiliate marketing posts for Temu products on #{platform}.

        Platform rules: #{PLATFORM_RULES[platform.to_sym]}

        You always produce three variants in different tones:
        - practical: #{TONE_GUIDES[:practical]}
        - premium:   #{TONE_GUIDES[:premium]}
        - witty:     #{TONE_GUIDES[:witty]}

        Output STRICT JSON only, no preamble:
        {
          "practical": { "hook": "...", "body": "...", "hashtags": ["..."], "cta": "..." },
          "premium":   { "hook": "...", "body": "...", "hashtags": ["..."], "cta": "..." },
          "witty":     { "hook": "...", "body": "...", "hashtags": ["..."], "cta": "..." }
        }

        - hook: max 80 chars
        - body: full post text within platform limits
        - hashtags: array of strings without # prefix
        - cta: short call-to-action

        Audience is Nigeria-primary. Use Naira pricing alongside USD where relevant.
        Never use the word "amazing". Never stuff emojis.
      PROMPT
    end

    def user_prompt(platform:)
      <<~PROMPT
        Product: #{@product.title}
        Price: #{@product.formatted_price}
        Description: #{@product.description.to_s.first(500)}
        Category: #{@product.category}

        Generate the three tones for #{platform} now.
      PROMPT
    end

    def parse_strict_json(text)
      JSON.parse(text.to_s.strip)
    rescue JSON::ParserError
      # Strip code fences if Claude added any
      cleaned = text.to_s.gsub(/\A```(?:json)?\s*/, "").gsub(/```\s*\z/, "")
      JSON.parse(cleaned)
    end

    def persist(platform:, json:)
      tones = %w[practical premium witty]
      tones.map do |tone|
        data = json.fetch(tone, {})
        ContentAngle.create!(
          product: @product,
          platform: platform,
          tone: tone,
          hook: data["hook"],
          body: data["body"],
          hashtags: Array(data["hashtags"]),
          cta: data["cta"],
          generated_by: "#{MODEL}:#{PROMPT_VERSION}",
          status: :draft
        )
      end
    end
  end
end
