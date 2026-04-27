class SettingsController < ApplicationController
  allow_unauthenticated_access

  TOGGLE_KEYS = %w[discovery.daily_sync discovery.auto_generate discovery.auto_schedule].freeze

  def show
    @nav_counts = { products: Product.count, calendar: 23, inbox: 15 }
    @toggles = TOGGLE_KEYS.index_with { |k| Setting.bool(k) }
    @channels = ChannelAccount.order(:platform)
  end

  def update
    if params[:toggle].present? && TOGGLE_KEYS.include?(params[:toggle])
      Setting.toggle(params[:toggle])
      redirect_to settings_path, notice: "Updated."
    else
      redirect_to settings_path, alert: "Unknown setting."
    end
  end
end
