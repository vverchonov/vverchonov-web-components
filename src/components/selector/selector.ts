import { LitElement, html, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import selectorStyles from './selector.css?inline'
import type { SelectorOption, SelectorGroup, SelectorChangeEventDetail, SelectorState } from './selector-types'

const CHEVRON_SVG = html`
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
       stroke-linejoin="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
`

const CHECK_SVG = html`
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
       stroke-linejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
`

const REMOVE_SVG = html`
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
       stroke-linejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
`

let _uidCounter = 0

/**
 * Dropdown selector (single or multi-select) with search, groups, and validation.
 *
 * @tag app-selector
 * @fires selector-change - Fired when the selection changes. Detail: `{ value: string[] }`.
 */
@customElement('app-selector')
export class Selector extends LitElement {
  static override styles = [unsafeCSS(selectorStyles)]

  private readonly _uid = `app-selector-${++_uidCounter}`

  /** Flat list of selectable options. */
  @property({ attribute: false })
  items: SelectorOption[] = []

  /** Optional group definitions for visually grouping options. */
  @property({ attribute: false })
  groups: SelectorGroup[] = []

  /** Currently selected values (always an array, even in single-select mode). */
  @property({ attribute: false })
  value: string[] = []

  /** Visible label rendered above the trigger. */
  @property({ type: String })
  label = ''

  /** Placeholder text shown when nothing is selected. */
  @property({ type: String })
  placeholder = 'Select…'

  /** Enables a text search input inside the dropdown panel. */
  @property({ type: Boolean })
  searchable = false

  /** Allows selecting more than one option at a time. */
  @property({ type: Boolean })
  multiple = false

  /** Disables the selector and prevents interaction. */
  @property({ type: Boolean })
  disabled = false

  /** Form field name submitted with the value. */
  @property({ type: String })
  name = ''

  /** Validation state controlling visual feedback and ARIA. */
  @property({ type: String })
  state: SelectorState = 'default'

  /** Error text displayed below the selector when `state` is `'invalid'` (attribute: `error-message`). */
  @property({ type: String, attribute: 'error-message' })
  errorMessage = ''

  @state() private _open = false
  @state() private _search = ''
  @state() private _focusedIndex = -1
  @state() private _liveMessage = ''

  override connectedCallback() {
    super.connectedCallback()
    document.addEventListener('click', this._onDocumentClick)
    document.addEventListener('keydown', this._onDocumentKeydown)
  }

  override disconnectedCallback() {
    super.disconnectedCallback()
    document.removeEventListener('click', this._onDocumentClick)
    document.removeEventListener('keydown', this._onDocumentKeydown)
  }

  /* ── Helpers ──────────────────────────────────────────────────────────── */

  private get _filteredItems(): SelectorOption[] {
    if (!this._search) return this.items
    const q = this._search.toLowerCase()
    return this.items.filter(o => o.label.toLowerCase().includes(q))
  }

  private _isSelected(value: string) {
    return this.value.includes(value)
  }

  private _getOptionById(value: string) {
    return this.items.find(o => o.value === value)
  }

  /**
   * Returns filtered items organized by group.
   * Ungrouped items come first, then each group in the order defined by `this.groups`.
   */
  private _getGroupedItems(): Array<{ group: SelectorGroup | null; items: SelectorOption[] }> {
    const filtered = this._filteredItems
    if (this.groups.length === 0) {
      return [{ group: null, items: filtered }]
    }

    const ungrouped: SelectorOption[] = []
    const map = new Map<string, SelectorOption[]>()
    for (const g of this.groups) map.set(g.key, [])

    for (const item of filtered) {
      if (item.group && map.has(item.group)) {
        map.get(item.group)!.push(item)
      } else {
        ungrouped.push(item)
      }
    }

    const result: Array<{ group: SelectorGroup | null; items: SelectorOption[] }> = []
    if (ungrouped.length) result.push({ group: null, items: ungrouped })
    for (const g of this.groups) {
      const items = map.get(g.key)!
      if (items.length) result.push({ group: g, items })
    }
    return result
  }

  /**
   * Flat list of visible option values (for keyboard index tracking).
   * Skips disabled items.
   */
  private get _navigableValues(): string[] {
    return this._filteredItems.filter(o => !o.disabled).map(o => o.value)
  }

  /* ── Selection logic ─────────────────────────────────────────────────── */

  private _select(optionValue: string) {
    const opt = this._getOptionById(optionValue)
    if (!opt || opt.disabled) return

    let next: string[]
    if (this.multiple) {
      next = this._isSelected(optionValue)
        ? this.value.filter(v => v !== optionValue)
        : [...this.value, optionValue]
    } else {
      next = this._isSelected(optionValue) ? [] : [optionValue]
      this._close()
    }

    this.value = next
    this._dispatchChange(next)
    this._announceLive(opt, next.includes(optionValue))
  }

  private _deselect(optionValue: string) {
    const next = this.value.filter(v => v !== optionValue)
    this.value = next
    this._dispatchChange(next)
    const opt = this._getOptionById(optionValue)
    if (opt) this._announceLive(opt, false)
  }

  private _dispatchChange(value: string[]) {
    this.dispatchEvent(
      new CustomEvent<SelectorChangeEventDetail>('selector-change', {
        detail: { value },
        bubbles: true,
        composed: true,
      })
    )
  }

  private _announceLive(opt: SelectorOption, selected: boolean) {
    this._liveMessage = selected
      ? `${opt.label} selected`
      : `${opt.label} removed`
  }

  /* ── Open / close ────────────────────────────────────────────────────── */

  private _toggle() {
    if (this.disabled) return
    this._open ? this._close() : this._openPanel()
  }

  private _openPanel() {
    this._open = true
    this._search = ''
    this._focusedIndex = -1
    this.updateComplete.then(() => {
      this._positionPanel()
      if (this.searchable) {
        this.shadowRoot?.querySelector<HTMLInputElement>('.search-input')?.focus()
      }
    })
  }

  private _close() {
    this._open = false
    this._search = ''
    this._focusedIndex = -1
  }

  private _positionPanel() {
    const trigger = this.shadowRoot?.querySelector<HTMLElement>('.trigger')
    const panel = this.shadowRoot?.querySelector<HTMLElement>('.panel')
    if (!trigger || !panel) return
    const rect = trigger.getBoundingClientRect()
    panel.style.width = `${rect.width}px`
    panel.style.left = `${rect.left}px`

    const spaceBelow = window.innerHeight - rect.bottom - 8
    const panelHeight = panel.scrollHeight
    if (spaceBelow < panelHeight && rect.top > spaceBelow) {
      panel.style.bottom = `${window.innerHeight - rect.top + 4}px`
      panel.style.top = 'auto'
    } else {
      panel.style.top = `${rect.bottom + 4}px`
      panel.style.bottom = 'auto'
    }
  }

  /* ── Document listeners ──────────────────────────────────────────────── */

  private _onDocumentClick = (e: MouseEvent) => {
    if (!this._open) return
    if (!e.composedPath().includes(this)) this._close()
  }

  private _onDocumentKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this._open) {
      this._close()
      this.shadowRoot?.querySelector<HTMLElement>('.trigger')?.focus()
    }
  }

  /* ── Keyboard navigation ─────────────────────────────────────────────── */

  private _onTriggerKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (!this._open) {
          this._openPanel()
          this.updateComplete.then(() => {
            this._focusedIndex = 0
            this._scrollToFocused()
          })
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (!this._open) {
          this._openPanel()
          this.updateComplete.then(() => {
            this._focusedIndex = this._navigableValues.length - 1
            this._scrollToFocused()
          })
        }
        break
    }
  }

  private _onPanelKeydown(e: KeyboardEvent) {
    const nav = this._navigableValues
    if (!nav.length) return

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault()
        this._focusedIndex = this._focusedIndex < nav.length - 1
          ? this._focusedIndex + 1
          : 0
        this._scrollToFocused()
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        this._focusedIndex = this._focusedIndex > 0
          ? this._focusedIndex - 1
          : nav.length - 1
        this._scrollToFocused()
        break
      }
      case 'Home': {
        e.preventDefault()
        this._focusedIndex = 0
        this._scrollToFocused()
        break
      }
      case 'End': {
        e.preventDefault()
        this._focusedIndex = nav.length - 1
        this._scrollToFocused()
        break
      }
      case 'Enter':
      case ' ': {
        e.preventDefault()
        if (this._focusedIndex >= 0 && this._focusedIndex < nav.length) {
          this._select(nav[this._focusedIndex])
        }
        break
      }
      case 'Escape': {
        e.preventDefault()
        this._close()
        this.shadowRoot?.querySelector<HTMLElement>('.trigger')?.focus()
        break
      }
    }
  }

  private _scrollToFocused() {
    this.updateComplete.then(() => {
      const focused = this.shadowRoot?.querySelector('.option.is-focused')
      focused?.scrollIntoView({ block: 'nearest' })
    })
  }

  /* ── Search handling ─────────────────────────────────────────────────── */

  private _onSearchInput(e: Event) {
    this._search = (e.target as HTMLInputElement).value
    this._focusedIndex = -1
  }

  /* ── Chip remove (stop event propagation so trigger doesn't toggle) ─── */

  private _onChipRemove(e: Event, value: string) {
    e.stopPropagation()
    this._deselect(value)
  }

  /* ── Render helpers ──────────────────────────────────────────────────── */

  private _renderOptionIcon(item: SelectorOption) {
    if (item.icon == null) return nothing
    if (typeof item.icon === 'string') {
      return html`<span class="option-icon"><slot name=${`icon-${item.icon}`}></slot></span>`
    }
    return html`<span class="option-icon">${item.icon}</span>`
  }

  private _renderChipIcon(item: SelectorOption) {
    if (item.icon == null) return nothing
    if (typeof item.icon === 'string') return nothing
    return html`<span class="chip-icon">${item.icon}</span>`
  }

  private _renderTriggerContent() {
    if (this.value.length === 0) {
      return html`<span class="placeholder">${this.placeholder}</span>`
    }

    if (!this.multiple) {
      const opt = this._getOptionById(this.value[0])
      if (!opt) return html`<span class="placeholder">${this.placeholder}</span>`
      return html`
        <span class="single-value">
          ${this._renderChipIcon(opt)}
          ${opt.label}
        </span>
      `
    }

    return repeat(
      this.value,
      v => v,
      v => {
        const opt = this._getOptionById(v)
        if (!opt) return nothing
        return html`
          <span class="chip">
            ${this._renderChipIcon(opt)}
            <span class="chip-label">${opt.label}</span>
            <button
              type="button"
              class="chip-remove"
              aria-label="Remove ${opt.label}"
              @click=${(e: Event) => this._onChipRemove(e, v)}
              @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); this._deselect(v) } }}
            >${REMOVE_SVG}</button>
          </span>
        `
      }
    )
  }

  private _renderOptions() {
    const grouped = this._getGroupedItems()
    const nav = this._navigableValues
    const hasAny = grouped.some(g => g.items.length > 0)

    if (!hasAny) {
      return html`<div class="empty-message">No options found</div>`
    }

    return grouped.map(({ group, items }) => html`
      ${group ? html`<div class="group-header" role="presentation">${group.label}</div>` : nothing}
      ${repeat(
        items,
        o => o.value,
        o => {
          const selected = this._isSelected(o.value)
          const navIdx = nav.indexOf(o.value)
          const focused = navIdx === this._focusedIndex
          return html`
            <div
              role="option"
              aria-selected=${selected ? 'true' : 'false'}
              aria-disabled=${o.disabled ? 'true' : 'false'}
              id=${`${this._uid}-opt-${o.value}`}
              class="option ${selected ? 'is-selected' : ''} ${focused ? 'is-focused' : ''} ${o.disabled ? 'is-disabled' : ''}"
              @click=${() => this._select(o.value)}
            >
              ${this.multiple
                ? html`<span class="option-check">${CHECK_SVG}</span>`
                : nothing}
              ${this._renderOptionIcon(o)}
              <span class="option-label">${o.label}</span>
            </div>
          `
        }
      )}
    `)
  }

  /* ── Main render ─────────────────────────────────────────────────────── */

  override render() {
    const errorId = `${this._uid}-error`
    const hasError = this.state === 'invalid' && this.errorMessage
    const listboxId = `${this._uid}-listbox`
    const nav = this._navigableValues
    const activeDescendant = this._focusedIndex >= 0 && this._focusedIndex < nav.length
      ? `${this._uid}-opt-${nav[this._focusedIndex]}`
      : undefined

    return html`
      <div class="wrapper">
        ${this.label
          ? html`<label id=${`${this._uid}-label`} class="label">${this.label}</label>`
          : nothing}
        <div
          class="trigger ${this._open ? 'is-open' : ''} ${this.disabled ? 'is-disabled' : ''}"
          role="combobox"
          aria-expanded=${this._open ? 'true' : 'false'}
          aria-haspopup="listbox"
          aria-owns=${listboxId}
          aria-labelledby=${this.label ? `${this._uid}-label` : nothing}
          aria-describedby=${hasError ? errorId : nothing}
          aria-activedescendant=${activeDescendant ?? nothing}
          tabindex=${this.disabled ? '-1' : '0'}
          @click=${this._toggle}
          @keydown=${this._onTriggerKeydown}
        >
          ${this._renderTriggerContent()}
          <span class="chevron">${CHEVRON_SVG}</span>
        </div>

        <div
          id=${listboxId}
          class="panel ${this._open ? 'is-open' : ''}"
          role="listbox"
          aria-multiselectable=${this.multiple ? 'true' : 'false'}
          aria-label=${this.label || 'Options'}
          @keydown=${this._onPanelKeydown}
        >
          ${this.searchable ? html`
            <div class="search-wrapper">
              <input
                type="text"
                class="search-input"
                placeholder="Search…"
                .value=${this._search}
                @input=${this._onSearchInput}
                @keydown=${this._onPanelKeydown}
                aria-label="Search options"
              />
            </div>
          ` : nothing}
          <div class="option-list">
            ${this._renderOptions()}
          </div>
        </div>

        <span class="sr-only" aria-live="polite">${this._liveMessage}</span>

        ${hasError
          ? html`<span id=${errorId} class="error-text" role="alert">${this.errorMessage}</span>`
          : nothing}
      </div>
    `
  }
}
