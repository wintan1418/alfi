require "csv"

module Earnings
  # Parses a Temu-style affiliate commission CSV into StatementRow records.
  #
  # We don't have a fixed Temu schema (their CSV format has shifted over time),
  # so this looks for likely column names case-insensitively and falls back to
  # storing the full raw row in `raw_row` jsonb so nothing is lost.
  class CsvParser
    DATE_KEYS       = %w[date order_date occurred_at created_at timestamp].freeze
    ORDER_ID_KEYS   = %w[order_id order tmu_order_id transaction_id reference].freeze
    PRODUCT_KEYS    = %w[product product_name title sku item_name].freeze
    COMMISSION_KEYS = %w[commission earnings amount payout commission_amount].freeze
    CURRENCY_KEYS   = %w[currency ccy].freeze

    def initialize(statement)
      @statement = statement
    end

    def parse!
      raise ArgumentError, "no csv attached" unless @statement.csv_file.attached?

      rows_created = 0
      total_cents  = 0

      @statement.csv_file.open do |tempfile|
        text = tempfile.read.force_encoding("UTF-8")
        # Strip UTF-8 BOM if present, then parse
        text.sub!(/\A\xEF\xBB\xBF/, "")
        csv = CSV.parse(text, headers: true)

        csv.each do |csv_row|
          h = csv_row.to_h.transform_keys { |k| k.to_s.downcase.strip.tr(" ", "_") }
          commission = parse_money(pick(h, COMMISSION_KEYS))
          next if commission.nil?

          total_cents += commission

          @statement.statement_rows.create!(
            external_order_id:  pick(h, ORDER_ID_KEYS),
            raw_product_label:  pick(h, PRODUCT_KEYS),
            commission_cents:   commission,
            currency:           pick(h, CURRENCY_KEYS).presence || "USD",
            occurred_at:        parse_date(pick(h, DATE_KEYS)),
            raw_row:            h,
            status:             :unmatched
          )
          rows_created += 1
        end
      end

      @statement.update!(
        rows_count: rows_created,
        total_reported_cents: total_cents,
        status: :uploaded,
        uploaded_at: Time.current
      )

      rows_created
    rescue => e
      @statement.update(status: :errored, metadata: @statement.metadata.merge("error" => e.message))
      raise
    end

    private

    def pick(h, keys)
      keys.each { |k| return h[k] if h[k].present? }
      nil
    end

    def parse_money(value)
      return nil if value.blank?
      cents = value.to_s.scan(/[\d.]+/).first&.to_f
      cents ? (cents * 100).round : nil
    end

    def parse_date(value)
      return nil if value.blank?
      Time.zone.parse(value.to_s)
    rescue ArgumentError
      nil
    end
  end
end
