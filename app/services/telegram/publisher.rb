require "telegram/bot"

module Telegram
  # Publishes a post to a Telegram channel. Returns { message_id:, url: }
  # or raises PublishFailed.
  class Publisher
    class PublishFailed < StandardError; end

    def initialize(channel_account)
      @channel = channel_account
      @creds = channel_account.decrypted_credentials
    end

    def publish_with_image(image_url:, caption:)
      response = client.send_photo(
        chat_id: @creds.fetch("chat_id"),
        photo: image_url,
        caption: caption.to_s.first(1024),
        parse_mode: "Markdown"
      )

      message_id = response.dig("result", "message_id")
      raise PublishFailed, response.to_s unless message_id

      { message_id: message_id, url: telegram_url(@channel.handle, message_id) }
    end

    private

    def client
      @client ||= ::Telegram::Bot::Api.new(@creds.fetch("bot_token") { ENV.fetch("TELEGRAM_BOT_TOKEN") })
    end

    def telegram_url(handle, message_id)
      h = handle.to_s.delete_prefix("@")
      "https://t.me/#{h}/#{message_id}"
    end
  end
end
