module Earnings
  # Heuristic matcher that walks each unmatched StatementRow and tries to find
  # the corresponding Post (and therefore product, channel, tone).
  #
  # Strategy in priority order:
  #   1. external_order_id matches an existing Post.external_id
  #   2. Product whose source_url contains the row's product label substring
  #   3. Fuzzy title match (Jaro-like via simple token overlap) → confidence < 80
  #
  # Stores match_confidence 0..100. Anything ≥ 80 is auto-confirmed; below that
  # is `:suggested` and shows in the reconciliation queue for the operator.
  class AutoMatcher
    AUTO_CONFIRM_THRESHOLD = 80

    def initialize(statement)
      @statement = statement
    end

    def run!
      matched = 0
      @statement.statement_rows.where(status: :unmatched).find_each do |row|
        post, confidence = best_match_for(row)
        next unless post

        row.update!(
          post: post,
          short_link: post.short_link,
          match_confidence: confidence,
          status: confidence >= AUTO_CONFIRM_THRESHOLD ? :confirmed : :suggested
        )
        matched += 1
      end

      @statement.update!(
        matched_count: @statement.statement_rows.where.not(status: :unmatched).count,
        status: :reconciled
      )

      matched
    end

    private

    def best_match_for(row)
      # 1. Direct order ID match
      if row.external_order_id.present?
        post = Post.find_by(external_id: row.external_order_id)
        return [ post, 100 ] if post
      end

      label = row.raw_product_label.to_s.downcase
      return [ nil, 0 ] if label.blank?

      # 2. Substring match against product titles
      candidates = Post
        .joins(content_angle: :product)
        .includes(content_angle: :product)
        .where(status: :published)

      best, best_score = nil, 0
      candidates.find_each do |post|
        title = post.content_angle.product.title.to_s.downcase
        score = score_pair(title, label)
        if score > best_score
          best, best_score = post, score
        end
      end

      [ best, best_score ]
    end

    # Token overlap scoring. Cheap, no NLP.
    # Two strings sharing N of K significant tokens → score = (N / K) * 100.
    def score_pair(a, b)
      a_tokens = significant_tokens(a)
      b_tokens = significant_tokens(b)
      return 0 if a_tokens.empty? || b_tokens.empty?

      shared = (a_tokens & b_tokens).size
      union  = (a_tokens | b_tokens).size
      ((shared.to_f / union) * 100).round
    end

    STOP = %w[the and for with from this that pack set].to_set.freeze

    def significant_tokens(s)
      s.scan(/[a-z0-9]{3,}/).reject { |t| STOP.include?(t) }
    end
  end
end
