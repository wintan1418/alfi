require "faraday"

module Apify
  # Real Apify call. Async-aware: starts a run, polls until SUCCEEDED, then
  # fetches the dataset. Use only inside a background job.
  class TemuScraper
    BASE_URL = "https://api.apify.com/v2".freeze

    class StartFailed < StandardError; end
    class RunFailed   < StandardError; end
    class TimedOut    < StandardError; end

    def initialize(token: ENV.fetch("APIFY_API_TOKEN"),
                   actor_id: ENV.fetch("APIFY_TEMU_ACTOR_ID", "piotrv1001~temu-listings-scraper"))
      @token = token
      @actor_id = actor_id
      @http = Faraday.new(url: BASE_URL) do |f|
        f.request :retry, max: 3, interval: 1, backoff_factor: 2
        f.options.timeout = 30
      end
    end

    # Single product detail by URL. Returns a hash of normalized fields:
    #   { title:, description:, price_cents:, currency:, images: [url, ...] }
    def fetch_product(url:)
      run = start_run(start_urls: [ { url: url } ], max_items: 1)
      run = poll_until_complete(run["id"])
      raise RunFailed, run["statusMessage"] unless run["status"] == "SUCCEEDED"
      raw = fetch_dataset(run["defaultDatasetId"]).first
      normalize(raw)
    end

    private

    def start_run(input)
      response = @http.post("/acts/#{@actor_id}/runs?token=#{@token}",
                            input.to_json,
                            "Content-Type" => "application/json")
      raise StartFailed, response.body unless response.success?
      JSON.parse(response.body).fetch("data")
    end

    def poll_until_complete(run_id, timeout: 300, interval: 5)
      deadline = Time.current + timeout
      loop do
        response = @http.get("/actor-runs/#{run_id}?token=#{@token}")
        run = JSON.parse(response.body).fetch("data")
        return run if %w[SUCCEEDED FAILED ABORTED TIMED-OUT].include?(run["status"])
        raise TimedOut, "run #{run_id} timed out" if Time.current > deadline
        sleep interval
      end
    end

    def fetch_dataset(dataset_id)
      response = @http.get("/datasets/#{dataset_id}/items", { token: @token, clean: "true" })
      JSON.parse(response.body)
    end

    def normalize(raw)
      return {} if raw.blank?
      price_str = raw["price"].to_s
      price_cents = price_str.scan(/[\d.]+/).first&.to_f&.* 100
      {
        title:       raw["title"] || raw["name"] || "Imported product",
        description: raw["description"] || raw["specs"] || "",
        price_cents: price_cents&.to_i,
        currency:    raw["currency"] || "USD",
        images:      Array(raw["images"] || raw["imageUrls"]).first(6),
        category:    raw["category"]
      }
    end
  end
end
