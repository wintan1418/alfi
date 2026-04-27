class PromptsController < ApplicationController
  allow_unauthenticated_access

  def show
    @nav_counts = { products: Product.count, calendar: 23, inbox: 15 }
  end
end
