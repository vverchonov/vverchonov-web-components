import { LitElement, html, unsafeCSS } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import type { ModalVariant, ModalSize } from './modal-types.ts'
import modalStyles from './modal.css?inline'

/**
 * Configurable dialog for info, confirm, form, and custom use-cases.
 *
 * Info (single OK button):
 *   <app-modal open title="Note" description="Saved." variant="info"></app-modal>
 *
 * Confirm (two buttons):
 *   <app-modal open title="Delete?" description="Cannot be undone." variant="confirm"></app-modal>
 *
 * Form (two buttons + slotted content):
 *   <app-modal open title="Edit profile" variant="form">
 *     <app-input label="Name"></app-input>
 *   </app-modal>
 *
 * Custom footer buttons (footer slot replaces built-in actions):
 *   <app-modal open title="Request">
 *     <app-input label="Subject"></app-input>
 *     <div slot="footer">
 *       <app-button label="Save draft"></app-button>
 *       <app-button label="Submit"></app-button>
 *     </div>
 *   </app-modal>
 *
 * Embedded multi-step form (hide-actions + flush + seamless form-layout):
 *   <app-modal open title="Create account" hide-actions flush size="lg">
 *     <app-form-layout seamless .stages=${[…]}>…</app-form-layout>
 *   </app-modal>
 *
 * @tag app-modal
 * @slot - Default slot for body content.
 * @slot footer - Custom footer that replaces the built-in action buttons.
 * @fires modal-confirm - Primary action (Save / Confirm / OK) clicked.
 * @fires modal-cancel - Secondary action (Cancel) clicked.
 * @fires modal-close - Any close action (Escape, backdrop, OK, Confirm, Cancel).
 */
@customElement('app-modal')
export class Modal extends LitElement {
  static override styles = [unsafeCSS(modalStyles)]

  /** Whether the modal is visible. Reflect so CSS :host([open]) works. */
  @property({ type: Boolean, reflect: true })
  open = false

  /** Dialog heading. */
  @property({ type: String })
  title = ''

  /** Subtitle / body text shown below the title (optional). */
  @property({ type: String })
  description = ''

  /**
   * Controls the built-in button layout:
   * - `info`    → single OK button
   * - `confirm` → Cancel + Confirm
   * - `form`    → Cancel + Save
   */
  @property({ type: String })
  variant: ModalVariant = 'info'

  /**
   * Dialog width:
   * - `sm`  → 24rem
   * - `md`  → 32rem (default, uses --modal-width token)
   * - `lg`  → 44rem (good for multi-step forms)
   */
  @property({ type: String })
  size: ModalSize = 'md'

  /** Label for the primary action button. Defaults to variant-appropriate text. */
  @property({ type: String, attribute: 'confirm-label' })
  confirmLabel = ''

  /** Label for the cancel button. */
  @property({ type: String, attribute: 'cancel-label' })
  cancelLabel = 'Cancel'

  /** Label for the OK button (info variant only). */
  @property({ type: String, attribute: 'ok-label' })
  okLabel = 'OK'

  /** Close the modal when the backdrop is clicked. */
  @property({ type: Boolean, attribute: 'close-on-backdrop' })
  closeOnBackdrop = true

  /**
   * Hide the built-in footer (divider + action buttons).
   * Use when the slotted content manages its own actions (e.g. app-form-layout).
   * Has no effect when the `footer` slot is populated — the slot always shows.
   */
  @property({ type: Boolean, attribute: 'hide-actions' })
  hideActions = false

  /**
   * Remove body padding so slotted content fills edge-to-edge.
   * Pair with `seamless` on app-form-layout for a clean embedded form.
   */
  @property({ type: Boolean })
  flush = false

  /** True when the named `footer` slot has slotted content. */
  @state()
  private _hasFooterContent = false

  @query('.dialog')
  private _dialog!: HTMLElement

  /** The element that had focus before the modal opened — restored on close. */
  private _previousFocus: HTMLElement | null = null

  override updated(changed: Map<string, unknown>) {
    if (changed.has('open')) {
      if (this.open) {
        this._previousFocus = document.activeElement as HTMLElement
        requestAnimationFrame(() => this._focusFirst())
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
        this._previousFocus?.focus()
        this._previousFocus = null
      }
    }
  }

  override connectedCallback() {
    super.connectedCallback()
    this.addEventListener('keydown', this._handleKeydown)
  }

  override disconnectedCallback() {
    super.disconnectedCallback()
    this.removeEventListener('keydown', this._handleKeydown)
    document.body.style.overflow = ''
  }

  private _handleKeydown = (e: KeyboardEvent) => {
    if (!this.open) return
    if (e.key === 'Escape') {
      e.stopPropagation()
      this._close()
    }
    if (e.key === 'Tab') {
      this._trapFocus(e)
    }
  }

  private _focusableSelectors = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ')

  private _getFocusable(): HTMLElement[] {
    if (!this._dialog) return []
    return Array.from(
      this._dialog.querySelectorAll<HTMLElement>(this._focusableSelectors)
    )
  }

  private _focusFirst() {
    const els = this._getFocusable()
    if (els.length) els[0].focus()
    else this._dialog?.focus()
  }

  private _trapFocus(e: KeyboardEvent) {
    const els = this._getFocusable()
    if (!els.length) return
    const first = els[0]
    const last = els[els.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  private _handleBackdropClick(e: MouseEvent) {
    if (!this.closeOnBackdrop) return
    if (e.target === e.currentTarget) this._close()
  }

  private _close() {
    this.open = false
    this.dispatchEvent(new CustomEvent('modal-close', { bubbles: true, composed: true }))
  }

  private _handleConfirm() {
    this.dispatchEvent(new CustomEvent('modal-confirm', { bubbles: true, composed: true }))
    this._close()
  }

  private _handleCancel() {
    this.dispatchEvent(new CustomEvent('modal-cancel', { bubbles: true, composed: true }))
    this._close()
  }

  private get _resolvedConfirmLabel(): string {
    if (this.confirmLabel) return this.confirmLabel
    return this.variant === 'form' ? 'Save' : 'Confirm'
  }

  private _onFooterSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement
    this._hasFooterContent = slot.assignedNodes({ flatten: true }).length > 0
  }

  private _renderBuiltInActions() {
    if (this.variant === 'info') {
      return html`
        <div class="actions actions--center">
          <button type="button" class="btn btn--primary" @click=${this._handleConfirm}>
            ${this.okLabel}
          </button>
        </div>
      `
    }
    return html`
      <div class="actions">
        <button type="button" class="btn btn--ghost" @click=${this._handleCancel}>
          ${this.cancelLabel}
        </button>
        <button type="button" class="btn btn--primary" @click=${this._handleConfirm}>
          ${this._resolvedConfirmLabel}
        </button>
      </div>
    `
  }

  /**
   * Whether the footer area (divider + buttons) should be visible at all.
   * Hidden only when hide-actions=true AND the footer slot has no content.
   */
  private get _showFooter(): boolean {
    return this._hasFooterContent || !this.hideActions
  }

  override render() {
    if (!this.open) return html``

    return html`
      <div
        class="backdrop"
        @click=${this._handleBackdropClick}
        aria-hidden="true"
      ></div>

      <div
        class="dialog dialog--${this.size}"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby=${this.description ? 'modal-desc' : ''}
        tabindex="-1"
      >
        <header class="header">
          <h2 class="title" id="modal-title">${this.title}</h2>
          <button
            type="button"
            class="close-btn"
            aria-label="Close dialog"
            @click=${this._close}
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="16" height="16">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
            </svg>
          </button>
        </header>

        ${this.description ? html`
          <p class="description" id="modal-desc">${this.description}</p>
        ` : ''}

        <div class="body ${this.flush ? 'body--flush' : ''}">
          <slot></slot>
        </div>

        <!--
          Footer slot is always rendered (even when hide-actions) so slotchange
          fires correctly. The outer .footer wrapper hides via [hidden] when
          hide-actions=true AND the slot is empty.
        -->
        <div class="footer" ?hidden=${!this._showFooter}>
          <div class="divider" aria-hidden="true"></div>
          <!-- Custom footer: slot content replaces built-in action buttons -->
          <div class="footer-slot ${this._hasFooterContent ? 'footer-slot--active' : ''}">
            <slot name="footer" @slotchange=${this._onFooterSlotChange}></slot>
          </div>
          <!-- Built-in actions: shown only when footer slot is empty -->
          ${!this._hasFooterContent ? this._renderBuiltInActions() : ''}
        </div>
      </div>
    `
  }
}
