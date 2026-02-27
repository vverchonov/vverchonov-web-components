import { LitElement, html, unsafeCSS, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { CardVariant, CardToggleEventDetail } from './card-types.ts'
import cardStyles from './card.css?inline'

/**
 * Collapsible card with title, body, and footer slots, three visual variants,
 * and optional click interaction.
 *
 * @tag app-card
 * @slot title - Header content, always visible. Clicking toggles the body open/closed.
 * @slot - Default slot for the card body content (hidden when collapsed).
 * @slot footer - Bottom actions area (hidden when collapsed).
 * @fires card-toggle - Fires when the card is toggled open or closed. Detail: `{ open: boolean }`.
 */
@customElement('app-card')
export class Card extends LitElement {
  static override styles = [unsafeCSS(cardStyles)]

  /** Visual style variant. */
  @property({ type: String })
  variant: CardVariant = 'elevated'

  /** Whether the card body is expanded. */
  @property({ type: Boolean, reflect: true })
  open = true

  /** Enables hover/active effects and click handling on the card. */
  @property({ type: Boolean })
  clickable = false

  /** Optional click callback. Set via property (e.g. `el.onClick = (e) => ...`). */
  @property({ attribute: false })
  onClick?: (e: MouseEvent) => void

  private _toggle() {
    this.open = !this.open
    this.dispatchEvent(
      new CustomEvent<CardToggleEventDetail>('card-toggle', {
        detail: { open: this.open },
        bubbles: true,
        composed: true,
      })
    )
  }

  private _handleCardClick(e: MouseEvent) {
    if (!this.clickable) return
    this.onClick?.(e)
  }

  override render() {
    const classes = [
      'card',
      `variant-${this.variant}`,
      this.clickable ? 'clickable' : '',
    ]
      .filter(Boolean)
      .join(' ')

    return html`
      <div
        class=${classes}
        @click=${this._handleCardClick}
        role=${this.clickable ? 'button' : nothing}
        tabindex=${this.clickable ? '0' : nothing}
      >
        <button
          class="header"
          type="button"
          aria-expanded=${this.open}
          @click=${(e: MouseEvent) => {
            e.stopPropagation()
            this._toggle()
          }}
        >
          <span class="header-content">
            <slot name="title"></slot>
          </span>
          <svg
            class="chevron ${this.open ? 'rotated' : ''}"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        <div class="body-wrapper ${this.open ? 'open' : ''}">
          <div class="body-inner">
            <div class="body">
              <slot></slot>
            </div>
            <div class="footer">
              <slot name="footer"></slot>
            </div>
          </div>
        </div>
      </div>
    `
  }
}
