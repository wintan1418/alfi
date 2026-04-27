class ChannelAccount < ApplicationRecord
  include Platformable

  encrypts :credentials_blob

  has_many :posts, dependent: :restrict_with_error

  scope :enabled, -> { where(active: true) }

  validates :platform, presence: true

  def decrypted_credentials
    return {} if credentials_blob.blank?
    JSON.parse(credentials_blob)
  end

  def update_credentials!(**creds)
    merged = decrypted_credentials.merge(creds.stringify_keys)
    update!(credentials_blob: merged.to_json)
  end

  def credentials_valid?
    case platform.to_sym
    when :telegram  then %w[bot_token chat_id].all? { decrypted_credentials[_1].present? }
    when :pinterest then decrypted_credentials["access_token"].present?
    when :x         then decrypted_credentials["access_token"].present?
    else false
    end
  end
end
