module AlfiHelper
  PLATFORM_KEYS = { telegram: "tg", pinterest: "pin", x: "x", tiktok: "tt", instagram: "ig" }.freeze
  PLATFORM_NAMES = { "tg" => "Telegram", "pin" => "Pinterest", "x" => "X", "tt" => "TikTok", "ig" => "Instagram" }.freeze

  # <%= platform_pill "tg" %>
  def platform_pill(key, label: nil)
    label ||= PLATFORM_NAMES[key.to_s] || key.to_s
    tag.span(class: "platform #{key}") do
      concat tag.span("", class: "platform-dot")
      concat label
    end
  end

  # <%= status_tag :live %>  → <span class="tag live"><span class="dot"/>Live</span>
  STATUS_TAG_LABELS = {
    live: "Live",
    draft: "Draft",
    queued: "Queued",
    scheduled: "Scheduled",
    flagged: "Hot",
    warn: "Paused",
    failed: "Failed",
    paused: "Paused",
    published: "Live",
    publishing: "Publishing"
  }.freeze

  STATUS_TAG_VARIANT = {
    live: :live,
    published: :live,
    draft: :draft,
    queued: :draft,
    scheduled: :scheduled,
    publishing: :scheduled,
    flagged: :flagged,
    paused: :warn,
    failed: :warn,
    warn: :warn
  }.freeze

  def status_tag(key, label: nil)
    variant = STATUS_TAG_VARIANT.fetch(key.to_sym, :draft)
    label ||= STATUS_TAG_LABELS[key.to_sym] || key.to_s.titleize
    tag.span(class: "tag #{variant}") do
      concat(tag.span("", class: "dot")) if variant == :live
      concat label
    end
  end

  # Score bar: 60px wide, color depends on score.
  def score_bar(score)
    bucket = score >= 85 ? "s-hi" : score >= 70 ? "s-mid" : "s-lo"
    capped = [ [ score, 0 ].max, 100 ].min
    content_tag(:div, class: "row", style: "gap:6px;justify-content:flex-end") do
      concat content_tag(:div, content_tag(:span, "", style: "width:#{capped}%"), class: "score-bar #{bucket}")
      concat content_tag(:span, score, class: "mono", style: "font-size:11px;color:var(--ink);min-width:22px;text-align:right")
    end
  end

  # Inline SVG sparkline. data: array of numbers.
  def sparkline(data, color: "var(--ink-3)", width: 140, height: 36)
    return "".html_safe if data.blank?

    max = data.max
    min = data.min
    range = (max - min).nonzero? || 1.0
    n = data.length
    points = data.each_with_index.map { |v, i|
      x = (i.to_f / (n - 1)) * width
      y = height - ((v - min).to_f / range) * height
      "#{x.round(1)},#{y.round(1)}"
    }.join(" ")

    tag.svg(width: width, height: height, style: "display:block") do
      tag.polyline(nil, points: points, fill: "none", stroke: color, "stroke-width": 1.5, "stroke-linecap": "round", "stroke-linejoin": "round")
    end
  end

  # Format USD with optional cents — money formatter for KPIs / stats.
  def usd(amount, cents: true)
    if cents
      "$%.2f" % amount.to_f
    else
      "$#{amount.to_i.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse}"
    end
  end

  # Mono number with thousand separators
  def mono_n(value)
    value.is_a?(Numeric) ? value.to_i.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse : value.to_s
  end
end
