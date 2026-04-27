class PostPublishJob < ApplicationJob
  # Per-platform queues so we can rate-limit each independently
  queue_as ->(*args) {
    post_id = args.first
    Post.find(post_id).platform.to_s.to_sym
  }

  # Step 3 of the pipeline: take an approved ContentAngle + ChannelAccount,
  # generate a tracked short link, post to the platform, persist the result.
  # Idempotent via Post#dedupe_key.
  def perform(post_id)
    post = Post.find(post_id)
    angle = post.content_angle
    channel = post.channel_account

    return if post.published? # idempotency

    # Generate a short link if missing
    if post.short_link.blank?
      link = ShortLink.create!(
        destination_url: angle.product.affiliate_url || angle.product.source_url,
        linkable: post
      )
      post.update!(short_link: link)
    end

    publisher = build_publisher(channel)

    caption = build_caption(angle: angle, link: post.short_link)
    image_url = angle.product.display_image_url

    case channel.platform.to_sym
    when :telegram
      result = publisher.publish_with_image(image_url: image_url, caption: caption)
      post.update!(
        status: :published,
        published_at: Time.current,
        external_id: result[:message_id].to_s,
        external_url: result[:url]
      )
    when :pinterest
      result = publisher.create_pin(
        image_url: image_url,
        title: angle.hook.presence || angle.product.title,
        description: angle.body.to_s.first(500),
        link: post.short_link.public_url
      )
      post.update!(
        status: :published,
        published_at: Time.current,
        external_id: result[:pin_id].to_s,
        external_url: result[:url]
      )
    when :x
      result = publisher.post_tweet(text: caption, image_urls: [ image_url ])
      post.update!(
        status: :published,
        published_at: Time.current,
        external_id: result[:tweet_id].to_s,
        external_url: result[:url]
      )
    end

    angle.update!(status: :published)
  rescue => e
    post.update(status: :failed, error_message: "#{e.class}: #{e.message}")
    Rails.logger.error("[PostPublishJob] #{post_id}: #{e.class} #{e.message}")
    raise
  end

  private

  def build_publisher(channel)
    case channel.platform.to_sym
    when :telegram
      Alfi::Live.telegram?  ? Telegram::Publisher.new(channel)  : Telegram::StubPublisher.new(channel)
    when :pinterest
      Alfi::Live.pinterest? ? Pinterest::Publisher.new(channel) : Pinterest::StubPublisher.new(channel)
    when :x
      Alfi::Live.x?         ? X::Publisher.new(channel)         : X::StubPublisher.new(channel)
    else
      raise ArgumentError, "no publisher for #{channel.platform}"
    end
  end

  def build_caption(angle:, link:)
    parts = []
    parts << angle.hook if angle.hook.present?
    parts << angle.body
    parts << link.public_url
    parts.compact_blank.join("\n\n")
  end
end
