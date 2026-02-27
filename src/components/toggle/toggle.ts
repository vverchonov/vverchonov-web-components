import { LitElement, html, unsafeCSS, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { ToggleIconPosition, ToggleChangeEventDetail } from './toggle-types'
import toggleStyles from './toggle.css?inline'

/**
 * Toggle switch with optional label and icon.
 *
 * @tag app-toggle
 * @slot icon - Optional icon rendered next to the label.
 * @fires toggle-change - Fired when the toggle is clicked. Detail: `{ checked: boolean }`.
 */
@customElement('app-toggle')
export class Toggle extends LitElement {
  static override styles = [unsafeCSS(toggleStyles)]

  /** Whether the toggle is currently on. Reflected to attribute. */
  @property({ type: Boolean, reflect: true })
  checked = false

  /** Disables interaction and greys out the toggle. Reflected to attribute. */
  @property({ type: Boolean, reflect: true })
  disabled = false

  /** Visible label text next to the switch. Also used as accessible name. */
  @property({ type: String })
  label = ''

  /** Where to show the icon: before the label (start) or after (end) (attribute: `icon-position`). */
  @property({ type: String, attribute: 'icon-position' })
  iconPosition: ToggleIconPosition = 'start'

  /** Optional callback invoked with the `toggle-change` custom event. Set via property. */
  @property({ attribute: false })
  onChange?: (e: CustomEvent<ToggleChangeEventDetail>) => void

  private _handleClick() {
    if (this.disabled) return
    this.checked = !this.checked
    const event = new CustomEvent<ToggleChangeEventDetail>('toggle-change', {
      detail: { checked: this.checked },
      bubbles: true,
      composed: true,
    })
    this.dispatchEvent(event)
    this.onChange?.(event)
  }

  override render() {
    return html`
      <button
        role="switch"
        aria-checked=${this.checked}
        aria-label=${this.label ? nothing : 'Toggle'}
        ?disabled=${this.disabled}
        @click=${this._handleClick}
      >
        <span class="label-area icon-${this.iconPosition}">
          <span class="icon-wrapper" aria-hidden="true">
            <slot name="icon"></slot>
          </span>
          ${this.label ? html`<span class="label">${this.label}</span>` : nothing}
        </span>
        <span class="track" aria-hidden="true">
          <span class="thumb"></span>
        </span>
      </button>
    `
  }
}
