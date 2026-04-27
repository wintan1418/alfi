module Content
  # Drop-in replacement for AngleGenerator when no ANTHROPIC_API_KEY is set.
  # Returns three ContentAngle records per platform with canned copy that
  # references the actual product title/price.
  class AngleStub
    def initialize(product)
      @product = product
    end

    def generate(platform:)
      tones_for(platform).map do |tone, data|
        ContentAngle.create!(
          product: @product,
          platform: platform,
          tone: tone,
          hook: data[:hook],
          body: data[:body],
          hashtags: data[:hashtags],
          cta: data[:cta],
          generated_by: "stub:v1",
          status: :draft
        )
      end
    end

    private

    def tones_for(platform)
      price = @product.formatted_price || "$5"
      title = @product.title

      case platform.to_sym
      when :telegram
        {
          "practical" => {
            hook: "Here's the deal",
            body: "#{title}.\n\nDoes exactly what it should — no fluff. #{price}, free shipping.\n\n→ Link below",
            hashtags: [], cta: "Get it"
          },
          "premium" => {
            hook: "A small upgrade I keep recommending",
            body: "#{title}.\n\nSubtle, well-made, makes the rest of your setup feel intentional. The kind of buy you forget about until people start asking about it.",
            hashtags: [], cta: "Take a look"
          },
          "witty" => {
            hook: "POV: you finally fixed this",
            body: "#{title}. #{price}. that's it. that's the post.",
            hashtags: [], cta: "↓"
          }
        }
      when :pinterest
        {
          "practical" => {
            hook: "Cheap fix that actually works",
            body: "#{title}. Quick install, instant payoff. #{price}.",
            hashtags: %w[lifehack organize home temufinds], cta: "Shop the find"
          },
          "premium" => {
            hook: "Curated home detail",
            body: "The detail you didn't know you needed. #{title}.",
            hashtags: %w[homeaesthetic minimalist intentionalliving], cta: "See more"
          },
          "witty" => {
            hook: "Wait, where has this been my whole life",
            body: "#{title}. #{price}. We're so back.",
            hashtags: %w[temufinds amazonfinds organizationhack], cta: "Get yours"
          }
        }
      when :x
        {
          "practical" => {
            hook: nil,
            body: "#{title}. #{price}. Does the thing. Link below.",
            hashtags: [], cta: "Link"
          },
          "premium" => {
            hook: nil,
            body: "Quiet upgrade I keep recommending: #{title}. Worth #{price}.",
            hashtags: [], cta: "Get it"
          },
          "witty" => {
            hook: nil,
            body: "me: i don't need this\nalso me: clicks add to cart\n#{title} — #{price}",
            hashtags: [], cta: "↓"
          }
        }
      when :tiktok
        {
          "practical" => {
            hook: nil,
            body: "[Hook 0–3s] Show the problem.\n[Beat 3–8s] Apply the product, show the fix.\n[Beat 8–15s] Time-lapse.\n[Outro 15–20s] Voiceover: '#{price}. Link in bio.'",
            hashtags: %w[temufinds tiktokmademebuyit], cta: "Script ready"
          },
          "premium" => { hook: nil, body: "[Premium variant — generated]", hashtags: [], cta: "" },
          "witty"   => { hook: nil, body: "[Witty variant — generated]",   hashtags: [], cta: "" }
        }
      when :instagram
        {
          "practical" => {
            hook: nil,
            body: "#{title} — solved a real problem for #{price}. Link in bio.",
            hashtags: %w[temufinds organize lifehack home wfh],
            cta: "Link in bio"
          },
          "premium" => { hook: nil, body: "[Premium variant]", hashtags: [], cta: "" },
          "witty"   => { hook: nil, body: "[Witty variant]",   hashtags: [], cta: "" }
        }
      else
        {}
      end
    end
  end
end
