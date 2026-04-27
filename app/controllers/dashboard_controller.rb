class DashboardController < ApplicationController
  allow_unauthenticated_access

  def show
    @products = Product.order(updated_at: :desc).limit(6)
    @top_products = Product
      .order(Arel.sql("(metadata->>'earnings')::numeric DESC NULLS LAST"))
      .limit(5)
    @nav_counts = { products: Product.count, calendar: 23, inbox: 15 }

    today = Date.current.in_time_zone
    week_start = today.beginning_of_week
    month_start = today.beginning_of_month

    @kpi_clicks_today = ClickEvent.humans.where(clicked_at: today.all_day).count
    @kpi_clicks_week  = ClickEvent.humans.where(clicked_at: week_start.beginning_of_day..).count
    @kpi_posts_week   = Post.where(published_at: week_start.beginning_of_day..).count

    # Earnings come from Product metadata for now (until real Temu CSV import wired);
    # sum gives a stable demo number that updates as you tweak data.
    @kpi_earnings_mtd = Product.where("(metadata->>'earnings') IS NOT NULL")
      .pluck(Arel.sql("(metadata->>'earnings')::numeric")).sum.to_f

    @today_schedule = Post
      .includes(content_angle: :product, channel_account: {})
      .where("scheduled_at BETWEEN :s AND :e OR published_at BETWEEN :s AND :e",
             s: today.beginning_of_day, e: today.end_of_day)
      .order(:scheduled_at)
      .limit(7)
  end
end
