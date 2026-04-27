class Statement < ApplicationRecord
  enum :status, { uploaded: 0, processing: 1, reconciled: 2, errored: 3 }

  has_one_attached :csv_file
  has_many :statement_rows, dependent: :destroy

  validates :period, presence: true, uniqueness: true,
    format: { with: /\A\d{4}-\d{2}\z/, message: "must be YYYY-MM" }

  def label
    Date.parse("#{period}-01").strftime("%B %Y")
  rescue Date::Error
    period
  end

  def variance_cents
    return 0 if total_reported_cents.blank?
    confirmed = statement_rows.where(status: :confirmed).sum(:commission_cents)
    total_reported_cents - confirmed
  end

  def match_rate
    return 0 if rows_count.zero?
    ((matched_count.to_f / rows_count) * 100).round(1)
  end
end
