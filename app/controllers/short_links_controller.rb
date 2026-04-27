class ShortLinksController < ApplicationController
  allow_unauthenticated_access

  # GET /r/:slug — public redirect. Must respond <50ms.
  # Click logging is async via Solid Queue.
  def show
    link = ShortLink.find_by!(slug: params[:slug])

    LogClickJob.perform_later(
      short_link_id: link.id,
      ip:            request.remote_ip,
      ua:            request.user_agent,
      referrer:      request.referrer,
      clicked_at:    Time.current
    )

    redirect_to link.destination_url, allow_other_host: true, status: :found
  rescue ActiveRecord::RecordNotFound
    redirect_to root_path, status: :found
  end
end
