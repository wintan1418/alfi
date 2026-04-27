# Seeds the alfi sample dataset — mirrors design_handoff_alfi/data.jsx so the
# UI looks alive without depending on real Temu/Anthropic calls.

owner_email = "juwonoluwadare0@gmail.com"
owner = User.find_or_create_by!(email_address: owner_email) do |u|
  u.password = "alfidev"
end
puts "✓ owner: #{owner.email_address}"

products_data = [
  { lid: "P-2841", title: "Magnetic Cable Organizer (6-pack, silicone)",
    price: 497, margin: 142, status: :live, score: 94, flagged: true,
    clicks: 1284, earnings: 38.21, posts: 9, angles: 15,
    discovered: "2026-04-22", note: "Top performer — Pinterest carrying it",
    img_seed: "cable-organizer" },
  { lid: "P-2840", title: "Foldable Travel Hairdryer 1200W",
    price: 1249, margin: 350, status: :live, score: 88,
    clicks: 612, earnings: 18.20, posts: 6, angles: 12,
    discovered: "2026-04-21", img_seed: "hairdryer-tech" },
  { lid: "P-2839", title: "LED Strip Lights, RGB, 32ft, app-controlled",
    price: 899, margin: 210, status: :queued, score: 76,
    clicks: 0, earnings: 0, posts: 0, angles: 15,
    discovered: "2026-04-21", img_seed: "rgb-led-strip" },
  { lid: "P-2838", title: "Stainless Steel Garlic Press",
    price: 329, margin: 94, status: :scheduled, score: 71,
    clicks: 84, earnings: 2.80, posts: 3, angles: 12,
    discovered: "2026-04-20", img_seed: "garlic-press-kitchen" },
  { lid: "P-2837", title: "Self-Stirring Mug, USB rechargeable",
    price: 679, margin: 185, status: :live, score: 82,
    clicks: 491, earnings: 14.10, posts: 5, angles: 12,
    discovered: "2026-04-19", img_seed: "self-stir-mug" },
  { lid: "P-2836", title: "Mini Portable Bluetooth Speaker, 5W",
    price: 949, margin: 240, status: :live, score: 79,
    clicks: 308, earnings: 9.60, posts: 4, angles: 12,
    discovered: "2026-04-18", img_seed: "bluetooth-speaker" },
  { lid: "P-2835", title: "Adjustable Laptop Stand, aluminum, foldable",
    price: 1499, margin: 420, status: :live, score: 90, flagged: true,
    clicks: 887, earnings: 31.42, posts: 7, angles: 15,
    discovered: "2026-04-17", img_seed: "laptop-stand-desk" },
  { lid: "P-2834", title: "Pet Hair Remover Roller, reusable",
    price: 549, margin: 150, status: :paused, score: 64,
    clicks: 142, earnings: 4.50, posts: 4, angles: 12,
    discovered: "2026-04-16", note: "Low CTR on Pinterest, paused",
    img_seed: "pet-hair-roller" },
  { lid: "P-2833", title: "Silicone Stretch Lids (12-pack)",
    price: 419, margin: 110, status: :live, score: 85,
    clicks: 521, earnings: 14.80, posts: 6, angles: 12,
    discovered: "2026-04-15", img_seed: "silicone-lids-kitchen" },
  { lid: "P-2832", title: "Wireless Earbuds, Bluetooth 5.3",
    price: 1199, margin: 310, status: :live, score: 81,
    clicks: 405, earnings: 12.40, posts: 5, angles: 12,
    discovered: "2026-04-14", img_seed: "wireless-earbuds" },
  { lid: "P-2831", title: "Reusable Cotton Rounds (16-pack, washable)",
    price: 379, margin: 90, status: :live, score: 73,
    clicks: 198, earnings: 5.80, posts: 4, angles: 12,
    discovered: "2026-04-13", img_seed: "cotton-rounds-bath" },
  { lid: "P-2830", title: "Car Phone Holder, vent mount, magnetic",
    price: 599, margin: 160, status: :live, score: 77,
    clicks: 264, earnings: 7.90, posts: 5, angles: 12,
    discovered: "2026-04-12", img_seed: "phone-car-mount" }
]

products_data.each do |p|
  Product.find_or_initialize_by(source_url: "https://www.temu.com/affiliate/#{p[:lid].downcase}").tap do |product|
    product.title = p[:title]
    product.affiliate_url = "https://temu.com/affiliate/#{p[:lid].downcase}?aff=alfi"
    product.price_cents = p[:price]
    product.currency = "USD"
    product.status = p[:status]
    product.metadata = {
      "legacy_id" => p[:lid],
      "image_url" => "https://picsum.photos/seed/#{p[:img_seed]}/600/600",
      "margin_cents" => p[:margin],
      "score" => p[:score],
      "flagged" => p[:flagged] == true,
      "clicks" => p[:clicks],
      "earnings" => p[:earnings],
      "posts" => p[:posts],
      "angles" => p[:angles],
      "discovered" => p[:discovered],
      "note" => p[:note]
    }
    product.save!
  end
end
puts "✓ products: #{Product.count}"

# Channel accounts (sidebar status)
channels_data = [
  { platform: :telegram,  handle: "@alfifinds", display_name: "Alfi Finds" },
  { platform: :pinterest, handle: "alfifinds",  display_name: "alfi · Pinterest" },
  { platform: :x,         handle: "@alfifinds", display_name: "alfi finds" },
  { platform: :tiktok,    handle: "@alfifinds", display_name: "alfi · TikTok" },
  { platform: :instagram, handle: "alfifinds",  display_name: "alfi · Instagram" }
]

channels_data.each do |c|
  ChannelAccount.find_or_create_by!(platform: c[:platform], handle: c[:handle]) do |ca|
    ca.display_name = c[:display_name]
    ca.active = true
  end
end
puts "✓ channels: #{ChannelAccount.count}"

# A few short links for the /links page
hero = Product.where("metadata->>'legacy_id' = ?", "P-2841").first
if hero
  ShortLink.find_or_create_by!(slug: "p2841pin") do |s|
    s.destination_url = hero.affiliate_url
    s.linkable = hero
    s.click_count = 612
    s.last_clicked_at = 2.minutes.ago
  end
  ShortLink.find_or_create_by!(slug: "p2841tg") do |s|
    s.destination_url = hero.affiliate_url
    s.linkable = hero
    s.click_count = 312
    s.last_clicked_at = 5.minutes.ago
  end
end
puts "✓ short_links: #{ShortLink.count}"

# ContentAngles for the hero product — verbatim from design_handoff_alfi/data.jsx
# so the product detail page shows the design's intended copy.
hero_angles = {
  telegram: {
    practical: { hook: nil, body: "Six magnetic cable holders. Stick them on the back of your desk, your nightstand, the side of your monitor — wherever cables go to die. Each one snaps shut around the cable so it doesn't slip out when you reach for it.\n\n→ Charging cable, headphone cable, USB-C, all of it. Reusable adhesive, takes thirty seconds to install.\n\n$4.97 • free shipping", cta: "Get the 6-pack", hashtags: [], status: :draft },
    premium:   { hook: nil, body: "Your desk deserves better than a tangled drawer of charging cables.\n\nThis 6-pack of magnetic silicone holders gives every cable a home — clean lines, no clutter, ready when you need them.\n\nA small upgrade that makes the rest of your setup feel intentional.", cta: "Tidy your space", hashtags: [], status: :draft },
    witty:     { hook: nil, body: "POV: you finally figured out where your charger went.\n\n6 magnetic clips. Stick 'em anywhere. Cables stay put. The end.\n\nNo more 4am phone-light cable hunts. You're welcome.\n\n$4.97 → link below ↓", cta: "Save me from cable jail", hashtags: [], status: :approved }
  },
  pinterest: {
    practical: { hook: "6 cable holders that actually stay stuck", body: "Magnetic cable organizers — 6-pack for under $5. Reusable adhesive, fits any cable size, hides behind the desk so you don't see them.", cta: "Shop the 6-pack", hashtags: %w[cablemanagement deskorganization homeoffice organize], status: :approved },
    premium:   { hook: "Desk organization done right",            body: "The desk setup detail you didn't know you needed. Magnetic silicone cable keepers — clean, hidden, reusable.", cta: "See the set", hashtags: %w[deskaesthetic minimalsetup wfhideas cleanspaces], status: :draft },
    witty:     { hook: "Where do cables go when they die?",       body: "Cables disappearing under your desk? Same. These magnetic clips fix that for $4.97.", cta: "Catch them all", hashtags: %w[lifehack organizationhack amazonfinds temufinds], status: :draft }
  },
  x: {
    practical: { hook: nil, body: "6 magnetic cable holders for $4.97.\n\nStick them anywhere, cables snap in place, reusable adhesive. That's it, that's the post.", cta: "Link", hashtags: [], status: :approved },
    premium:   { hook: nil, body: "Subtle desk upgrade I keep recommending: magnetic silicone cable keepers. 6-pack, under $5, makes everything look intentional.", cta: "Get them", hashtags: [], status: :draft },
    witty:     { hook: nil, body: "me: i need to declutter my desk\nalso me: spends 4 hours googling cable management\n\nfound the answer. it's $4.97. moving on with my life.", cta: "↓", hashtags: [], status: :draft }
  },
  tiktok: {
    practical: { hook: nil, body: "[Hook 0-3s] Show the cable mess.\n[Beat 3-8s] Apply one clip behind the monitor, snap a cable in.\n[Beat 8-15s] Repeat with all six. Time-lapse.\n[Outro 15-20s] Final clean shot. Voiceover: '6 of these for $4.97. Link in bio.'", cta: "Script + assets ready", hashtags: %w[temufinds organizationtips deskmakeover], status: :approved },
    premium:   { hook: nil, body: "[Premium variant — generated]", cta: "", hashtags: [], status: :draft },
    witty:     { hook: nil, body: "[Witty variant — generated]",   cta: "", hashtags: [], status: :draft }
  },
  instagram: {
    practical: { hook: nil, body: "Cable organization, finally solved. 6 magnetic holders, $4.97. Link in bio.", cta: "Link in bio", hashtags: %w[temufinds organization deskhacks], status: :approved },
    premium:   { hook: nil, body: "[Premium variant]", cta: "", hashtags: [], status: :draft },
    witty:     { hook: nil, body: "[Witty variant]",   cta: "", hashtags: [], status: :draft }
  }
}

if hero
  hero_angles.each do |platform, tones|
    tones.each do |tone, attrs|
      ContentAngle.find_or_initialize_by(product: hero, platform: platform, tone: tone).tap do |a|
        a.hook = attrs[:hook]
        a.body = attrs[:body]
        a.cta = attrs[:cta]
        a.hashtags = attrs[:hashtags]
        a.status = attrs[:status]
        a.generated_by = "design-fixture:v1"
        a.save!
      end
    end
  end
end
puts "✓ content_angles (hero): #{ContentAngle.where(product: hero).count}"

# Stub-generate angles for two more visible products via AngleStub so the
# review queue has variety beyond the hero.
[ "P-2840", "P-2837" ].each do |lid|
  prod = Product.where("metadata->>'legacy_id' = ?", lid).first
  next unless prod
  next if ContentAngle.where(product: prod).exists?
  %i[telegram pinterest x].each do |platform|
    Content::AngleStub.new(prod).generate(platform: platform)
  end
end
puts "✓ content_angles (total): #{ContentAngle.count}"

# Seed scheduled Posts across this week so the calendar isn't empty.
# Mixes :published (already published, today's morning) with :scheduled (later today + this week).
channel_for = ChannelAccount.all.index_by { |ca| ca.platform.to_s }
schedule_plan = []

# Hero — 5 approved angles → 5 posts, varied through the week
if hero
  hero.content_angles.where(status: :approved).each_with_index do |angle, idx|
    day_offset = [ 0, 0, 1, 2, 4 ][idx] || idx
    hour = [ 9, 10, 11, 14, 18 ][idx] || (8 + idx * 2)
    is_today = day_offset.zero? && hour <= Time.current.in_time_zone.hour + 1
    schedule_plan << {
      angle: angle,
      day_offset: day_offset,
      hour: hour,
      status: is_today ? :published : :scheduled
    }
  end
end

# A few more posts from other products with angles, just for visual density.
Product.where.not(id: hero&.id).each do |product|
  product.content_angles.limit(2).each_with_index do |angle, idx|
    schedule_plan << {
      angle: angle,
      day_offset: rand(0..6),
      hour: [ 9, 12, 15, 18, 20 ].sample,
      status: [ :scheduled, :scheduled, :published ].sample
    }
  end
end

today = Date.current.in_time_zone.beginning_of_week
schedule_plan.each do |plan|
  angle = plan[:angle]
  channel = channel_for[angle.platform.to_s]
  next unless channel

  scheduled_at = (today + plan[:day_offset].days).change(hour: plan[:hour])
  dedupe = "seed-#{angle.id}-#{plan[:day_offset]}-#{plan[:hour]}"

  Post.find_or_create_by!(dedupe_key: dedupe) do |p|
    p.content_angle = angle
    p.channel_account = channel
    p.status = plan[:status]
    p.scheduled_at = scheduled_at
    p.published_at = scheduled_at if plan[:status] == :published
    p.external_url = plan[:status] == :published ? "https://t.me/alfifinds/#{rand(1000..9999)}" : nil
  end
end
puts "✓ posts: #{Post.count}"

# Seed a small set of ClickEvents so dashboard KPIs aren't all zeroes.
if hero && ShortLink.where(linkable: hero).any?
  link = ShortLink.where(linkable: hero).first
  countries = %w[US CA UK DE FR AU NG BR JP IN]
  20.times do |i|
    minutes_ago = i * 4
    link.click_events.find_or_create_by!(clicked_at: minutes_ago.minutes.ago.beginning_of_minute) do |c|
      c.ip = "203.0.113.#{rand(1..254)}"
      c.country = countries.sample
      c.ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15"
      c.device_type = %w[desktop smartphone tablet].sample
      c.referrer = nil
      c.is_bot = false
    end
  end
  link.update_columns(click_count: link.click_events.humans.count, last_clicked_at: link.click_events.maximum(:clicked_at))
end
puts "✓ click_events: #{ClickEvent.count}"

puts "\nSample data ready."
puts "Login at /session/new with email: #{owner.email_address}, password: alfidev"
