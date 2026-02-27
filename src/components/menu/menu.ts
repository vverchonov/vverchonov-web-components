import { LitElement, html, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import type { TemplateResult } from 'lit'
import menuStyles from './menu.css?inline'
import type { MenuItem, MenuSelectEventDetail, MenuSearchEventDetail } from './menu-types'

const CHEVRON_SVG = html`
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
`

const SEARCH_SVG = html`
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
`

function matchesSearch(item: MenuItem, query: string): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  if (item.label.toLowerCase().includes(q)) return true
  return item.children?.some(child => matchesSearch(child, query)) ?? false
}

function filterItems(items: MenuItem[], query: string): MenuItem[] {
  if (!query) return items
  return items.reduce<MenuItem[]>((acc, item) => {
    if (item.label.toLowerCase().includes(query.toLowerCase())) {
      acc.push(item)
    } else if (item.children?.some(child => matchesSearch(child, query))) {
      acc.push({ ...item, children: filterItems(item.children!, query) })
    }
    return acc
  }, [])
}

/**
 * Sidebar navigation menu with nested items, search, and collapsible mode.
 *
 * @tag app-menu
 * @slot logo - Full-width logo shown when the menu is expanded.
 * @slot logo-icon - Compact logo/icon shown when the menu is collapsed.
 * @slot bottom - Content rendered at the bottom of the sidebar (e.g. user profile).
 * @fires menu-select - Fired when a leaf menu item is clicked. Detail: `{ item, value }`.
 * @fires menu-search - Fired on search input. Detail: `{ query }`.
 */
@customElement('app-menu')
export class Menu extends LitElement {
  static override styles = [unsafeCSS(menuStyles)]

  /** Primary navigation items rendered in the main section. */
  @property({ attribute: false })
  items: MenuItem[] = []

  /** Secondary items rendered in the footer section below the main items. */
  @property({ attribute: false })
  footerItems: MenuItem[] = []

  /** Enables the search input above the navigation items. */
  @property({ type: Boolean })
  searchable = false

  /** Placeholder text for the search input. */
  @property({ type: String })
  searchPlaceholder = 'Search…'

  /** Value of the currently active item; highlights the matching item and auto-expands its parents. */
  @property({ attribute: false })
  activeValue?: string

  /**
   * When true the menu renders in semi-open (icon-only) mode by default.
   * Hovering the component temporarily expands it to full width.
   */
  @property({ type: Boolean })
  collapsed = false

  @state() private _openPaths = new Set<string>()
  @state() private _searchQuery = ''
  @state() private _hoverExpanded = false
  @state() private _bottomSlotPopulated = false

  private get _isCollapsed() {
    return this.collapsed && !this._hoverExpanded
  }

  override connectedCallback() {
    super.connectedCallback()
    this.addEventListener('mouseenter', this._onMouseEnter)
    this.addEventListener('mouseleave', this._onMouseLeave)
  }

  override disconnectedCallback() {
    super.disconnectedCallback()
    this.removeEventListener('mouseenter', this._onMouseEnter)
    this.removeEventListener('mouseleave', this._onMouseLeave)
  }

  override updated() {
    this.classList.toggle('is-collapsed', this._isCollapsed)
    if (!this._isCollapsed && this.activeValue != null) {
      const path =
        this._getPathToActiveValue(this.items, this.activeValue, 'm') ??
        this._getPathToActiveValue(this.footerItems, this.activeValue, 'f') ??
        null
      if (path) {
        const parts = path.split('-')
        const required = new Set<string>()
        for (let i = 2; i < parts.length; i++) {
          required.add(parts.slice(0, i).join('-'))
        }
        if (required.size > 0 && [...required].some(p => !this._openPaths.has(p))) {
          this._openPaths = new Set([...this._openPaths, ...required])
        }
      }
    }
  }

  private _itemContainsActiveValue(item: MenuItem): boolean {
    if (this.activeValue == null) return false
    if (item.value === this.activeValue) return true
    return item.children?.some(child => this._itemContainsActiveValue(child)) ?? false
  }

  private _getPathToActiveValue(items: MenuItem[], activeValue: string, prefix: string): string | null {
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const path = `${prefix}-${i}`
      if (item.value === activeValue) return path
      if (item.children?.length) {
        const found = this._getPathToActiveValue(item.children, activeValue, path)
        if (found) return found
      }
    }
    return null
  }

  private _onBottomSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement
    this._bottomSlotPopulated = slot.assignedNodes({ flatten: true }).length > 0
  }

  private _onMouseEnter = () => {
    if (this.collapsed) this._hoverExpanded = true
  }

  private _onMouseLeave = () => {
    if (this.collapsed) {
      this._hoverExpanded = false
      this._openPaths = new Set()
    }
  }

  private _toggleSubmenu(path: string) {
    const next = new Set(this._openPaths)
    if (next.has(path)) {
      for (const p of [...next]) {
        if (p === path || p.startsWith(`${path}-`)) next.delete(p)
      }
    } else {
      next.add(path)
    }
    this._openPaths = next
  }

  private _onItemClick(item: MenuItem, path: string) {
    if (item.children?.length) {
      this._toggleSubmenu(path)
      return
    }
    this.dispatchEvent(
      new CustomEvent<MenuSelectEventDetail>('menu-select', {
        detail: { item, value: item.value },
        bubbles: true,
        composed: true,
      })
    )
  }

  private _onSearchInput(e: InputEvent) {
    const input = e.target as HTMLInputElement
    this._searchQuery = input.value
    this.dispatchEvent(
      new CustomEvent<MenuSearchEventDetail>('menu-search', {
        detail: { query: this._searchQuery },
        bubbles: true,
        composed: true,
      })
    )
  }

  private _onNavKeydown(e: KeyboardEvent) {
    const target = e.target as HTMLElement
    if (!target.classList.contains('menu-item')) return

    const wrapper = target.closest<HTMLElement>('.menu-item-wrapper')
    const path = wrapper?.getAttribute('data-path') ?? ''
    const currentList = wrapper?.parentElement
    const siblings = currentList
      ? (Array.from(currentList.children)
          .map(li => li.querySelector<HTMLElement>(':scope > .menu-item'))
          .filter(Boolean) as HTMLElement[])
      : []
    const hasChildren = Boolean(wrapper?.querySelector(':scope > .submenu'))

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault()
        const i = siblings.indexOf(target)
        if (i < siblings.length - 1) siblings[i + 1].focus()
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        const i = siblings.indexOf(target)
        if (i > 0) siblings[i - 1].focus()
        break
      }
      case 'ArrowRight':
      case 'Enter': {
        if (hasChildren && !this._openPaths.has(path)) {
          e.preventDefault()
          this._toggleSubmenu(path)
          this.updateComplete.then(() => {
            const firstInSub = wrapper?.querySelector<HTMLElement>(
              ':scope > .submenu > .menu-item-wrapper > .menu-item'
            )
            firstInSub?.focus()
          })
        }
        break
      }
      case 'ArrowLeft': {
        e.preventDefault()
        const segments = path.split('-')
        if (segments.length > 2) {
          const parentPath = segments.slice(0, -1).join('-')
          const next = new Set(this._openPaths)
          for (const p of [...next]) {
            if (p === path || p.startsWith(`${path}-`)) next.delete(p)
          }
          this._openPaths = next
          this.shadowRoot
            ?.querySelector<HTMLElement>(`.menu-item-wrapper[data-path="${parentPath}"] > .menu-item`)
            ?.focus()
        }
        break
      }
      case 'Escape': {
        e.preventDefault()
        if (this._openPaths.size > 0) {
          const deepest = [...this._openPaths].sort(
            (a, b) => b.split('-').length - a.split('-').length
          )[0]
          const next = new Set(this._openPaths)
          for (const p of [...next]) {
            if (p === deepest || p.startsWith(`${deepest}-`)) next.delete(p)
          }
          this._openPaths = next
        }
        break
      }
      default:
        break
    }
  }

  private _renderItemIcon(item: MenuItem): TemplateResult {
    if (item.icon == null) return html``
    if (typeof item.icon === 'string') {
      return html`<span class="item-icon"><slot name=${`icon-${item.icon}`}></slot></span>`
    }
    return html`<span class="item-icon">${item.icon}</span>`
  }

  private _renderItems(items: MenuItem[], prefix: string, depth: number): TemplateResult {
    return html`${repeat(
      items,
      (item, i) => `${prefix}-${i}-${item.label}`,
      (item, i): TemplateResult => {
        const path = `${prefix}-${i}`
        const hasChildren = Boolean(item.children?.length)
        const isExpanded = this._openPaths.has(path)
        const isActive =
          this.activeValue != null &&
          (item.value === this.activeValue || (hasChildren && this._itemContainsActiveValue(item)))
        const isCurrentPage = this.activeValue != null && item.value === this.activeValue

        return html`
          <li class="menu-item-wrapper" data-path=${path} role="none">
            ${item.href && !hasChildren
              ? html`
                  <a
                    href=${item.href}
                    class="menu-item ${isActive ? 'is-active' : ''}"
                    role="treeitem"
                    aria-current=${isCurrentPage ? 'page' : nothing}
                    title=${item.label}
                    style="--depth: ${depth}"
                    @click=${() => this._onItemClick(item, path)}
                  >
                    ${this._renderItemIcon(item)}
                    <span class="item-label">${item.label}</span>
                  </a>
                `
              : html`
                  <button
                    type="button"
                    class="menu-item ${isActive ? 'is-active' : ''} ${hasChildren ? 'has-children' : ''} ${isExpanded ? 'is-expanded' : ''}"
                    role="treeitem"
                    aria-expanded=${hasChildren ? (isExpanded ? 'true' : 'false') : nothing}
                    aria-current=${isCurrentPage ? 'page' : nothing}
                    title=${item.label}
                    style="--depth: ${depth}"
                    @click=${() => this._onItemClick(item, path)}
                  >
                    ${this._renderItemIcon(item)}
                    <span class="item-label">${item.label}</span>
                    ${hasChildren
                      ? html`<span class="submenu-indicator" aria-hidden="true">${CHEVRON_SVG}</span>`
                      : nothing}
                  </button>
                `}
            ${hasChildren
              ? html`
                  <ul class="submenu ${isExpanded ? 'is-open' : ''}" role="group">
                    ${this._renderItems(item.children!, path, depth + 1)}
                  </ul>
                `
              : nothing}
          </li>
        `
      }
    )}`
  }

  private _renderMenu(items: MenuItem[], prefix: string, label: string): TemplateResult {
    return html`
      <ul class="menu" role="tree" aria-label=${label}>
        ${this._renderItems(items, prefix, 0)}
      </ul>
    `
  }

  override render() {
    const filteredItems = filterItems(this.items, this._searchQuery)
    const filteredFooterItems = filterItems(this.footerItems, this._searchQuery)

    return html`
      <div class="logo-wrapper">
        <span class="logo-expanded"><slot name="logo"></slot></span>
        <span class="logo-icon"><slot name="logo-icon"></slot></span>
      </div>

      ${this.searchable
        ? html`
            <div class="search-wrapper">
              <span class="search-icon">${SEARCH_SVG}</span>
              <input
                type="search"
                class="search-input"
                placeholder=${this.searchPlaceholder}
                aria-label="Search navigation"
                .value=${this._searchQuery}
                @input=${this._onSearchInput}
              />
            </div>
          `
        : nothing}

      <nav
        class="nav-main"
        aria-label="Main"
        @keydown=${this._onNavKeydown}
      >
        ${this._renderMenu(filteredItems, 'm', 'Main navigation')}
      </nav>

      ${this.footerItems.length > 0
        ? html`
            <nav
              class="nav-footer"
              aria-label="Footer"
              @keydown=${this._onNavKeydown}
            >
              ${this._renderMenu(filteredFooterItems, 'f', 'Footer navigation')}
            </nav>
          `
        : nothing}

      <div class="bottom-slot ${this._bottomSlotPopulated ? '' : 'is-empty'}">
        <slot name="bottom" @slotchange=${this._onBottomSlotChange}></slot>
      </div>
    `
  }
}
