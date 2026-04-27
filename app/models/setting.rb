class Setting < ApplicationRecord
  validates :key, presence: true, uniqueness: true

  def self.get(key, default: nil)
    find_by(key: key.to_s)&.value || default
  end

  def self.set(key, value)
    rec = find_or_initialize_by(key: key.to_s)
    rec.value = value.is_a?(Hash) ? value : { "value" => value }
    rec.save!
    rec
  end

  def self.bool(key, default: false)
    raw = find_by(key: key.to_s)&.value
    return default if raw.nil?
    raw.is_a?(Hash) ? !!raw["value"] : !!raw
  end

  def self.set_bool(key, on)
    set(key, { "value" => !!on })
  end

  def self.toggle(key)
    set_bool(key, !bool(key))
  end
end
