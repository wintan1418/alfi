module Pinterest
  class StubPublisher
    def initialize(channel_account)
      @channel = channel_account
    end

    def create_pin(image_url:, title:, description:, link:, board_id: nil)
      Rails.logger.info("[Pinterest stub] pinning: #{title}")
      pin_id = "stub#{rand(10**8)}"
      { pin_id: pin_id, url: "https://www.pinterest.com/pin/#{pin_id}" }
    end
  end
end
