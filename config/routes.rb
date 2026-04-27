Rails.application.routes.draw do
  # Auth (Rails 8 native)
  resource :session
  resources :passwords, param: :token

  # Health
  get "up" => "rails/health#show", as: :rails_health_check

  # Public short-link redirect
  get "r/:slug", to: "short_links#show", as: :short_link

  # Public landing
  root "landing#show"

  # Operator dashboard + screens
  get "dashboard", to: "dashboard#show", as: :dashboard

  resources :products, only: [ :index, :new, :create, :show ] do
    member do
      patch :select_angle
    end
  end

  resources :channel_accounts, only: [ :index, :edit, :update ], path: "channels"

  get "calendar",  to: "calendar#show",  as: :calendar
  get "analytics", to: "analytics#show", as: :analytics
  get "earnings",  to: "earnings#show",  as: :earnings
  post "earnings/import", to: "earnings#import", as: :import_earnings
  get "links",     to: "links#index",    as: :links
  get "prompts",   to: "prompts#show",   as: :prompts
  get "settings",  to: "settings#show",  as: :settings
  patch "settings", to: "settings#update"
end
