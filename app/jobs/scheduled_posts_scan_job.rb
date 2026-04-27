class ScheduledPostsScanJob < ApplicationJob
  queue_as :default

  # Runs on a recurring schedule (config/recurring.yml). Finds posts whose
  # scheduled_at has passed and enqueues PostPublishJob for each.
  # Idempotent — PostPublishJob short-circuits if the post is already published.
  def perform
    due = Post.where(status: :scheduled).where("scheduled_at <= ?", Time.current)
    due.find_each do |post|
      PostPublishJob.perform_later(post.id)
    end
    Rails.logger.info("[ScheduledPostsScanJob] enqueued #{due.size} posts")
  end
end
