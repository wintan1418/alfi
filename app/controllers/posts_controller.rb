class PostsController < ApplicationController
  allow_unauthenticated_access

  def new
    @post = Post.new
    # Default the time picker to "next round hour" in user's TZ
    @default_time = (Time.current + 1.hour).beginning_of_hour.strftime("%Y-%m-%dT%H:%M")
    @products = Product.includes(:content_angles).order(updated_at: :desc).limit(50)
    @prefill_product_id = params[:product_id]
    @prefill_date = params[:date]
    @nav_counts = nav_counts
  end

  def create
    angle = ContentAngle.find(params.require(:content_angle_id))
    channel = ChannelAccount.find_by!(platform: angle.platform)

    @post = Post.new(
      content_angle: angle,
      channel_account: channel,
      status: :scheduled,
      scheduled_at: Time.zone.parse(params.require(:scheduled_at)),
      dedupe_key: "manual-#{angle.id}-#{params[:scheduled_at]}"
    )

    if @post.save
      redirect_to calendar_path, notice: "Scheduled #{angle.product.title} on #{channel.platform.titleize}."
    else
      @products = Product.includes(:content_angles).order(updated_at: :desc).limit(50)
      @nav_counts = nav_counts
      render :new, status: :unprocessable_entity
    end
  rescue => e
    redirect_to new_post_path, alert: "Could not schedule: #{e.message}"
  end

  private

  def nav_counts
    { products: Product.count, calendar: 23, inbox: 15 }
  end
end
