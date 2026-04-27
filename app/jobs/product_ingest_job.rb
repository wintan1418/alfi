require "open-uri"

class ProductIngestJob < ApplicationJob
  queue_as :default

  # Step 1 of the pipeline: scrape Temu, hydrate the Product, attach images,
  # then fan out one ContentGenerationJob per active platform.
  def perform(product_id)
    product = Product.find(product_id)

    scraper = Alfi::Live.apify? ? Apify::TemuScraper.new : Apify::TemuStub.new
    data = scraper.fetch_product(url: product.source_url)

    product.update!(
      title: data[:title].presence || product.title,
      description: data[:description].presence || product.description,
      price_cents: data[:price_cents] || product.price_cents,
      currency: data[:currency] || product.currency || "USD",
      category: data[:category] || product.category,
      metadata: product.metadata.merge(
        "image_url" => Array(data[:images]).first || product.metadata&.dig("image_url"),
        "ingested_at" => Time.current.iso8601
      )
    )

    # Re-host images locally (Active Storage). When R2 is configured the
    # underlying service is :cloudflare automatically.
    Array(data[:images]).first(6).each_with_index do |url, idx|
      attach_remote_image(product: product, url: url, position: idx)
    end

    # Fan out per-platform angle generation
    %i[telegram pinterest x tiktok instagram].each do |platform|
      ContentGenerationJob.perform_later(product.id, platform.to_s)
    end
  rescue => e
    Rails.logger.error("[ProductIngestJob] #{product_id}: #{e.class} #{e.message}")
    raise
  end

  private

  def attach_remote_image(product:, url:, position:)
    return if url.blank?
    image = product.product_images.find_or_initialize_by(position: position)
    image.original_url = url
    image.metadata = (image.metadata || {}).merge("source" => "ingest")
    image.save!

    # Best-effort: download + attach. Skip silently if the URL is unreachable
    # so a flaky CDN doesn't fail the whole ingest.
    file = URI.parse(url).open(read_timeout: 10)
    image.file.attach(io: file, filename: "image-#{position}.jpg", content_type: "image/jpeg")
  rescue => e
    Rails.logger.warn("[ProductIngestJob] image fetch failed for #{url}: #{e.message}")
  end
end
