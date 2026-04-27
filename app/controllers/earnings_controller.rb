class EarningsController < ApplicationController
  allow_unauthenticated_access

  def show
    @nav_counts = nav_counts
    @statements = Statement.order(period: :desc).includes(:statement_rows)
    @current = @statements.first
    @reconcile_queue = @current ?
      @current.statement_rows.where(status: %i[unmatched suggested]).ordered.limit(20)
      : StatementRow.none

    @kpi_reported_cents = @current&.total_reported_cents || 0
    @kpi_match_rate     = @current&.match_rate || 0
    @kpi_needs_review   = @current ? @current.statement_rows.where(status: %i[unmatched suggested]).count : 0
    @kpi_variance_cents = @current&.variance_cents || 0
  end

  def import
    file = params[:csv_file]
    period = params[:period].presence || Date.current.strftime("%Y-%m")

    return redirect_to(earnings_path, alert: "No CSV file selected.") unless file.respond_to?(:original_filename)

    statement = Statement.find_or_initialize_by(period: period)
    statement.original_filename = file.original_filename
    statement.csv_file.attach(file)
    statement.save!

    rows = Earnings::CsvParser.new(statement).parse!
    matched = Earnings::AutoMatcher.new(statement).run!

    redirect_to earnings_path, notice: "Imported #{rows} rows · auto-matched #{matched}."
  rescue => e
    redirect_to earnings_path, alert: "Import failed: #{e.message}"
  end

  # POST /earnings/rematch — re-run the matcher on the current statement.
  # Useful after you've published more posts since the CSV upload — those new
  # posts become candidates for previously-unmatched rows.
  def rematch
    statement = params[:statement_id].present? ? Statement.find(params[:statement_id]) : Statement.order(period: :desc).first
    return redirect_to(earnings_path, alert: "No statement to rematch.") unless statement

    # Reset suggested/unmatched rows; keep confirmed ones intact
    statement.statement_rows.where(status: %i[unmatched suggested]).update_all(
      status: 0, post_id: nil, short_link_id: nil, match_confidence: 0
    )
    matched = Earnings::AutoMatcher.new(statement).run!

    redirect_to earnings_path, notice: "Re-matched · #{matched} new suggestions."
  end

  private

  def nav_counts
    inbox = Statement.first&.statement_rows&.where(status: %i[unmatched suggested])&.count || 15
    { products: Product.count, calendar: 23, inbox: inbox }
  end
end
