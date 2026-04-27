class ClickRollupJob < ApplicationJob
  queue_as :default

  # Daily aggregation. Reconciles ShortLink#click_count against actual
  # ClickEvent.humans count — protects against drift if Solid Queue ever
  # missed an increment. Cheap, runs nightly.
  def perform
    ShortLink.find_each do |link|
      truth = link.click_events.humans.count
      next if truth == link.click_count
      link.update_columns(click_count: truth)
    end

    # Trim very old click events (older than 18 months) to keep the table light.
    cutoff = 18.months.ago
    deleted = ClickEvent.where("clicked_at < ?", cutoff).delete_all
    Rails.logger.info("[ClickRollupJob] reconciled clicks · pruned #{deleted} stale events")
  end
end
