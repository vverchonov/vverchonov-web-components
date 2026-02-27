import { LitElement, html, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type { ButtonIconPosition, ButtonType, ButtonVariant } from './button-types.ts'
import buttonStyles from './button.css?inline'

/**
 * General-purpose button with label, optional icon slot, and visual variants.
 *
 * @tag app-button
 * @slot icon - Optional icon rendered before or after the label (controlled by `icon-position`).
 */
@customElement('app-button')
export class Button extends LitElement {
  static override styles = [unsafeCSS(buttonStyles)]

  /** Visible button text. */
  @property({ type: String })
  label = 'Click me'

  /** Where to show the icon: before the label (start) or after (end) (attribute: `icon-position`). */
  @property({ type: String, attribute: 'icon-position' })
  iconPosition: ButtonIconPosition = 'start'

  /** HTML button type attribute. */
  @property({ type: String })
  type: ButtonType = 'button'

  /** Visual style variant. */
  @property({ type: String })
  variant: ButtonVariant = 'primary'

  /** Optional click callback. Set via property (e.g. `el.onClick = (e) => ...`). */
  @property({ attribute: false })
  onClick?: (e: MouseEvent) => void

  private _handleClick(e: MouseEvent) {
    this.onClick?.(e)
  }

  @state() private _hasIcon = false

  private _onIconSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement
    const assigned = slot.assignedNodes().filter((n) => n.nodeType === Node.ELEMENT_NODE)
    const hasIcon = assigned.length > 0
    if (this._hasIcon !== hasIcon) {
      queueMicrotask(() => {
        this._hasIcon = hasIcon
      })
    }
  }

  override firstUpdated() {
    const slot = this.renderRoot.querySelector<HTMLSlotElement>('slot[name="icon"]')
    if (slot) {
      const assigned = slot.assignedNodes().filter((n) => n.nodeType === Node.ELEMENT_NODE)
      this._hasIcon = assigned.length > 0
    }
  }

  override render() {
    return html`
      <button
        type=${this.type}
        class="icon-${this.iconPosition} variant-${this.variant} ${this._hasIcon ? 'has-icon' : ''}"
        @click=${this._handleClick}
      >
        <span class="icon-wrapper">
          <slot name="icon" @slotchange=${this._onIconSlotChange}></slot>
        </span>
        <span class="label">${this.label}</span>
      </button>
    `
  }
}
