class CreateStatements < ActiveRecord::Migration[8.1]
  def change
    create_table :statements do |t|
      t.string :period, null: false                # "2026-04"
      t.bigint :total_reported_cents
      t.string :currency, limit: 3, default: "USD", null: false
      t.integer :rows_count, default: 0, null: false
      t.integer :matched_count, default: 0, null: false
      t.integer :status, default: 0, null: false   # uploaded, processing, reconciled, errored
      t.string :original_filename
      t.datetime :uploaded_at
      t.jsonb :metadata, default: {}, null: false
      t.timestamps
    end
    add_index :statements, :period, unique: true
    add_index :statements, :status

    create_table :statement_rows do |t|
      t.references :statement, null: false, foreign_key: true
      t.references :post, foreign_key: true        # null until matched
      t.references :short_link, foreign_key: true  # null until matched
      t.string :external_order_id
      t.string :raw_product_label
      t.bigint :commission_cents
      t.string :currency, limit: 3, default: "USD", null: false
      t.datetime :occurred_at
      t.integer :match_confidence, default: 0      # 0..100
      t.integer :status, default: 0, null: false   # unmatched, suggested, confirmed, rejected
      t.jsonb :raw_row, default: {}, null: false   # full CSV row for audit
      t.timestamps
    end
    add_index :statement_rows, [ :statement_id, :status ]
    add_index :statement_rows, :external_order_id
  end
end
