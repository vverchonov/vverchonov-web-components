import { LitElement, html, unsafeCSS, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import tabsStyles from './tabs.css?inline'

/** Definition of a single tab item. */
export interface TabItem {
  /** Visible text rendered in the tab button. */
  label: string
  /** Unique value identifying this tab; also used as the panel slot name. */
  value: string
  /** When true the tab cannot be selected. */
  disabled?: boolean
}

/** Detail payload for the `tab-change` custom event. */
export interface TabChangeEventDetail {
  /** Value of the newly selected tab. */
  value: string
}

/**
 * Horizontal tab bar with keyboard navigation and slotted panels.
 * Each tab's content is projected via a named slot matching the tab's `value`.
 *
 * @tag app-tabs
 * @slot [value] - One named slot per tab whose name matches the tab's `value`.
 * @fires tab-change - Fired when the active tab changes. Detail: `{ value: string }`.
 */
@customElement('app-tabs')
export class Tabs extends LitElement {
  static override styles = [unsafeCSS(tabsStyles)]

  /** Array of tab definitions rendered as buttons. */
  @property({ attribute: false })
  tabs: TabItem[] = []

  /** Value of the currently active tab (reflected to attribute). */
  @property({ type: String, reflect: true })
  value = ''

  /** Optional callback invoked with the `tab-change` custom event. Set via property. */
  @property({ attribute: false })
  onChange?: (e: CustomEvent<TabChangeEventDetail>) => void

  private _selectTab(tab: TabItem) {
    if (tab.disabled) return
    this.value = tab.value
    const event = new CustomEvent<TabChangeEventDetail>('tab-change', {
      detail: { value: tab.value },
      bubbles: true,
      composed: true,
    })
    this.dispatchEvent(event)
    this.onChange?.(event)
  }

  private _handleKeydown(e: KeyboardEvent) {
    const enabledTabs = this.tabs.filter(t => !t.disabled)
    const currentIdx = enabledTabs.findIndex(t => t.value === this.value)
    if (currentIdx === -1) return

    let targetIdx: number | null = null

    switch (e.key) {
      case 'ArrowRight':
        targetIdx = (currentIdx + 1) % enabledTabs.length
        break
      case 'ArrowLeft':
        targetIdx = (currentIdx - 1 + enabledTabs.length) % enabledTabs.length
        break
      case 'Home':
        targetIdx = 0
        break
      case 'End':
        targetIdx = enabledTabs.length - 1
        break
      default:
        return
    }

    e.preventDefault()
    const target = enabledTabs[targetIdx]
    this._selectTab(target)

    const btn = this.shadowRoot?.querySelector<HTMLButtonElement>(
      `[data-value="${target.value}"]`
    )
    btn?.focus()
  }

  private _activeValue(): string {
    if (this.value && this.tabs.some(t => t.value === this.value)) {
      return this.value
    }
    const firstEnabled = this.tabs.find(t => !t.disabled)
    return firstEnabled?.value ?? ''
  }

  override render() {
    const active = this._activeValue()

    return html`
      <div
        class="tablist"
        role="tablist"
        @keydown=${this._handleKeydown}
      >
        ${this.tabs.map(tab => {
          const isActive = tab.value === active
          const panelId = `panel-${tab.value}`
          const tabId = `tab-${tab.value}`
          return html`
            <button
              class="tab"
              role="tab"
              id=${tabId}
              data-value=${tab.value}
              aria-selected=${isActive}
              aria-controls=${panelId}
              tabindex=${isActive ? 0 : -1}
              ?disabled=${tab.disabled}
              @click=${() => this._selectTab(tab)}
            >${tab.label}</button>
          `
        })}
      </div>
      <div
        class="panel"
        role="tabpanel"
        id=${`panel-${active}`}
        aria-labelledby=${active ? `tab-${active}` : nothing}
        tabindex="0"
      >
        <slot name=${active}></slot>
      </div>
    `
  }
}
