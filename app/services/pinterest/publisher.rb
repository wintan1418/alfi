require "faraday"

module Pinterest
  # Publishes a pin via Pinterest API v5. Requires per-account access_token in
  # ChannelAccount.credentials_blob (set up via OAuth flow — TODO).
  class Publisher
    BASE_URL = "https://api.pinterest.com/v5".freeze

    class PublishFailed     < StandardError; end
    class TokenRefreshFailed< StandardError; end

    def initialize(channel_account)
      @channel = channel_account
      @creds = channel_account.decrypted_credentials
    end

    def create_pin(image_url:, title:, description:, link:, board_id: nil)
      ensure_fresh_token!
      payload = {
        board_id:    board_id || @creds["board_id"],
        title:       title.to_s.first(100),
        description: description.to_s.first(500),
        link:        link,
        media_source: { source_type: "image_url", url: image_url }
      }

      response = http.post("/pins", payload.to_json,
                           "Authorization"  => "Bearer #{@creds['access_token']}",
                           "Content-Type"   => "application/json")
      raise PublishFailed, response.body unless response.success?
      data = JSON.parse(response.body)
      { pin_id: data["id"], url: "https://www.pinterest.com/pin/#{data['id']}" }
    end

    private

    def http
      @http ||= Faraday.new(url: BASE_URL) { |f| f.options.timeout = 30 }
    end

    def ensure_fresh_token!
      return if @creds["expires_at"] && Time.parse(@creds["expires_at"]) > 5.minutes.from_now
      refresh_token!
    end

    def refresh_token!
      basic = Base64.strict_encode64("#{ENV.fetch('PINTEREST_APP_ID')}:#{ENV.fetch('PINTEREST_APP_SECRET')}")
      response = http.post("/oauth/token",
                            URI.encode_www_form(grant_type: "refresh_token", refresh_token: @creds["refresh_token"]),
                            "Authorization" => "Basic #{basic}",
                            "Content-Type"  => "application/x-www-form-urlencoded")
      raise TokenRefreshFailed, response.body unless response.success?
      data = JSON.parse(response.body)
      @channel.update_credentials!(
        access_token:  data["access_token"],
        refresh_token: data["refresh_token"] || @creds["refresh_token"],
        expires_at:    (Time.current + data["expires_in"].to_i.seconds).iso8601
      )
      @creds = @channel.decrypted_credentials
    end
  end
end
