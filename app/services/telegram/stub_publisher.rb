module Telegram
  # Pretends to publish to Telegram. Useful in development before TELEGRAM_BOT_TOKEN
  # is set. Returns a fake-but-realistic response so the rest of the flow runs.
  class StubPublisher
    def initialize(channel_account)
      @channel = channel_account
    end

    def publish_with_image(image_url:, caption:)
      Rails.logger.info("[Telegram stub] publishing to #{@channel.handle}: #{caption.to_s.first(80)}…")
      message_id = rand(1000..99999)
      handle = @channel.handle.to_s.delete_prefix("@").presence || "alfifinds"
      { message_id: message_id, url: "https://t.me/#{handle}/#{message_id}" }
    end
  end
end
