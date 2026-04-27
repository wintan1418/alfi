class ShortLink < ApplicationRecord
  belongs_to :linkable, polymorphic: true, optional: true
  has_many :click_events, dependent: :destroy

  validates :slug, presence: true, uniqueness: { case_sensitive: false }
  validates :destination_url, presence: true

  before_validation :generate_slug, on: :create

  def public_url
    host = ENV.fetch("SHORT_LINK_HOST", "http://localhost:3000")
    "#{host}/r/#{slug}"
  end

  private

  def generate_slug
    return if slug.present?
    loop do
      candidate = SecureRandom.alphanumeric(7).downcase
      break self.slug = candidate unless self.class.exists?(slug: candidate)
    end
  end
end
