import { Controller } from "@hotwired/stimulus"

// Toggles light/dark theme on <html> and persists in a cookie.
// Usage: <button data-controller="theme" data-action="click->theme#toggle">…</button>
// The layout reads the cookie on the server and sets data-theme inline so there's no flash.
export default class extends Controller {
  toggle() {
    const html = document.documentElement
    const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark"
    html.setAttribute("data-theme", next)
    document.cookie = `alfi_theme=${next};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`
    this.dispatch("changed", { detail: { theme: next } })
  }
}
