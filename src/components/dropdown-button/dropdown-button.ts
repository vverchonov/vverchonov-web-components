import { LitElement, html, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import type { TemplateResult } from 'lit'
import dropdownButtonStyles from './dropdown-button.css?inline'
import type { DropdownItem, DropdownSelectEventDetail, DropdownPlacement } from './dropdown-button-types'

const CHEVRON_SVG = html`
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
`

/**
 * Button that opens a dropdown menu with nested sub-menu support.
 *
 * @tag app-dropdown-button
 * @slot icon - Optional icon shown in the trigger button.
 * @fires dropdown-select - Fired when a leaf item is selected. Detail: `{ item, value }`.
 */
@customElement('app-dropdown-button')
export class DropdownButton extends LitElement {
  static override styles = [unsafeCSS(dropdownButtonStyles)]

  /** Text label displayed in the trigger button. */
  @property({ type: String })
  label = ''

  /** Preferred direction for the dropdown panel. Auto-flips when insufficient viewport space. */
  @property({ type: String })
  placement: DropdownPlacement = 'bottom'

  /** Menu items (supports nested `children` for sub-menus). */
  @property({ attribute: false })
  items: DropdownItem[] = []

  @state() private _open = false

  /**
   * Tracks which parent-item paths have their inline submenus expanded.
   * Paths use dash-separated indices, e.g. "1" for the second top-level item,
   * "1-0" for its first child, etc.
   * We always assign a new Set so Lit detects the change.
   */
  @state() private _openPaths = new Set<string>()

  override connectedCallback() {
    super.connectedCallback()
    document.addEventListener('mousedown', this._onDocumentMousedown, { capture: true })
    document.addEventListener('keydown', this._onDocumentKeydown)
  }

  override disconnectedCallback() {
    super.disconnectedCallback()
    document.removeEventListener('mousedown', this._onDocumentMousedown, { capture: true })
    document.removeEventListener('keydown', this._onDocumentKeydown)
  }

  private _onDocumentMousedown = (e: MouseEvent) => {
    if (!this._open) return
    if (!e.composedPath().includes(this)) {
      this._open = false
      this._openPaths = new Set()
    }
  }

  private _onDocumentKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this._open) {
      this._open = false
      this._openPaths = new Set()
      this.shadowRoot?.querySelector<HTMLElement>('.trigger')?.focus()
    }
  }

  private _toggle() {
    this._open = !this._open
    if (!this._open) this._openPaths = new Set()
    if (this._open) {
      this.updateComplete.then(() => this._positionPanel())
    }
  }

  private _positionPanel() {
    const trigger = this.shadowRoot?.querySelector<HTMLElement>('.trigger')
    const panel = this.shadowRoot?.querySelector<HTMLElement>('.panel')
    if (!trigger || !panel) return

    const triggerRect = trigger.getBoundingClientRect()

    panel.style.visibility = 'hidden'
    panel.style.display = 'block'
    const panelRect = panel.getBoundingClientRect()
    panel.style.visibility = ''
    panel.style.display = ''

    const gap = 4
    const spaceBelow = window.innerHeight - triggerRect.bottom - gap
    const spaceAbove = triggerRect.top - gap

    let effective: DropdownPlacement = this.placement
    if (effective === 'bottom' && panelRect.height > spaceBelow && spaceAbove > spaceBelow) {
      effective = 'top'
    } else if (effective === 'top' && panelRect.height > spaceAbove && spaceBelow > spaceAbove) {
      effective = 'bottom'
    }

    panel.style.right = 'auto'
    panel.style.bottom = 'auto'
    panel.style.top = 'auto'

    if (effective === 'top') {
      panel.style.bottom = `${window.innerHeight - triggerRect.top + gap}px`
    } else {
      panel.style.top = `${triggerRect.bottom + gap}px`
    }

    let left = triggerRect.left
    if (left + panelRect.width > window.innerWidth) {
      left = window.innerWidth - panelRect.width - 8
    }
    if (left < 0) left = 8
    panel.style.left = `${left}px`
  }

  /**
   * Toggle an inline submenu open/closed.
   * Closing a parent also removes all its descendant paths.
   * Opening a parent closes any sibling at the same depth+parent.
   */
  private _toggleSubmenu(path: string) {
    const next = new Set(this._openPaths)
    if (next.has(path)) {
      for (const p of [...next]) {
        if (p === path || p.startsWith(`${path}-`)) next.delete(p)
      }
    } else {
      const segments = path.split('-')
      const depth = segments.length
      const parentPrefix = segments.slice(0, -1).join('-')
      for (const p of [...next]) {
        const pSeg = p.split('-')
        if (pSeg.length === depth && pSeg.slice(0, -1).join('-') === parentPrefix) {
          for (const d of [...next]) {
            if (d === p || d.startsWith(`${p}-`)) next.delete(d)
          }
        }
      }
      next.add(path)
    }
    this._openPaths = next
  }

  private _onTriggerKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!this._open) {
        this._open = true
        this._openPaths = new Set()
        this.updateComplete.then(() => {
          this._positionPanel()
          this.shadowRoot?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
        })
      }
    }
  }

  private _onPanelKeydown(e: KeyboardEvent) {
    const target = e.target as HTMLElement
    if (target.getAttribute('role') !== 'menuitem') return

    const wrapper = target.closest<HTMLElement>('.menu-item-wrapper')
    const path = wrapper?.getAttribute('data-path') ?? ''
    const currentMenu = target.closest<HTMLElement>('.menu')
    const menuItems = currentMenu
      ? (Array.from(currentMenu.children)
          .map(li => li.querySelector<HTMLElement>(':scope > [role="menuitem"]'))
          .filter(Boolean) as HTMLElement[])
      : []
    const hasChildren = Boolean(wrapper?.querySelector(':scope > .submenu'))

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault()
        const i = menuItems.indexOf(target)
        if (i < menuItems.length - 1) menuItems[i + 1].focus()
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        const i = menuItems.indexOf(target)
        if (i > 0) menuItems[i - 1].focus()
        break
      }
      case 'ArrowRight':
      case 'Enter': {
        if (hasChildren) {
          e.preventDefault()
          if (!this._openPaths.has(path)) {
            this._toggleSubmenu(path)
            this.updateComplete.then(() => {
              const firstInSub = wrapper?.querySelector<HTMLElement>('.submenu [role="menuitem"]')
              firstInSub?.focus()
            })
          }
        }
        break
      }
      case 'ArrowLeft': {
        e.preventDefault()
        if (path.includes('-')) {
          const parentPath = path.split('-').slice(0, -1).join('-')
          const next = new Set(this._openPaths)
          for (const p of [...next]) {
            if (p === parentPath || p.startsWith(`${parentPath}-`)) next.delete(p)
          }
          this._openPaths = next
          const parentWrapper = this.shadowRoot?.querySelector(
            `.menu-item-wrapper[data-path="${parentPath}"]`
          )
          parentWrapper?.querySelector<HTMLElement>(':scope > [role="menuitem"]')?.focus()
        }
        break
      }
      case 'Escape': {
        e.preventDefault()
        if (this._openPaths.size > 0) {
          this._openPaths = new Set()
        } else {
          this._open = false
          this.shadowRoot?.querySelector<HTMLElement>('.trigger')?.focus()
        }
        break
      }
      default:
        break
    }
  }

  private _onItemClick(item: DropdownItem, path: string) {
    if (item.children?.length) {
      this._toggleSubmenu(path)
      return
    }
    this._open = false
    this._openPaths = new Set()
    this.dispatchEvent(
      new CustomEvent<DropdownSelectEventDetail>('dropdown-select', {
        detail: { item, value: item.value },
        bubbles: true,
        composed: true,
      })
    )
  }

  private _renderItemIcon(item: DropdownItem) {
    if (item.icon == null) return html``
    if (typeof item.icon === 'string') {
      return html`<span class="item-icon"><slot name=${`icon-${item.icon}`}></slot></span>`
    }
    return html`<span class="item-icon">${item.icon}</span>`
  }

  private _renderMenu(items: DropdownItem[], pathPrefix = ''): TemplateResult {
    return html`
      <ul class="menu" role="menu">
        ${repeat(
          items,
          (item, i) => `${pathPrefix}-${i}-${item.label}`,
          (item, i): TemplateResult => {
            const path = pathPrefix ? `${pathPrefix}-${i}` : String(i)
            const hasChildren = Boolean(item.children?.length)
            const isExpanded = this._openPaths.has(path)
            return html`
              <li class="menu-item-wrapper" data-path=${path}>
                <button
                  type="button"
                  role="menuitem"
                  aria-expanded=${hasChildren ? (isExpanded ? 'true' : 'false') : nothing}
                  class="menu-item ${hasChildren ? 'has-children' : ''} ${isExpanded ? 'is-expanded' : ''}"
                  @click=${() => this._onItemClick(item, path)}
                >
                  ${this._renderItemIcon(item)}
                  <span class="item-label">${item.label}</span>
                  ${hasChildren
                    ? html`<span class="submenu-indicator" aria-hidden="true">${CHEVRON_SVG}</span>`
                    : ''}
                </button>
                ${hasChildren
                  ? html`
                      <ul class="submenu menu ${isExpanded ? 'is-open' : ''}" role="menu">
                        ${this._renderMenu(item.children!, path)}
                      </ul>
                    `
                  : ''}
              </li>
            `
          }
        )}
      </ul>
    `
  }

  override render() {
    return html`
      <button
        type="button"
        class="trigger"
        aria-haspopup="menu"
        aria-expanded=${this._open ? 'true' : 'false'}
        @click=${this._toggle}
        @keydown=${this._onTriggerKeydown}
      >
        <span class="icon-wrapper">
          <slot name="icon"></slot>
        </span>
        <span class="label">${this.label}</span>
        <span class="chevron" aria-hidden="true">${CHEVRON_SVG}</span>
      </button>
      <div
        class="panel ${this._open ? 'is-open' : ''}"
        role="menu"
        @keydown=${this._onPanelKeydown}
      >
        ${this._renderMenu(this.items)}
      </div>
    `
  }
}
