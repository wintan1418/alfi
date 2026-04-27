class CreateInitialSchema < ActiveRecord::Migration[8.1]
  def change
    enable_extension "citext" unless extension_enabled?("citext")
    enable_extension "pgcrypto" unless extension_enabled?("pgcrypto")

    create_table :products do |t|
      t.string :title, null: false
      t.text :description
      t.string :source_url, null: false
      t.string :affiliate_url
      t.integer :price_cents
      t.string :currency, limit: 3, default: "USD", null: false
      t.string :category
      t.integer :status, default: 0, null: false
      t.jsonb :metadata, default: {}, null: false
      t.timestamps
    end
    add_index :products, :status
    add_index :products, :source_url, unique: true

    create_table :product_images do |t|
      t.references :product, null: false, foreign_key: true
      t.integer :position, default: 0, null: false
      t.string :original_url
      t.jsonb :metadata, default: {}, null: false
      t.timestamps
    end
    add_index :product_images, [ :product_id, :position ]

    create_table :channel_accounts do |t|
      t.integer :platform, null: false
      t.string :handle
      t.string :display_name
      t.text :credentials_blob
      t.boolean :active, default: true, null: false
      t.jsonb :settings, default: {}, null: false
      t.timestamps
    end
    add_index :channel_accounts, :platform
    add_index :channel_accounts, :active

    create_table :content_angles do |t|
      t.references :product, null: false, foreign_key: true
      t.integer :platform, null: false
      t.integer :tone, null: false
      t.string :hook
      t.text :body
      t.string :hashtags, array: true, default: []
      t.string :cta
      t.integer :status, default: 0, null: false
      t.string :generated_by
      t.jsonb :metadata, default: {}, null: false
      t.timestamps
    end
    add_index :content_angles, [ :product_id, :platform, :tone ]
    add_index :content_angles, :status

    create_table :short_links do |t|
      t.citext :slug, null: false
      t.text :destination_url, null: false
      t.references :linkable, polymorphic: true
      t.bigint :click_count, default: 0, null: false
      t.datetime :last_clicked_at
      t.timestamps
    end
    add_index :short_links, :slug, unique: true

    create_table :posts do |t|
      t.references :content_angle, null: false, foreign_key: true
      t.references :channel_account, null: false, foreign_key: true
      t.references :short_link, foreign_key: true
      t.integer :status, default: 0, null: false
      t.datetime :scheduled_at
      t.datetime :published_at
      t.string :external_id
      t.string :external_url
      t.text :error_message
      t.string :dedupe_key
      t.jsonb :metadata, default: {}, null: false
      t.timestamps
    end
    add_index :posts, [ :status, :scheduled_at ]
    add_index :posts, :dedupe_key, unique: true, where: "dedupe_key IS NOT NULL"

    create_table :click_events do |t|
      t.references :short_link, null: false, foreign_key: true
      t.string :ip, limit: 64
      t.string :country, limit: 2
      t.string :city
      t.text :ua
      t.string :device_type
      t.text :referrer
      t.boolean :is_bot, default: false, null: false
      t.datetime :clicked_at, null: false
      t.timestamps
    end
    add_index :click_events, [ :short_link_id, :clicked_at ]
    add_index :click_events, :clicked_at
    add_index :click_events, :is_bot
  end
end
