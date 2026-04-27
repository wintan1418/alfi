class Post < ApplicationRecord
  enum :status, { scheduled: 0, publishing: 1, published: 2, failed: 3 }

  belongs_to :content_angle
  belongs_to :channel_account
  belongs_to :short_link, optional: true

  validates :dedupe_key, uniqueness: true, allow_nil: true

  delegate :platform, to: :channel_account
end
