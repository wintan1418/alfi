# MaxMind GeoLite2 — local DB lookup, no per-request API call.
# Download GeoLite2-City.mmdb (free, requires maxmind.com account) to db/.
# When the file is missing, Geocoder.search returns [] and click logging
# silently skips country/city.
require "geocoder"

Geocoder.configure(
  ip_lookup: :maxmind_local,
  maxmind_local: {
    file: Rails.root.join(ENV.fetch("MAXMIND_DB_PATH", "db/GeoLite2-City.mmdb")).to_s,
    package: :city
  }
)
