module Apify
  # Drop-in replacement for TemuScraper when no APIFY_API_TOKEN is set.
  # Returns deterministic fake-but-plausible product data based on the URL.
  class TemuStub
    def fetch_product(url:)
      seed = url.to_s.split("/").last.presence || SecureRandom.hex(4)
      titles = [
        "Magnetic Cable Organizer (6-pack, silicone)",
        "Foldable Travel Hairdryer 1200W",
        "LED Strip Lights, RGB, 32ft, app-controlled",
        "Stainless Steel Garlic Press",
        "Self-Stirring Mug, USB rechargeable",
        "Mini Portable Bluetooth Speaker, 5W",
        "Adjustable Laptop Stand, aluminum, foldable"
      ]
      idx = seed.bytes.sum % titles.length
      title = titles[idx]
      cents = [ 497, 1249, 899, 329, 679, 949, 1499 ][idx]

      {
        title: title,
        description: "Mock product description for development. The real Apify scraper will populate from Temu directly.",
        price_cents: cents,
        currency: "USD",
        images: [ "https://picsum.photos/seed/#{seed}/600/600" ],
        category: "home"
      }
    end
  end
end
