class ChannelAccountsController < ApplicationController
  allow_unauthenticated_access

  def index
    @channels = ChannelAccount.order(:platform)
    @nav_counts = nav_counts
  end

  def edit
    @channel = ChannelAccount.find(params[:id])
    @creds = @channel.decrypted_credentials
    @nav_counts = nav_counts
  end

  def update
    @channel = ChannelAccount.find(params[:id])

    creds_input = params.require(:channel_account).permit(:bot_token, :chat_id, :board_id, :access_token, :refresh_token).to_h
    creds_input.compact_blank!

    @channel.assign_attributes(channel_params)

    if creds_input.any?
      @channel.update_credentials!(**creds_input.symbolize_keys)
    end

    if @channel.save
      redirect_to channel_accounts_path, notice: "#{@channel.platform.titleize} updated."
    else
      @creds = @channel.decrypted_credentials
      @nav_counts = nav_counts
      render :edit, status: :unprocessable_entity
    end
  end

  private

  def channel_params
    params.require(:channel_account).permit(:handle, :display_name, :active)
  end

  def nav_counts
    { products: Product.count, calendar: 23, inbox: 15 }
  end
end
