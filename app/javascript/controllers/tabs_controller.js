import { Controller } from "@hotwired/stimulus"

// Simple tab switcher. Used on Product detail to switch platform tabs.
//   data-controller="tabs"
//   data-tabs-active-class="tab-active"
//   data-tabs-default-value="tg"
//   <button data-tabs-target="tab" data-key="tg" data-action="tabs#select">Telegram</button>
//   <div data-tabs-target="panel" data-key="tg">…</div>
export default class extends Controller {
  static targets = ["tab", "panel"]
  static values = { default: String }

  connect() {
    this.show(this.defaultValue || this.tabTargets[0]?.dataset.key)
  }

  select(event) {
    const key = event.currentTarget.dataset.key
    this.show(key)
  }

  show(key) {
    this.tabTargets.forEach(el => el.classList.toggle("tab-active", el.dataset.key === key))
    this.panelTargets.forEach(el => {
      // Restore the original display the panel was authored with (e.g. "grid")
      // — read from data-display, fall back to "block".
      const restored = el.dataset.display || "grid"
      el.style.display = el.dataset.key === key ? restored : "none"
    })
  }
}
