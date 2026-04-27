class LogClickJob < ApplicationJob
  queue_as :clicks

  # Records a click on a short link asynchronously so the redirect itself stays
  # fast (<50ms target). Bots and link-preview crawlers are recorded with
  # is_bot=true and don't count toward click_count.
  def perform(short_link_id:, ip:, ua:, referrer:, clicked_at:)
    link = ShortLink.find(short_link_id)
    is_bot = ClickLogging::BotFilter.preview_or_bot?(ua)
    parser = DeviceDetector.new(ua.to_s)

    # MaxMind lookup — Geocoder returns [] if the DB file is missing,
    # so this gracefully falls back to nil values.
    geo = (Geocoder.search(ip).first rescue nil)

    link.click_events.create!(
      ip: ip,
      country: geo&.country_code,
      city:    geo&.city,
      ua:      ua,
      device_type: parser.device_type || (is_bot ? "bot" : "unknown"),
      referrer: referrer,
      is_bot:   is_bot,
      clicked_at: clicked_at
    )

    return if is_bot

    link.with_lock do
      link.update_columns(
        click_count: link.click_count + 1,
        last_clicked_at: clicked_at
      )
    end
  end
end
