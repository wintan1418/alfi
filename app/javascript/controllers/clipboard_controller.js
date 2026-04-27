import { Controller } from "@hotwired/stimulus"

// Copies the text in data-text to the clipboard. Briefly flips the button label
// to "Copied!" for feedback. Used on the bulk-affiliate-URL page.
export default class extends Controller {
  static targets = ["label"]

  copy(event) {
    const trigger = event.currentTarget
    const text = trigger.dataset.text || ""
    if (!text) return

    navigator.clipboard.writeText(text).then(
      () => this.flash("Copied"),
      () => this.flash("Couldn't copy")
    )
  }

  flash(msg) {
    if (!this.hasLabelTarget) return
    const original = this.labelTarget.textContent
    this.labelTarget.textContent = msg
    setTimeout(() => { this.labelTarget.textContent = original }, 1500)
  }
}
