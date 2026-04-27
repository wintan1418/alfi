class ClickEvent < ApplicationRecord
  belongs_to :short_link

  scope :humans, -> { where(is_bot: false) }
  scope :bots,   -> { where(is_bot: true) }
end
