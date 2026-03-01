import { LitElement, html, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import dropdownButtonStyles from './dropdown-button.css?inline'
import type {
  DropdownItem,
  DropdownGroup,
  DropdownPlacement,
  DropdownSelectEventDetail,
} from './dropdown-button-types'

const CHEVRON_SVG = html`
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
       stroke-linejoin="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
`

let _uidCounter = 0

/**
 * Button that opens a menu of selectable actions, with optional icons and grouped items.
 *
 * @tag app-dropdown-button
 * @slot icon - Optional icon in the trigger button (e.g. ellipsis for "More"). Shown before the label.
 * @fires dropdown-select - Fired when a menu item is chosen. Detail: `{ item, value? }`.
 */
@customElement('app-dropdown-button')
export class DropdownButton extends LitElement {
  static override styles = [unsafeCSS(dropdownButtonStyles)]

  private readonly _uid = `app-dropdown-button-${++_uidCounter}`

  /** Trigger button text. Omit or leave empty for icon-only trigger when using `slot="icon"`. */
  @property({ type: String })
  label = ''

  /** Preferred direction for the panel. Automatically flips when there is not enough viewport space. */
  @property({ type: String })
  placement: DropdownPlacement = 'bottom'

  /** Menu items: `{ label, value?, icon?, group?, disabled? }`. Set via property. */
  @property({ attribute: false })
  items: DropdownItem[] = []

  /** Optional group definitions for visually grouping items. */
  @property({ attribute: false })
  groups: DropdownGroup[] = []

  @state() private _open = false
  @state() private _focusedIndex = -1
  @state() private _hasIcon = false

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

  /**
   * Returns items organized by group.
   * Ungrouped items come first, then each group in the order defined by `this.groups`.
   */
  private _getGroupedItems(): Array<{ group: DropdownGroup | null; items: DropdownItem[] }> {
    if (this.groups.length === 0) {
      return [{ group: null, items: this.items }]
    }

    const ungrouped: DropdownItem[] = []
    const map = new Map<string, DropdownItem[]>()
    for (const g of this.groups) map.set(g.key, [])

    for (const item of this.items) {
      if (item.group && map.has(item.group)) {
        map.get(item.group)!.push(item)
      } else {
        ungrouped.push(item)
      }
    }

    const result: Array<{ group: DropdownGroup | null; items: DropdownItem[] }> = []
    if (ungrouped.length) result.push({ group: null, items: ungrouped })
    for (const g of this.groups) {
      const items = map.get(g.key)!
      if (items.length) result.push({ group: g, items })
    }
    return result
  }

  /** Flat list of selectable items for keyboard navigation (excludes disabled). */
  private get _navigableItems(): DropdownItem[] {
    return this.items.filter((o) => !o.disabled)
  }

  /* ── Selection ─────────────────────────────────────────────────────────── */

  private _select(item: DropdownItem) {
    if (item.disabled) return
    this.dispatchEvent(
      new CustomEvent<DropdownSelectEventDetail>('dropdown-select', {
        detail: { item, value: item.value },
        bubbles: true,
        composed: true,
      }),
    )
    this._close()
  }

  /* ── Open / close ─────────────────────────────────────────────────────── */

  private _toggle() {
    this._open ? this._close() : this._openPanel()
  }

  private _openPanel() {
    this._open = true
    this._focusedIndex = -1
    this.updateComplete.then(() => {
      this._positionPanel()
    })
  }

  private _close() {
    this._open = false
    this._focusedIndex = -1
    this.shadowRoot?.querySelector<HTMLElement>('.trigger')?.focus()
  }

  private _positionPanel() {
    const trigger = this.shadowRoot?.querySelector<HTMLElement>('.trigger')
    const panel = this.shadowRoot?.querySelector<HTMLElement>('.panel')
    if (!trigger || !panel) return
    const rect = trigger.getBoundingClientRect()
    panel.style.minWidth = `${rect.width}px`
    panel.style.left = `${rect.left}px`

    const spaceBelow = window.innerHeight - rect.bottom - 8
    const panelHeight = panel.scrollHeight
    const preferBottom = this.placement === 'bottom'
    const flipUp = preferBottom && spaceBelow < panelHeight && rect.top > spaceBelow
    const flipDown = !preferBottom && rect.top < panelHeight && rect.bottom < window.innerHeight - panelHeight

    if (flipUp || flipDown) {
      panel.style.bottom = `${window.innerHeight - rect.top + 4}px`
      panel.style.top = 'auto'
    } else {
      panel.style.top = `${rect.bottom + 4}px`
      panel.style.bottom = 'auto'
    }
  }

  /* ── Document listeners ────────────────────────────────────────────────── */

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

  /* ── Keyboard navigation ───────────────────────────────────────────────── */

  private _onTriggerKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (!this._open && this.items.length > 0) {
          this._openPanel()
          this.updateComplete.then(() => {
            this._focusedIndex = 0
            this._scrollToFocused()
          })
        } else if (this._open) {
          this._onPanelKeydown(e)
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (!this._open && this.items.length > 0) {
          this._openPanel()
          this.updateComplete.then(() => {
            this._focusedIndex = this._navigableItems.length - 1
            this._scrollToFocused()
          })
        } else if (this._open) {
          this._onPanelKeydown(e)
        }
        break
    }
  }

  private _onPanelKeydown(e: KeyboardEvent) {
    const nav = this._navigableItems
    if (!nav.length) return

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault()
        this._focusedIndex =
          this._focusedIndex < nav.length - 1 ? this._focusedIndex + 1 : 0
        this._scrollToFocused()
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        this._focusedIndex =
          this._focusedIndex > 0 ? this._focusedIndex - 1 : nav.length - 1
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
        break
      }
    }
  }

  private _scrollToFocused() {
    this.updateComplete.then(() => {
      const focused = this.shadowRoot?.querySelector('.item.is-focused')
      focused?.scrollIntoView({ block: 'nearest' })
    })
  }

  /* ── Slot change ────────────────────────────────────────────────────────── */

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

  /* ── Render helpers ────────────────────────────────────────────────────── */

  private _renderItemIcon(item: DropdownItem) {
    if (item.icon == null) return nothing
    return html`<span class="item-icon">${item.icon}</span>`
  }

  private _renderMenuItems() {
    const grouped = this._getGroupedItems()
    const nav = this._navigableItems
    const hasAny = grouped.some((g) => g.items.length > 0)

    if (!hasAny) {
      return html`<div class="empty-message">No items</div>`
    }

    return grouped.map(
      ({ group, items }) => html`
        ${group ? html`<div class="group-header" role="presentation">${group.label}</div>` : nothing}
        ${repeat(
          items,
          (o) => o.value ?? o.label,
          (o) => {
            const navIdx = nav.findIndex(
              (n) => (n.value ?? n.label) === (o.value ?? o.label),
            )
            const focused = navIdx === this._focusedIndex
            return html`
              <button
                type="button"
                role="menuitem"
                aria-disabled=${o.disabled ? 'true' : 'false'}
                id=${`${this._uid}-item-${navIdx}`}
                class="item ${focused ? 'is-focused' : ''} ${o.disabled ? 'is-disabled' : ''}"
                ?disabled=${o.disabled}
                @click=${() => this._select(o)}
                @mouseenter=${() => {
                  if (!o.disabled) this._focusedIndex = navIdx
                }}
              >
                ${this._renderItemIcon(o)}
                <span class="item-label">${o.label}</span>
              </button>
            `
          },
        )}
      `,
    )
  }

  /* ── Main render ───────────────────────────────────────────────────────── */

  override render() {
    const menuId = `${this._uid}-menu`
    const nav = this._navigableItems
    const activeDescendant =
      this._open && this._focusedIndex >= 0 && this._focusedIndex < nav.length
        ? `${this._uid}-item-${this._focusedIndex}`
        : undefined

    return html`
      <div class="wrapper">
        <button
          type="button"
          class="trigger ${this._open ? 'is-open' : ''} ${this._hasIcon ? 'has-icon' : ''}"
          aria-haspopup="menu"
          aria-expanded=${this._open ? 'true' : 'false'}
          aria-controls=${menuId}
          aria-label=${this.label || 'Open menu'}
          @click=${this._toggle}
          @keydown=${this._onTriggerKeydown}
        >
          <span class="icon-wrapper">
            <slot name="icon" @slotchange=${this._onIconSlotChange}></slot>
          </span>
          ${this.label ? html`<span class="label">${this.label}</span>` : nothing}
          <span class="chevron">${CHEVRON_SVG}</span>
        </button>

        <div
          id=${menuId}
          class="panel ${this._open ? 'is-open' : ''}"
          role="menu"
          aria-label=${this.label || 'Menu'}
          aria-activedescendant=${activeDescendant ?? nothing}
          @keydown=${this._onPanelKeydown}
        >
          <div class="menu-list">${this._renderMenuItems()}</div>
        </div>
      </div>
    `
  }
}
