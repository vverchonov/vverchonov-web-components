import { LitElement, html, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type {
  RadioGroupItem,
  RadioGroupOrientation,
  RadioGroupState,
  RadioGroupChangeEventDetail,
} from './radio-group-types'
import radioGroupStyles from './radio-group.css?inline'

let _uidCounter = 0

/**
 * Radio group for single-option selection with keyboard navigation and validation.
 *
 * @tag app-radio-group
 * @fires radio-change - Fired when the selected option changes. Detail: `{ value: string }`.
 */
@customElement('app-radio-group')
export class RadioGroup extends LitElement {
  static override styles = [unsafeCSS(radioGroupStyles)]

  private readonly _uid = `app-radio-group-${++_uidCounter}`

  /** Array of selectable radio options. */
  @property({ attribute: false })
  items: RadioGroupItem[] = []

  /** Currently selected value. */
  @property({ type: String })
  value = ''

  /** Visible label rendered above the radio options. */
  @property({ type: String })
  label = ''

  /** Form field name. */
  @property({ type: String })
  name = ''

  /** Disables the entire group. */
  @property({ type: Boolean, reflect: true })
  disabled = false

  /** Layout direction: vertical (default) or horizontal. */
  @property({ type: String })
  orientation: RadioGroupOrientation = 'vertical'

  /** Validation state controlling visual feedback and ARIA. */
  @property({ type: String })
  state: RadioGroupState = 'default'

  /** Error text displayed below the group when `state` is `'invalid'` (attribute: `error-message`). */
  @property({ type: String, attribute: 'error-message' })
  errorMessage = ''

  /** Optional callback invoked with the `radio-change` custom event. Set via property. */
  @property({ attribute: false })
  onChange?: (e: CustomEvent<RadioGroupChangeEventDetail>) => void

  @state() private _focusedIndex = -1

  private get _enabledItems(): RadioGroupItem[] {
    return this.items.filter(item => !item.disabled)
  }

  private _select(item: RadioGroupItem) {
    if (this.disabled || item.disabled) return
    if (this.value === item.value) return

    this.value = item.value
    const event = new CustomEvent<RadioGroupChangeEventDetail>('radio-change', {
      detail: { value: item.value },
      bubbles: true,
      composed: true,
    })
    this.dispatchEvent(event)
    this.onChange?.(event)
  }

  private _onRadioClick(item: RadioGroupItem, index: number) {
    this._focusedIndex = index
    this._select(item)
  }

  private _onKeydown(e: KeyboardEvent) {
    const enabled = this._enabledItems
    if (!enabled.length) return

    const prevKeys = this.orientation === 'vertical'
      ? ['ArrowUp', 'ArrowLeft']
      : ['ArrowLeft', 'ArrowUp']
    const nextKeys = this.orientation === 'vertical'
      ? ['ArrowDown', 'ArrowRight']
      : ['ArrowRight', 'ArrowDown']

    let newIndex = this._focusedIndex

    if (prevKeys.includes(e.key)) {
      e.preventDefault()
      const currentEnabledIdx = this._enabledIndexFromAbsolute(this._focusedIndex)
      const prevEnabledIdx = currentEnabledIdx <= 0 ? enabled.length - 1 : currentEnabledIdx - 1
      newIndex = this.items.indexOf(enabled[prevEnabledIdx])
    } else if (nextKeys.includes(e.key)) {
      e.preventDefault()
      const currentEnabledIdx = this._enabledIndexFromAbsolute(this._focusedIndex)
      const nextEnabledIdx = currentEnabledIdx >= enabled.length - 1 ? 0 : currentEnabledIdx + 1
      newIndex = this.items.indexOf(enabled[nextEnabledIdx])
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      if (this._focusedIndex >= 0 && this._focusedIndex < this.items.length) {
        this._select(this.items[this._focusedIndex])
      }
      return
    } else {
      return
    }

    this._focusedIndex = newIndex
    this._select(this.items[newIndex])
    this._focusOption(newIndex)
  }

  private _enabledIndexFromAbsolute(absIndex: number): number {
    const item = this.items[absIndex]
    const idx = this._enabledItems.indexOf(item)
    return idx >= 0 ? idx : 0
  }

  private _focusOption(index: number) {
    this.updateComplete.then(() => {
      const el = this.shadowRoot?.querySelector<HTMLElement>(`#${this._uid}-opt-${index}`)
      el?.focus()
    })
  }

  private _onFocus(index: number) {
    this._focusedIndex = index
  }

  private _getInitialTabIndex(item: RadioGroupItem, index: number): string {
    if (this.disabled || item.disabled) return '-1'
    if (this.value) {
      return item.value === this.value ? '0' : '-1'
    }
    const firstEnabled = this.items.findIndex(i => !i.disabled)
    return index === firstEnabled ? '0' : '-1'
  }

  override render() {
    const errorId = `${this._uid}-error`
    const labelId = `${this._uid}-label`
    const hasError = this.state === 'invalid' && this.errorMessage

    return html`
      <div class="wrapper">
        ${this.label
          ? html`<span id=${labelId} class="label">${this.label}</span>`
          : nothing}

        <div
          class="group orientation-${this.orientation} state-${this.state}"
          role="radiogroup"
          aria-labelledby=${this.label ? labelId : nothing}
          aria-describedby=${hasError ? errorId : nothing}
          @keydown=${this._onKeydown}
        >
          ${this.items.map((item, i) => {
            const checked = item.value === this.value
            const isDisabled = this.disabled || !!item.disabled
            return html`
              <div
                id=${`${this._uid}-opt-${i}`}
                class="radio ${checked ? 'is-checked' : ''} ${isDisabled ? 'is-disabled' : ''}"
                role="radio"
                aria-checked=${checked ? 'true' : 'false'}
                aria-disabled=${isDisabled ? 'true' : 'false'}
                tabindex=${this._getInitialTabIndex(item, i)}
                @click=${() => this._onRadioClick(item, i)}
                @focus=${() => this._onFocus(i)}
              >
                <span class="radio-circle" aria-hidden="true"></span>
                <span class="radio-label">${item.label}</span>
              </div>
            `
          })}
        </div>

        ${hasError
          ? html`<span id=${errorId} class="error-text" role="alert">${this.errorMessage}</span>`
          : nothing}
      </div>
    `
  }
}
