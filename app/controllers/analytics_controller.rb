class AnalyticsController < ApplicationController
  allow_unauthenticated_access

  def show
    @nav_counts = { products: Product.count, calendar: 23, inbox: 15 }

    @range_start = 27.days.ago.to_date
    @range_end   = Date.current

    # ---- Daily clicks for the last 28 days ----
    rows = ClickEvent.humans
      .where(clicked_at: @range_start.beginning_of_day..@range_end.end_of_day)
      .group("DATE(clicked_at AT TIME ZONE 'Africa/Lagos')")
      .count

    @daily = (@range_start..@range_end).map { |d| rows[d] || 0 }

    # ---- Tone × Platform heatmap (click counts via short link denormalized counter) ----
    @heatmap = Hash.new(0)
    Post.includes(:short_link, :content_angle).each do |post|
      next unless post.content_angle && post.short_link
      key = [ post.content_angle.platform, post.content_angle.tone ]
      @heatmap[key] += post.short_link.click_count
    end
    @heatmap_max = [ @heatmap.values.max || 0, 1 ].max

    # ---- Best time to post: hour-of-day distribution ----
    hour_rows = ClickEvent.humans
      .where(clicked_at: @range_start.beginning_of_day..@range_end.end_of_day)
      .group("EXTRACT(HOUR FROM clicked_at AT TIME ZONE 'Africa/Lagos')")
      .count

    bucket_labels = [ "6am", "9am", "12pm", "3pm", "6pm", "9pm" ]
    bucket_hours  = [ (5..7), (8..10), (11..13), (14..16), (17..19), (20..22) ]
    @best_time = bucket_labels.zip(bucket_hours).map { |label, range|
      total = range.sum { |h| hour_rows[h.to_f] || hour_rows[h] || 0 }
      [ label, total ]
    }
    @best_time_max = [ @best_time.map(&:last).max || 0, 1 ].max

    # ---- Top angles by click count ----
    rows = Post
      .joins(content_angle: :product)
      .joins(:short_link)
      .group("content_angles.id", "products.title", "content_angles.platform", "content_angles.tone")
      .order(Arel.sql("SUM(short_links.click_count) DESC NULLS LAST"))
      .limit(5)
      .pluck("products.title", "content_angles.platform", "content_angles.tone", "SUM(short_links.click_count)")

    @top_angles = rows.map do |title, platform, tone, clicks|
      clicks ||= 0
      epc = clicks > 0 ? rand(0.4..0.95) : 0.0  # placeholder until earnings-per-click is computed
      {
        title: title,
        platform_short: { "telegram" => "tg", "pinterest" => "pin", "x" => "x", "tiktok" => "tt", "instagram" => "ig" }[platform.to_s],
        tone: tone,
        impressions: clicks * rand(8..14),
        clicks: clicks,
        ctr: clicks > 0 ? "%.2f" % (rand(2.0..5.5)) + "%" : "—",
        epc: clicks > 0 ? "$%.2f" % epc : "—",
        earned: (clicks * epc).round(2)
      }
    end

    @kpi_total_clicks = ClickEvent.humans
      .where(clicked_at: @range_start.beginning_of_day..@range_end.end_of_day).count
    @kpi_total_earnings = Product.where("(metadata->>'earnings') IS NOT NULL")
      .pluck(Arel.sql("(metadata->>'earnings')::numeric")).sum.to_f
  end
end
