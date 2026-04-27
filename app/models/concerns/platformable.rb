module Platformable
  extend ActiveSupport::Concern

  PLATFORMS = { telegram: 0, pinterest: 1, x: 2, instagram: 3, tiktok: 4 }.freeze

  included do
    enum :platform, PLATFORMS
  end
end
