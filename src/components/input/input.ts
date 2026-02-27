import { LitElement, html, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type { InputType, InputState } from './input-types.ts'
import inputStyles from './input.css?inline'

let _uidCounter = 0

/**
 * Text input with optional label, leading icon slot, and validation state.
 *
 * @tag app-input
 * @slot icon - Optional leading icon displayed before the input field.
 */
@customElement('app-input')
export class Input extends LitElement {
  static override styles = [unsafeCSS(inputStyles)]

  private readonly _uid = `app-input-${++_uidCounter}`

  /** HTML input type. */
  @property({ type: String })
  type: InputType = 'text'

  /** Visible label rendered above the input. */
  @property({ type: String })
  label = ''

  /** Placeholder text shown when the input is empty. */
  @property({ type: String })
  placeholder = ''

  /** Current input value (two-way: updates on user input). */
  @property({ type: String })
  value = ''

  /** Form field name submitted with the value. */
  @property({ type: String })
  name = ''

  /** Marks the input as required for form validation. */
  @property({ type: Boolean })
  required = false

  /** Disables the input and prevents interaction. */
  @property({ type: Boolean })
  disabled = false

  /** Makes the input read-only (focusable but not editable). */
  @property({ type: Boolean })
  readonly = false

  /** Validation state controlling visual feedback and ARIA. */
  @property({ type: String })
  state: InputState = 'default'

  /** Error text displayed below the input when `state` is `'invalid'` (attribute: `error-message`). */
  @property({ type: String, attribute: 'error-message' })
  errorMessage = ''

  /** Callback invoked with the new value string on every input event. Set via property. */
  @property({ attribute: false })
  onChange?: (value: string) => void

  @state() private _hasIcon = false

  private _onIconSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement
    this._hasIcon = slot.assignedNodes({ flatten: true }).length > 0
  }

  private _handleInput(e: Event) {
    const input = e.target as HTMLInputElement
    this.value = input.value
    this.onChange?.(this.value)
  }

  private _renderStateIcon() {
    if (this.state === 'valid') {
      return html`
        <span class="state-icon state-icon--valid" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" />
          </svg>
        </span>
      `
    }
    if (this.state === 'invalid') {
      return html`
        <span class="state-icon state-icon--invalid" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
          </svg>
        </span>
      `
    }
    return html``
  }

  override render() {
    const errorId = `${this._uid}-error`
    const hasError = this.state === 'invalid' && this.errorMessage

    return html`
      <div class="wrapper">
        ${this.label
          ? html`<label for=${this._uid} class="label">${this.label}</label>`
          : ''}
        <div class="input-row ${this._hasIcon ? 'has-icon' : ''}">
          <span class="icon-wrapper">
            <slot name="icon" @slotchange=${this._onIconSlotChange}></slot>
          </span>
          <input
            id=${this._uid}
            type=${this.type}
            name=${this.name}
            placeholder=${this.placeholder}
            .value=${this.value}
            ?required=${this.required}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            aria-invalid=${this.state === 'invalid' ? 'true' : 'false'}
            aria-describedby=${hasError ? errorId : ''}
            @input=${this._handleInput}
          />
          ${this._renderStateIcon()}
        </div>
        ${hasError
          ? html`<span id=${errorId} class="error-text" role="alert">${this.errorMessage}</span>`
          : ''}
      </div>
    `
  }
}
