class CalendarController < ApplicationController
  allow_unauthenticated_access

  HOURS = [ 8, 10, 12, 14, 16, 18, 20 ].freeze

  def show
    # Backwards compat: ?week=<date> still routes to the week view
    legacy_week = params[:week].presence
    @view = (params[:view].presence || (legacy_week ? "week" : "week"))
    @view = "week" unless %w[week month].include?(@view)

    anchor = parse_date(legacy_week || params[:date]) || Date.current

    if @view == "month"
      build_month(anchor)
    else
      build_week(anchor)
    end

    @nav_counts = { products: Product.count, calendar: @scheduled_count, inbox: 15 }
  end

  private

  def parse_date(value)
    Date.parse(value) if value.present?
  rescue Date::Error
    nil
  end

  def build_week(anchor)
    @week_start  = anchor.beginning_of_week
    @week_end    = @week_start + 6.days
    @prev_link   = calendar_path(view: "week", date: (@week_start - 7.days).iso8601)
    @next_link   = calendar_path(view: "week", date: (@week_start + 7.days).iso8601)
    @today_link  = calendar_path(view: "week")

    range = @week_start.in_time_zone.beginning_of_day..@week_end.in_time_zone.end_of_day
    posts = posts_in(range)

    @grid = Array.new(7) { Array.new(HOURS.size) { [] } }
    posts.each do |post|
      time = post.published_at || post.scheduled_at
      next unless time
      zoned = time.in_time_zone
      day_idx = (zoned.to_date - @week_start).to_i
      next unless (0..6).cover?(day_idx)
      hour_idx = ((zoned.hour - HOURS.first) / 2).clamp(0, HOURS.size - 1)
      @grid[day_idx][hour_idx] << post
    end

    @scheduled_count = posts.size
    @range_label = "Week of #{@week_start.strftime('%b %-d')} — #{@week_end.strftime('%b %-d')}"
  end

  def build_month(anchor)
    @month_start = anchor.beginning_of_month
    @month_end   = @month_start.end_of_month
    @grid_start  = @month_start.beginning_of_week
    @grid_end    = @month_end.end_of_week

    @prev_link  = calendar_path(view: "month", date: (@month_start - 1.month).iso8601)
    @next_link  = calendar_path(view: "month", date: (@month_start + 1.month).iso8601)
    @today_link = calendar_path(view: "month")

    range = @grid_start.in_time_zone.beginning_of_day..@grid_end.in_time_zone.end_of_day
    posts = posts_in(range)

    @month_grid = posts.group_by { |p| (p.published_at || p.scheduled_at).in_time_zone.to_date }
    @scheduled_count = posts.size
    @range_label = @month_start.strftime("%B %Y")
  end

  def posts_in(range)
    Post
      .includes(content_angle: :product, channel_account: {})
      .where(<<~SQL.squish, s: range.first, e: range.last)
        scheduled_at BETWEEN :s AND :e OR published_at BETWEEN :s AND :e
      SQL
      .order(:scheduled_at)
  end
end
