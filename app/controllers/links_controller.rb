class LinksController < ApplicationController
  allow_unauthenticated_access

  def index
    @links = ShortLink.order(click_count: :desc, created_at: :desc).limit(50)
    @nav_counts = { products: Product.count, calendar: 23, inbox: 15 }

    @kpi_active   = ShortLink.count
    @kpi_clicks   = ClickEvent.humans.where(clicked_at: 30.days.ago..).count
    @kpi_top_epc  = "$0.92"
    @kpi_blocked  = ClickEvent.bots.count
  end

  def new
    @link = ShortLink.new
    @products = Product.order(:title)
    @nav_counts = { products: Product.count, calendar: 23, inbox: 15 }
  end

  def create
    @link = ShortLink.new(link_params)

    if params[:product_id].present?
      product = Product.find(params[:product_id])
      @link.linkable = product
      @link.destination_url = product.affiliate_url.presence || product.source_url if @link.destination_url.blank?
    end

    if @link.save
      redirect_to links_path, notice: "Short link created — alfi.co/#{@link.slug}"
    else
      @products = Product.order(:title)
      @nav_counts = { products: Product.count, calendar: 23, inbox: 15 }
      render :new, status: :unprocessable_entity
    end
  end

  private

  def link_params
    params.require(:short_link).permit(:slug, :destination_url)
  end
end
