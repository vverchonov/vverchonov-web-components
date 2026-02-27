import { LitElement, html, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'
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

  override render() {
    return html`
      <button
        type=${this.type}
        class="icon-${this.iconPosition} variant-${this.variant}"
        @click=${this._handleClick}
      >
        <span class="icon-wrapper">
          <slot name="icon"></slot>
        </span>
        <span class="label">${this.label}</span>
      </button>
    `
  }
}
