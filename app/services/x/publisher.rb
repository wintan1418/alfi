module X
  # Skeleton — X API v2 Basic tier ($200/mo). Posting a tweet uses OAuth 2.0 user
  # context; media upload still uses OAuth 1.0a (X API quirk). Wire when the user
  # signs up — this is intentionally not implemented yet.
  class Publisher
    def initialize(channel_account)
      @channel = channel_account
    end

    def post_tweet(text:, image_urls: [])
      raise NotImplementedError, "X API integration deferred — Basic tier costs $200/mo"
    end
  end

  class StubPublisher
    def initialize(channel_account)
      @channel = channel_account
    end

    def post_tweet(text:, image_urls: [])
      tweet_id = rand(10**18)
      handle = @channel.handle.to_s.delete_prefix("@").presence || "alfifinds"
      { tweet_id: tweet_id, url: "https://x.com/#{handle}/status/#{tweet_id}" }
    end
  end
end
