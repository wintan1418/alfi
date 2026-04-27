class LinksController < ApplicationController
  allow_unauthenticated_access

  def index
    @nav_counts = { products: Product.count, calendar: 23, inbox: 15 }
  end
end
