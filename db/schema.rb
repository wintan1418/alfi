# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_04_27_150000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "citext"
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pgcrypto"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "channel_accounts", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.text "credentials_blob"
    t.string "display_name"
    t.string "handle"
    t.integer "platform", null: false
    t.jsonb "settings", default: {}, null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_channel_accounts_on_active"
    t.index ["platform"], name: "index_channel_accounts_on_platform"
  end

  create_table "click_events", force: :cascade do |t|
    t.string "city"
    t.datetime "clicked_at", null: false
    t.string "country", limit: 2
    t.datetime "created_at", null: false
    t.string "device_type"
    t.string "ip", limit: 64
    t.boolean "is_bot", default: false, null: false
    t.text "referrer"
    t.bigint "short_link_id", null: false
    t.text "ua"
    t.datetime "updated_at", null: false
    t.index ["clicked_at"], name: "index_click_events_on_clicked_at"
    t.index ["is_bot"], name: "index_click_events_on_is_bot"
    t.index ["short_link_id", "clicked_at"], name: "index_click_events_on_short_link_id_and_clicked_at"
    t.index ["short_link_id"], name: "index_click_events_on_short_link_id"
  end

  create_table "content_angles", force: :cascade do |t|
    t.text "body"
    t.datetime "created_at", null: false
    t.string "cta"
    t.string "generated_by"
    t.string "hashtags", default: [], array: true
    t.string "hook"
    t.jsonb "metadata", default: {}, null: false
    t.integer "platform", null: false
    t.bigint "product_id", null: false
    t.integer "status", default: 0, null: false
    t.integer "tone", null: false
    t.datetime "updated_at", null: false
    t.index ["product_id", "platform", "tone"], name: "index_content_angles_on_product_id_and_platform_and_tone"
    t.index ["product_id"], name: "index_content_angles_on_product_id"
    t.index ["status"], name: "index_content_angles_on_status"
  end

  create_table "posts", force: :cascade do |t|
    t.bigint "channel_account_id", null: false
    t.bigint "content_angle_id", null: false
    t.datetime "created_at", null: false
    t.string "dedupe_key"
    t.text "error_message"
    t.string "external_id"
    t.string "external_url"
    t.jsonb "metadata", default: {}, null: false
    t.datetime "published_at"
    t.datetime "scheduled_at"
    t.bigint "short_link_id"
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["channel_account_id"], name: "index_posts_on_channel_account_id"
    t.index ["content_angle_id"], name: "index_posts_on_content_angle_id"
    t.index ["dedupe_key"], name: "index_posts_on_dedupe_key", unique: true, where: "(dedupe_key IS NOT NULL)"
    t.index ["short_link_id"], name: "index_posts_on_short_link_id"
    t.index ["status", "scheduled_at"], name: "index_posts_on_status_and_scheduled_at"
  end

  create_table "product_images", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.jsonb "metadata", default: {}, null: false
    t.string "original_url"
    t.integer "position", default: 0, null: false
    t.bigint "product_id", null: false
    t.datetime "updated_at", null: false
    t.index ["product_id", "position"], name: "index_product_images_on_product_id_and_position"
    t.index ["product_id"], name: "index_product_images_on_product_id"
  end

  create_table "products", force: :cascade do |t|
    t.string "affiliate_url"
    t.string "category"
    t.datetime "created_at", null: false
    t.string "currency", limit: 3, default: "USD", null: false
    t.text "description"
    t.jsonb "metadata", default: {}, null: false
    t.integer "price_cents"
    t.string "source_url", null: false
    t.integer "status", default: 0, null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["source_url"], name: "index_products_on_source_url", unique: true
    t.index ["status"], name: "index_products_on_status"
  end

  create_table "sessions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "ip_address"
    t.datetime "updated_at", null: false
    t.string "user_agent"
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "settings", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "key", null: false
    t.datetime "updated_at", null: false
    t.jsonb "value", default: {}, null: false
    t.index ["key"], name: "index_settings_on_key", unique: true
  end

  create_table "short_links", force: :cascade do |t|
    t.bigint "click_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.text "destination_url", null: false
    t.datetime "last_clicked_at"
    t.bigint "linkable_id"
    t.string "linkable_type"
    t.citext "slug", null: false
    t.datetime "updated_at", null: false
    t.index ["linkable_type", "linkable_id"], name: "index_short_links_on_linkable"
    t.index ["slug"], name: "index_short_links_on_slug", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email_address", null: false
    t.string "password_digest", null: false
    t.datetime "updated_at", null: false
    t.index ["email_address"], name: "index_users_on_email_address", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "click_events", "short_links"
  add_foreign_key "content_angles", "products"
  add_foreign_key "posts", "channel_accounts"
  add_foreign_key "posts", "content_angles"
  add_foreign_key "posts", "short_links"
  add_foreign_key "product_images", "products"
  add_foreign_key "sessions", "users"
end
