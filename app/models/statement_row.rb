class StatementRow < ApplicationRecord
  enum :status, { unmatched: 0, suggested: 1, confirmed: 2, rejected: 3 }

  belongs_to :statement
  belongs_to :post, optional: true
  belongs_to :short_link, optional: true

  scope :ordered, -> { order(occurred_at: :asc) }
end
