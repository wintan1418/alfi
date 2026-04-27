class Product < ApplicationRecord
  enum :status, { queued: 0, scheduled: 1, live: 2, paused: 3, archived: 4 }

  has_many :product_images, -> { order(position: :asc) }, dependent: :destroy
  has_many :content_angles, dependent: :destroy

  validates :title, presence: true
  validates :source_url, presence: true, uniqueness: true

  def formatted_price
    return nil if price_cents.blank?

    amount = (price_cents / 100.0).round(2)
    case currency
    when "NGN" then "₦#{amount}"
    when "USD" then "$#{amount}"
    else "#{currency} #{amount}"
    end
  end

  def display_image_url
    metadata.is_a?(Hash) && metadata["image_url"].presence ||
      "https://picsum.photos/seed/#{id || object_id}/400/400"
  end

  def legacy_id
    metadata.is_a?(Hash) && metadata["legacy_id"].presence || "P-#{id.to_s.rjust(4, '0')}"
  end

  def margin_cents
    metadata.is_a?(Hash) && metadata["margin_cents"]&.to_i
  end

  def formatted_margin
    return nil if margin_cents.blank?
    "$%.2f" % (margin_cents / 100.0)
  end

  def score
    metadata.is_a?(Hash) && metadata["score"]&.to_i || 70
  end

  def click_count
    metadata.is_a?(Hash) && metadata["clicks"]&.to_i || 0
  end

  def earned_amount
    metadata.is_a?(Hash) && metadata["earnings"]&.to_f || 0.0
  end

  def angle_count
    metadata.is_a?(Hash) && metadata["angles"]&.to_i || 0
  end

  def post_count
    metadata.is_a?(Hash) && metadata["posts"]&.to_i || 0
  end

  def flagged?
    metadata.is_a?(Hash) && metadata["flagged"] == true
  end

  def note
    metadata.is_a?(Hash) && metadata["note"].presence
  end

  def discovered_on
    metadata.is_a?(Hash) && metadata["discovered"].presence || created_at&.to_date&.iso8601
  end
end
