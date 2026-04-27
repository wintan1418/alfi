class ContentAngle < ApplicationRecord
  include Platformable

  enum :tone, { practical: 0, premium: 1, witty: 2 }
  enum :status, { draft: 0, approved: 1, published: 2, rejected: 3 }

  belongs_to :product
  has_many :posts, dependent: :destroy
end
