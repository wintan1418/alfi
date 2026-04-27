module ClickLogging
  module BotFilter
    PREVIEW_BOT_REGEX = /TelegramBot|Pinterest|facebookexternalhit|Twitterbot|WhatsApp|LinkedInBot|Slackbot|DiscordBot/i

    # Returns true if the user-agent looks like a platform link-preview bot,
    # OR DeviceDetector flagged it as a generic bot.
    def self.preview_or_bot?(user_agent)
      return false if user_agent.blank?
      return true if user_agent.match?(PREVIEW_BOT_REGEX)

      parser = DeviceDetector.new(user_agent)
      parser.bot?
    end
  end
end
