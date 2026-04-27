class ProductsController < ApplicationController
  allow_unauthenticated_access

  def index
    @products = Product.order(updated_at: :desc)
    @nav_counts = nav_counts
  end

  def new
    @product = Product.new
    @nav_counts = nav_counts
  end

  def create
    @product = Product.new(product_params)
    @product.title ||= "Imported from Temu (pending scrape)"
    @product.status ||= :queued

    if @product.save
      # In dev with stubs, run the pipeline inline so the user sees immediate
      # results. With real APIs, this would be too slow — go async.
      if Rails.env.development? && stubs_only?
        ProductIngestJob.perform_now(@product.id)
      else
        ProductIngestJob.perform_later(@product.id)
      end
      redirect_to product_path(@product)
    else
      @nav_counts = nav_counts
      render :new, status: :unprocessable_entity
    end
  end

  def show
    @product = Product.find(params[:id])
    @nav_counts = nav_counts
  end

  PLATFORM_SHORT = { "tg" => "telegram", "pin" => "pinterest", "x" => "x", "tt" => "tiktok", "ig" => "instagram" }.freeze

  # PATCH /products/:id/set_affiliate_url
  def set_affiliate_url
    product = Product.find(params[:id])
    url = params.require(:product).permit(:affiliate_url).fetch(:affiliate_url).to_s.strip

    return redirect_to(product_path(product), alert: "Affiliate URL can't be blank.") if url.blank?

    product.update!(affiliate_url: url)

    # Re-point the existing short links to the new affiliate URL too
    ShortLink.where(linkable: product).update_all(destination_url: url)

    redirect_to product_path(product), notice: "Affiliate URL saved. Short links updated."
  end

  # PATCH /products/:id/select_angle?platform=tg&tone=witty
  def select_angle
    product = Product.find(params[:id])
    short = params[:platform].to_s
    platform = PLATFORM_SHORT[short] || short
    tone = params[:tone].to_s

    raise ActionController::BadRequest, "missing platform/tone" unless platform.present? && tone.present?

    ContentAngle.transaction do
      product.content_angles.where(platform: platform, status: :approved).update_all(status: 0)
      angle = product.content_angles.find_by!(platform: platform, tone: tone)
      angle.update!(status: :approved)
    end

    redirect_to product_path(product, anchor: "platform-#{short}")
  end

  # GET /products/bulk_affiliates
  def bulk_affiliates
    scope = params[:show] == "all" ? Product.all : Product.where(affiliate_url: [ nil, "" ])
    @products = scope.order(:id)
    @show_all = params[:show] == "all"
    @missing_count = Product.where(affiliate_url: [ nil, "" ]).count
    @nav_counts = nav_counts
  end

  # PATCH /products/update_bulk_affiliates
  def update_bulk_affiliates
    raw = params[:affiliate_urls].to_s
    urls = raw.split(/\r?\n/).map(&:strip).reject(&:empty?)

    scope = params[:show] == "all" ? Product.all : Product.where(affiliate_url: [ nil, "" ])
    products = scope.order(:id).to_a

    saved = 0
    errors = []

    urls.each_with_index do |url, idx|
      target = products[idx]
      if target.nil?
        errors << "line #{idx + 1}: no matching product slot"
        next
      end
      unless url.match?(%r{\Ahttps?://}i)
        errors << "line #{idx + 1}: not a URL"
        next
      end

      target.update!(affiliate_url: url)
      ShortLink.where(linkable: target).update_all(destination_url: url)
      saved += 1
    end

    if errors.any?
      flash[:alert] = "Saved #{saved}, skipped #{errors.size}: #{errors.first(3).join('; ')}#{'…' if errors.size > 3}"
    else
      flash[:notice] = "Saved #{saved} affiliate URL#{saved == 1 ? '' : 's'}. Short links repointed."
    end
    redirect_to bulk_affiliates_products_path(show: params[:show])
  end

  private

  def product_params
    params.require(:product).permit(:title, :source_url, :affiliate_url, :price_cents, :currency, :description, :category)
  end

  def nav_counts
    { products: Product.count, calendar: 23, inbox: 15 }
  end

  def stubs_only?
    !Alfi::Live.apify? && !Alfi::Live.anthropic?
  end
end
