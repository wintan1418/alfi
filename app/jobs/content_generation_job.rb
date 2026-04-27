class ContentGenerationJob < ApplicationJob
  queue_as :default

  # Step 2 of the pipeline: ask Claude (or the stub) for 3 tones for one platform.
  # Idempotent: skips if angles already exist for this product+platform.
  def perform(product_id, platform)
    product = Product.find(product_id)

    if ContentAngle.where(product_id: product_id, platform: platform).exists?
      Rails.logger.info("[ContentGenerationJob] #{product_id}/#{platform} already generated, skipping")
      return
    end

    generator = Alfi::Live.anthropic? ? Content::AngleGenerator.new(product) : Content::AngleStub.new(product)
    angles = generator.generate(platform: platform)

    Rails.logger.info("[ContentGenerationJob] #{product_id}/#{platform}: created #{angles.size} angles")
  rescue => e
    Rails.logger.error("[ContentGenerationJob] #{product_id}/#{platform}: #{e.class} #{e.message}")
    raise
  end
end
