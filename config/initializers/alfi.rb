module Alfi
  # Whether to use the live API for a given integration. Each integration has
  # its own env-key gate so you can mix-and-match (e.g. real Anthropic + stubbed
  # Telegram while you wait for a bot token).
  module Live
    def self.anthropic? = ENV["ANTHROPIC_API_KEY"].present?
    def self.apify?     = ENV["APIFY_API_TOKEN"].present?
    def self.telegram?  = ENV["TELEGRAM_BOT_TOKEN"].present?
    def self.pinterest? = ENV["PINTEREST_APP_ID"].present? && ENV["PINTEREST_APP_SECRET"].present?
    def self.x?         = ENV["X_CLIENT_ID"].present? && ENV["X_CLIENT_SECRET"].present?
    def self.r2?        = %w[R2_ACCOUNT_ID R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY R2_BUCKET].all? { |k| ENV[k].present? }
  end

  # Defaults for outbound short-link host
  def self.short_link_host
    ENV.fetch("SHORT_LINK_HOST", "http://localhost:3000")
  end
end
