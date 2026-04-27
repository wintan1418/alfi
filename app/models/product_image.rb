class ProductImage < ApplicationRecord
  belongs_to :product
  has_one_attached :file

  scope :ordered, -> { order(position: :asc) }

  # Public-facing URL via the R2 custom domain. Used in posts so platform
  # crawlers don't go through the slow Rails proxy.
  def public_url
    return nil unless file.attached?
    return nil if ENV["R2_PUBLIC_URL"].blank?
    "#{ENV.fetch('R2_PUBLIC_URL')}/#{file.key}"
  end
end
