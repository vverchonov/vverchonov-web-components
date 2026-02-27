import './tailwind.css'
import './components/button'
import './components/table'
import './components/dropdown-button'
import './components/menu'
import './components/layouts'
import './components/toggle'
import './components/input'
import './components/modal'
import './components/tabs'
import './components/selector'
import './components/radio-group'
import './components/card'
import { html, render } from 'lit'
import type { ColumnDef } from './components/table'
import type { DropdownItem } from './components/dropdown-button'
import type { MenuItem } from './components/menu'
import type { ToggleChangeEventDetail } from './components/toggle'
import type { SelectorOption, SelectorGroup } from './components/selector'
import type { RadioGroupItem } from './components/radio-group'
import { mockTableRows, mockTableRowsSmall, type MockTableRow } from './mock/table-data'

// ── Theme management ────────────────────────────────────────────────────────

function getInitialDark(): boolean {
  const stored = localStorage.getItem('theme')
  if (stored === 'dark') return true
  if (stored === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(dark: boolean) {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  localStorage.setItem('theme', dark ? 'dark' : 'light')
}

let isDark = getInitialDark()
applyTheme(isDark)

// ── Active page state ────────────────────────────────────────────────────────

let activePage = (location.hash.slice(1) || 'button') as string

function navigate(page: string) {
  activePage = page
  location.hash = page
  rerenderDemo()
}

window.addEventListener('hashchange', () => {
  activePage = location.hash.slice(1) || 'button'
  rerenderDemo()
})

// ── Modal demo state ─────────────────────────────────────────────────────────

let modalInfoOpen = false
let modalConfirmOpen = false
let modalFormOpen = false
let modalMultiStepOpen = false
let modalCustomOpen = false

// ── Table data ──────────────────────────────────────────────────────────────

const columns: ColumnDef<MockTableRow>[] = [
  { key: 'id',         label: 'ID',         group: 'Identity',     sortable: true, width: '60px' },
  { key: 'name',       label: 'Name',       group: 'Identity',     sortable: true },
  { key: 'department', label: 'Department', group: 'Work Info',    sortable: true },
  { key: 'role',       label: 'Role',       group: 'Work Info',    sortable: true },
  { key: 'salary',     label: 'Salary',     group: 'Compensation', sortable: true,
    renderCell: (row) => html`<span style="font-variant-numeric:tabular-nums">
      $${(row.salary as number).toLocaleString()}
    </span>` },
  { key: 'status',     label: 'Status',     group: 'Compensation',
    renderCell: (row) => html`
      <span class="status-badge status-${row.status}">${row.status}</span>
    ` },
  { key: '_actions',   label: 'Actions',    hidden: true,
    renderCell: (row) => html`
      <div style="display:flex;gap:0.5rem">
        <select
          style="font-size:0.8rem;padding:2px 4px;border:1px solid var(--color-border);border-radius:4px;background:var(--color-surface)"
          @change=${(e: Event) => {
            const v = (e.target as HTMLSelectElement).value
            if (v) console.log('Action:', v, 'on row', row.id)
            ;(e.target as HTMLSelectElement).value = ''
          }}
        >
          <option value="">Action…</option>
          <option value="edit">Edit</option>
          <option value="delete">Delete</option>
          <option value="duplicate">Duplicate</option>
        </select>
      </div>
    ` },
]

const simpleColumns: ColumnDef<MockTableRow>[] = [
  { key: 'id',   label: 'ID'   },
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
]

// ── Server-side pagination demo state ────────────────────────────────────────

const SERVER_PAGE_SIZE = 5
const SERVER_TOTAL = mockTableRows.length

let serverPage = 1
let serverRows: Record<string, unknown>[] = mockTableRows.slice(0, SERVER_PAGE_SIZE) as unknown as Record<string, unknown>[]
let serverLoading = false

function simulateFetchPage(page: number) {
  serverLoading = true
  serverPage = page
  rerenderDemo()

  setTimeout(() => {
    const start = (page - 1) * SERVER_PAGE_SIZE
    serverRows = mockTableRows.slice(start, start + SERVER_PAGE_SIZE) as unknown as Record<string, unknown>[]
    serverLoading = false
    rerenderDemo()
  }, 600)
}

// ── Dropdown data ───────────────────────────────────────────────────────────

const dropdownActions: DropdownItem[] = [
  { label: 'Edit',      value: 'edit' },
  { label: 'Duplicate', value: 'duplicate' },
  { label: 'Delete',    value: 'delete' },
]

const dropdownWithSubmenus: DropdownItem[] = [
  { label: 'New',      value: 'new',    children: [{ label: 'File', value: 'new-file' }, { label: 'Folder', value: 'new-folder' }] },
  { label: 'Export',   value: 'export', children: [{ label: 'PDF', value: 'pdf' }, { label: 'CSV', value: 'csv' }] },
  { label: 'Settings', value: 'settings' },
]

const dropdownWithIcons: DropdownItem[] = [
  { label: 'Edit',   value: 'edit',   icon: html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>` },
  { label: 'Copy',   value: 'copy',   icon: html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>` },
  { label: 'Delete', value: 'delete', icon: html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>` },
]

// ── Selector data ────────────────────────────────────────────────────────────

const fruitOptions: SelectorOption[] = [
  { label: 'Apple',      value: 'apple' },
  { label: 'Banana',     value: 'banana' },
  { label: 'Cherry',     value: 'cherry' },
  { label: 'Grape',      value: 'grape' },
  { label: 'Mango',      value: 'mango' },
  { label: 'Orange',     value: 'orange' },
  { label: 'Peach',      value: 'peach' },
  { label: 'Strawberry', value: 'strawberry' },
]

const countryOptions: SelectorOption[] = [
  { label: 'United States', value: 'us',   icon: html`<span aria-hidden="true" style="font-size:1.1em">🇺🇸</span>`, group: 'americas' },
  { label: 'Canada',        value: 'ca',   icon: html`<span aria-hidden="true" style="font-size:1.1em">🇨🇦</span>`, group: 'americas' },
  { label: 'Brazil',        value: 'br',   icon: html`<span aria-hidden="true" style="font-size:1.1em">🇧🇷</span>`, group: 'americas' },
  { label: 'United Kingdom',value: 'gb',   icon: html`<span aria-hidden="true" style="font-size:1.1em">🇬🇧</span>`, group: 'europe' },
  { label: 'Germany',       value: 'de',   icon: html`<span aria-hidden="true" style="font-size:1.1em">🇩🇪</span>`, group: 'europe' },
  { label: 'France',        value: 'fr',   icon: html`<span aria-hidden="true" style="font-size:1.1em">🇫🇷</span>`, group: 'europe' },
  { label: 'Japan',         value: 'jp',   icon: html`<span aria-hidden="true" style="font-size:1.1em">🇯🇵</span>`, group: 'asia' },
  { label: 'South Korea',   value: 'kr',   icon: html`<span aria-hidden="true" style="font-size:1.1em">🇰🇷</span>`, group: 'asia' },
  { label: 'Australia',     value: 'au',   icon: html`<span aria-hidden="true" style="font-size:1.1em">🇦🇺</span>`, group: 'oceania' },
]

const countryGroups: SelectorGroup[] = [
  { key: 'americas', label: 'Americas' },
  { key: 'europe',   label: 'Europe' },
  { key: 'asia',     label: 'Asia' },
  { key: 'oceania',  label: 'Oceania' },
]

const roleOptions: SelectorOption[] = [
  { label: 'Admin',    value: 'admin' },
  { label: 'Editor',   value: 'editor' },
  { label: 'Viewer',   value: 'viewer' },
  { label: 'Guest',    value: 'guest', disabled: true },
]

let selectorSingleValue: string[] = []
let selectorMultiValue: string[] = ['apple', 'cherry']
let selectorSearchValue: string[] = ['us']
let selectorGroupedValue: string[] = []

// ── Radio group demo data ────────────────────────────────────────────────────

const radioSizeItems: RadioGroupItem[] = [
  { label: 'Small',  value: 'sm' },
  { label: 'Medium', value: 'md' },
  { label: 'Large',  value: 'lg' },
]

const radioPlanItems: RadioGroupItem[] = [
  { label: 'Free',       value: 'free' },
  { label: 'Pro',        value: 'pro' },
  { label: 'Enterprise', value: 'enterprise' },
  { label: 'Legacy',     value: 'legacy', disabled: true },
]

let radioSizeValue = 'md'
let radioPlanValue = ''
let radioValidationValue = ''

// ── Sidebar menu data ────────────────────────────────────────────────────────

const buttonIcon     = html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="7" width="20" height="10" rx="2"/><path d="M12 12h.01"/></svg>`
const dropdownIcon   = html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M8 9l4-4 4 4"/><path d="M16 15l-4 4-4-4"/></svg>`
const tableIcon      = html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>`
const toggleIcon     = html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="1" y="8" width="22" height="8" rx="4"/><circle cx="17" cy="12" r="3" fill="currentColor" stroke="none"/></svg>`
const inputIcon      = html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M7 12h2m4 0h2"/><line x1="6" y1="9" x2="6" y2="15"/></svg>`
const menuNavIcon    = html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`
const settingsIcon   = html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`
const formLayoutIcon = html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 8h18"/><path d="M3 13h8"/><path d="M3 18h5"/></svg>`
const modalNavIcon   = html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18"/><path d="M9 19v2M15 19v2"/></svg>`
const tabsNavIcon    = html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 7h4l3-4h4l3 4h4v14H3z"/><path d="M3 11h18"/></svg>`
const selectorIcon   = html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12l3 3 5-5"/></svg>`
const radioGroupIcon = html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="6" r="3"/><circle cx="12" cy="12" r="3"/><circle cx="12" cy="18" r="3"/><circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none"/></svg>`
const cardIcon           = html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M2 9h20"/></svg>`
const componentsGroupIcon = html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="8" height="8" rx="1"/></svg>`
const layoutsGroupIcon    = html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`

const sidebarItems: MenuItem[] = [
  {
    label: 'Components',
    value: '_components_group',
    icon: componentsGroupIcon,
    children: [
      { label: 'Button',        value: 'button',      icon: buttonIcon      },
      { label: 'Dropdown',      value: 'dropdown',    icon: dropdownIcon    },
      { label: 'Input',         value: 'input',       icon: inputIcon       },
      { label: 'Toggle',        value: 'toggle',      icon: toggleIcon      },
      { label: 'Table',         value: 'table',       icon: tableIcon       },
      { label: 'Menu',          value: 'menu',        icon: menuNavIcon     },
      { label: 'Modal',         value: 'modal',       icon: modalNavIcon    },
      { label: 'Tabs',          value: 'tabs',        icon: tabsNavIcon     },
      { label: 'Selector',      value: 'selector',    icon: selectorIcon    },
      { label: 'Radio Group',   value: 'radio-group', icon: radioGroupIcon  },
      { label: 'Card',          value: 'card',        icon: cardIcon         },
    ],
  },
  {
    label: 'Layouts',
    value: '_layouts_group',
    icon: layoutsGroupIcon,
    children: [
      { label: 'Form Layout',   value: 'form-layout', icon: formLayoutIcon  },
    ],
  },
]

const sidebarFooterItems: MenuItem[] = [
  { label: 'Settings', value: 'settings', icon: settingsIcon, href: '#settings' },
]

// ── Page renderers ───────────────────────────────────────────────────────────

function renderButtonPage() {
  return html`
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">Button</h1>
        <p class="page-desc">Primary action component with optional icon slot.</p>
      </div>

      <section class="demo-section">
        <h2 class="section-title">Use cases</h2>
        <p class="section-desc">
          Use <code>app-button</code> for primary actions (submit, confirm, save), secondary actions in forms (e.g. Cancel), and icon-only triggers when space is limited. Use <code>type="submit"</code> inside forms and <code>type="reset"</code> for clearing; add an icon via the default slot with <code>icon-position="start"</code> or <code>icon-position="end"</code> when the label benefits from a visual cue.
        </p>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Variants</h2>
        <div class="demo-row">
          <app-button label="Text only"></app-button>
          <app-button label="Icon start" icon-position="start">
            <svg slot="icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
          </app-button>
          <app-button label="Icon end" icon-position="end">
            <svg slot="icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </app-button>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Types</h2>
        <div class="demo-row">
          <app-button label="button (default)" type="button"></app-button>
          <app-button label="submit" type="submit"></app-button>
          <app-button label="reset" type="reset"></app-button>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Properties</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header">
            <span>Property</span><span>Type</span><span>Default</span><span>Description</span>
          </div>
          <div class="prop-row"><span><code>label</code></span><span><code>string</code></span><span><code>'Click me'</code></span><span>Visible button text; used for accessibility when no label is slotted.</span></div>
          <div class="prop-row"><span><code>icon-position</code></span><span><code>'start' | 'end'</code></span><span><code>'start'</code></span><span>Places the slotted icon before or after the label.</span></div>
          <div class="prop-row"><span><code>type</code></span><span><code>'button' | 'submit' | 'reset'</code></span><span><code>'button'</code></span><span>Native button type: use <code>submit</code> inside forms, <code>reset</code> to clear form fields.</span></div>
          <div class="prop-row"><span><code>onClick</code></span><span><code>(e: MouseEvent) => void</code></span><span>—</span><span>Optional callback when the button is clicked; set via property (attribute not supported).</span></div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Slots</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header"><span>Slot</span><span colspan="3">Description</span></div>
          <div class="prop-row"><span><code>icon</code></span><span>Optional icon shown before or after the label depending on <code>icon-position</code>. Use <code>aria-hidden="true"</code> on decorative icons.</span></div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Events</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header"><span>Event</span><span colspan="3">Description</span></div>
          <div class="prop-row"><span><em>none</em></span><span>Use the <code>onClick</code> property for click handling, or listen for native <code>click</code> on the host element.</span></div>
        </div>
      </section>
    </div>
  `
}

function renderDropdownPage() {
  return html`
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">Dropdown Button</h1>
        <p class="page-desc">Button that opens a menu of selectable actions, with optional icons and nested submenus.</p>
      </div>

      <section class="demo-section">
        <h2 class="section-title">Use cases</h2>
        <p class="section-desc">
          Use <code>app-dropdown-button</code> for action menus (e.g. row actions, toolbar "More" menus, export or share options). It supports flat lists, nested submenus, and items with icons. Prefer it over <code>app-menu</code> when the trigger is inline (e.g. next to a table row); use <code>app-menu</code> for persistent sidebar navigation.
        </p>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Simple actions</h2>
        <div class="demo-row">
          <app-dropdown-button
            label="Actions"
            .items=${dropdownActions}
            @dropdown-select=${(e: Event) => console.log('dropdown-select:', (e as CustomEvent).detail)}
          ></app-dropdown-button>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Nested submenus</h2>
        <div class="demo-row">
          <app-dropdown-button
            label="More"
            .items=${dropdownWithSubmenus}
            @dropdown-select=${(e: Event) => console.log('dropdown-select:', (e as CustomEvent).detail)}
          ></app-dropdown-button>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Items with icons</h2>
        <div class="demo-row">
          <app-dropdown-button
            .items=${dropdownWithIcons}
            @dropdown-select=${(e: Event) => console.log('dropdown-select:', (e as CustomEvent).detail)}
          >
            <span slot="icon">⋯</span>
          </app-dropdown-button>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Auto-flip positioning</h2>
        <p class="section-desc">
          The dropdown automatically flips above the trigger when there isn't enough viewport space below. Try opening these dropdowns inside the short scrollable container.
        </p>
        <div class="demo-row" style="height: 120px; overflow: auto; border: 1px solid var(--color-border); border-radius: var(--radius-card); padding: 0.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-end; min-height: 200px; padding-top: 140px;">
            <app-dropdown-button
              label="Opens above"
              .items=${dropdownActions}
              @dropdown-select=${(e: Event) => console.log('dropdown-select:', (e as CustomEvent).detail)}
            ></app-dropdown-button>
            <app-dropdown-button
              label="Also flips"
              .items=${dropdownWithSubmenus}
              @dropdown-select=${(e: Event) => console.log('dropdown-select:', (e as CustomEvent).detail)}
            ></app-dropdown-button>
          </div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Properties</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header">
            <span>Property</span><span>Type</span><span>Default</span><span>Description</span>
          </div>
          <div class="prop-row"><span><code>label</code></span><span><code>string</code></span><span><code>''</code></span><span>Trigger button text. Omit or leave empty for icon-only trigger when using <code>slot="icon"</code>.</span></div>
          <div class="prop-row"><span><code>placement</code></span><span><code>'bottom' | 'top'</code></span><span><code>'bottom'</code></span><span>Preferred direction for the panel. Automatically flips to the opposite side when there is not enough viewport space.</span></div>
          <div class="prop-row"><span><code>items</code></span><span><code>DropdownItem[]</code></span><span><code>[]</code></span><span>Menu items: <code>{ label, value?, icon?, children? }</code>. <code>children</code> creates nested submenus. Set via property.</span></div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Slots</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header"><span>Slot</span><span colspan="3">Description</span></div>
          <div class="prop-row"><span><code>icon</code></span><span>Optional icon in the trigger button (e.g. ellipsis for "More"). Shown before the label.</span></div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Events</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header"><span>Event</span><span colspan="3">Detail</span></div>
          <div class="prop-row"><span><code>dropdown-select</code></span><span><code>{ item: DropdownItem, value?: string }</code> — fired when a leaf item is chosen; panel closes. Not fired when opening a parent with children.</span></div>
        </div>
      </section>
    </div>
  `
}

function renderInputPage() {
  return html`
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">Input</h1>
        <p class="page-desc">Text input with optional label, icon slot, and validation states.</p>
      </div>

      <section class="demo-section">
        <h2 class="section-title">Use cases</h2>
        <p class="section-desc">
          Use <code>app-input</code> for single-line text entry in forms: emails, passwords, search, phone numbers, and generic text. Use the <code>state</code> and <code>error-message</code> props to show validation feedback; add an icon via the default slot for search or email-style fields. Supports native <code>type</code> (text, email, password, number, search, tel), <code>required</code>, <code>disabled</code>, and <code>readonly</code>.
        </p>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Types</h2>
        <div class="demo-grid">
          <app-input label="Text" type="text" placeholder="Enter text…"></app-input>
          <app-input label="Email" type="email" placeholder="you@example.com"></app-input>
          <app-input label="Password" type="password" placeholder="••••••••"></app-input>
          <app-input label="Number" type="number" placeholder="0"></app-input>
          <app-input label="Search" type="search" placeholder="Search…"></app-input>
          <app-input label="Tel" type="tel" placeholder="+1 (555) 000-0000"></app-input>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">With icon</h2>
        <div class="demo-grid">
          <app-input label="Email" type="email" placeholder="you@example.com">
            <svg slot="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </app-input>
          <app-input label="Search" type="search" placeholder="Search…">
            <svg slot="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </app-input>
          <app-input label="Password" type="password" placeholder="••••••••">
            <svg slot="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </app-input>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Validation states</h2>
        <div class="demo-grid">
          <app-input
            label="Default"
            placeholder="No state"
          ></app-input>
          <app-input
            label="Valid"
            state="valid"
            value="john_doe"
          ></app-input>
          <app-input
            label="Invalid"
            state="invalid"
            value="bad@"
            error-message="Enter a valid email address."
          ></app-input>
          <app-input
            label="Invalid with icon"
            type="email"
            state="invalid"
            value="not-an-email"
            error-message="Must be a valid email like name@example.com"
          >
            <svg slot="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </app-input>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">States</h2>
        <div class="demo-grid">
          <app-input label="Disabled" placeholder="Can't type here" disabled></app-input>
          <app-input label="Read-only" value="Read-only value" readonly></app-input>
          <app-input label="Required" placeholder="Required field" required></app-input>
          <app-input label="No label" placeholder="No label above"></app-input>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Properties</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header">
            <span>Property</span><span>Type</span><span>Default</span><span>Description</span>
          </div>
          <div class="prop-row"><span><code>type</code></span><span><code>text | email | password | number | tel | url | search</code></span><span><code>'text'</code></span><span>Native input type; controls browser behavior and validation.</span></div>
          <div class="prop-row"><span><code>label</code></span><span><code>string</code></span><span><code>''</code></span><span>Label text above the input; associated via <code>for</code>/<code>id</code>. Omit for no visible label.</span></div>
          <div class="prop-row"><span><code>placeholder</code></span><span><code>string</code></span><span><code>''</code></span><span>Placeholder text when the value is empty.</span></div>
          <div class="prop-row"><span><code>value</code></span><span><code>string</code></span><span><code>''</code></span><span>Current value; bind for two-way updates. Updated on <code>input</code> and when <code>onChange</code> is called.</span></div>
          <div class="prop-row"><span><code>name</code></span><span><code>string</code></span><span><code>''</code></span><span>Form field name when used inside a form.</span></div>
          <div class="prop-row"><span><code>required</code></span><span><code>boolean</code></span><span><code>false</code></span><span>Marks the field required for form validation.</span></div>
          <div class="prop-row"><span><code>disabled</code></span><span><code>boolean</code></span><span><code>false</code></span><span>Disables the native input.</span></div>
          <div class="prop-row"><span><code>readonly</code></span><span><code>boolean</code></span><span><code>false</code></span><span>Makes the input read-only (value not editable).</span></div>
          <div class="prop-row"><span><code>state</code></span><span><code>'default' | 'valid' | 'invalid'</code></span><span><code>'default'</code></span><span>Visual and ARIA state: <code>valid</code>/<code>invalid</code> show an icon; <code>invalid</code> with <code>error-message</code> shows the message and <code>aria-describedby</code>.</span></div>
          <div class="prop-row"><span><code>error-message</code></span><span><code>string</code></span><span><code>''</code></span><span>Shown below the input when <code>state="invalid"</code>; announced to screen readers.</span></div>
          <div class="prop-row"><span><code>onChange</code></span><span><code>(value: string) => void</code></span><span>—</span><span>Optional callback with the new value on each <code>input</code>; set via property.</span></div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Slots</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header"><span>Slot</span><span colspan="3">Description</span></div>
          <div class="prop-row"><span><code>icon</code></span><span>Optional icon shown at the start of the input row (e.g. envelope for email). Use <code>aria-hidden="true"</code> on decorative icons.</span></div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Events</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header"><span>Event</span><span colspan="3">Description</span></div>
          <div class="prop-row"><span><em>none</em></span><span>Use the <code>onChange</code> property for value updates, or listen for native <code>input</code> on the host and read <code>value</code>.</span></div>
        </div>
      </section>
    </div>
  `
}

function renderTogglePage() {
  return html`
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">Toggle</h1>
        <p class="page-desc">Boolean switch with optional label and icon slot.</p>
      </div>

      <section class="demo-section">
        <h2 class="section-title">Use cases</h2>
        <p class="section-desc">
          Use <code>app-toggle</code> for on/off settings such as notifications, dark mode, feature flags, or any boolean preference. Add a label for accessibility; use the icon slot when the setting is commonly represented by an icon (e.g. moon for dark mode). Listen to <code>toggle-change</code> to sync state with your app.
        </p>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Basic</h2>
        <div class="demo-col">
          <app-toggle label="Notifications"></app-toggle>
          <app-toggle label="Dark mode" checked></app-toggle>
          <app-toggle label="Disabled" disabled></app-toggle>
          <app-toggle label="Disabled + checked" disabled checked></app-toggle>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">With icon</h2>
        <div class="demo-col">
          <app-toggle label="Dark mode">
            <svg slot="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </app-toggle>
          <app-toggle label="Wi-Fi" icon-position="end">
            <svg slot="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
              <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
              <line x1="12" y1="20" x2="12.01" y2="20"/>
            </svg>
          </app-toggle>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Properties</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header">
            <span>Property</span><span>Type</span><span>Default</span><span>Description</span>
          </div>
          <div class="prop-row"><span><code>checked</code></span><span><code>boolean</code></span><span><code>false</code></span><span>Whether the switch is on; reflects to attribute. Toggle by clicking or via property.</span></div>
          <div class="prop-row"><span><code>disabled</code></span><span><code>boolean</code></span><span><code>false</code></span><span>Disables the control; click has no effect, reflects to attribute.</span></div>
          <div class="prop-row"><span><code>label</code></span><span><code>string</code></span><span><code>''</code></span><span>Visible label and <code>aria-label</code> when provided; omit for icon-only (ensure accessible name elsewhere).</span></div>
          <div class="prop-row"><span><code>icon-position</code></span><span><code>'start' | 'end'</code></span><span><code>'start'</code></span><span>Places the slotted icon before or after the label.</span></div>
          <div class="prop-row"><span><code>onChange</code></span><span><code>(e: CustomEvent&lt;{ checked: boolean }&gt;) => void</code></span><span>—</span><span>Optional callback when checked state changes; set via property. Fired after <code>toggle-change</code>.</span></div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Slots</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header"><span>Slot</span><span colspan="3">Description</span></div>
          <div class="prop-row"><span><code>icon</code></span><span>Optional icon shown before or after the label depending on <code>icon-position</code>. Use <code>aria-hidden="true"</code> on decorative icons.</span></div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Events</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header"><span>Event</span><span colspan="3">Detail</span></div>
          <div class="prop-row"><span><code>toggle-change</code></span><span><code>{ checked: boolean }</code> — fired when the user toggles the switch; <code>checked</code> is the new value.</span></div>
        </div>
      </section>
    </div>
  `
}

function renderTablePage() {
  return html`
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">Table</h1>
        <p class="page-desc">Data table with grouped headers, sorting, client-side and server-side pagination, loading state, and column toggling.</p>
      </div>

      <section class="demo-section">
        <h2 class="section-title">Use cases</h2>
        <p class="section-desc">
          Use <code>app-table</code> for tabular data: user lists, reports, admin grids. Enable <code>sortable</code> on columns for client-side sorting, <code>page-size</code> for pagination. For server-side pagination, set <code>total-items</code> and provide only the current page's rows — listen for <code>table-page</code> to fetch new data. Use <code>external-sort</code> to delegate sorting to the server. Set <code>loading</code> during fetches. Use <code>show-column-toggle</code> when users need to hide columns and <code>ColumnDef.group</code> for logical header groups.
        </p>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Full features — groups, sort, pagination, column toggle</h2>
        <div id="full-table"></div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Minimal — plain columns, no extras</h2>
        <div id="simple-table"></div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Server-side pagination — data fetched per page</h2>
        <p class="section-desc">
          Set <code>total-items</code> and <code>page-size</code> to enable server-side mode.
          Only the current page's rows are provided; the table does not slice locally.
          A simulated 600 ms delay shows the <code>loading</code> overlay.
        </p>
        <div id="server-table"></div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Properties</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header">
            <span>Property</span><span>Type</span><span>Default</span><span>Description</span>
          </div>
          <div class="prop-row"><span><code>columns</code></span><span><code>ColumnDef[]</code></span><span><code>[]</code></span><span>Column definitions: <code>key</code>, <code>label</code>, optional <code>group</code>, <code>sortable</code>, <code>hidden</code>, <code>width</code>, <code>renderCell(row, rowIndex)</code>. Set via property.</span></div>
          <div class="prop-row"><span><code>rows</code></span><span><code>Record&lt;string, unknown&gt;[]</code></span><span><code>[]</code></span><span>Data rows; each key should match a column <code>key</code> for default rendering. In server-side mode, provide only the current page's rows. Set via property.</span></div>
          <div class="prop-row"><span><code>page-size</code></span><span><code>number</code></span><span><code>0</code></span><span>Rows per page; when &gt; 0, pagination is shown and only the current page is rendered.</span></div>
          <div class="prop-row"><span><code>total-items</code></span><span><code>number</code></span><span><code>0</code></span><span>Total number of items across all pages. When &gt; 0 (with <code>page-size</code> &gt; 0), the table enters server-side pagination: <code>rows</code> is treated as the current page's data and no local slicing is performed.</span></div>
          <div class="prop-row"><span><code>page</code></span><span><code>number</code></span><span><code>1</code></span><span>Current page (1-based). Can be set externally to navigate programmatically. Updated internally when page buttons are clicked.</span></div>
          <div class="prop-row"><span><code>loading</code></span><span><code>boolean</code></span><span><code>false</code></span><span>Shows a translucent overlay with a spinner on the table body while data is being fetched.</span></div>
          <div class="prop-row"><span><code>external-sort</code></span><span><code>boolean</code></span><span><code>false</code></span><span>Disables local sorting. The <code>table-sort</code> event still fires so the consumer can re-fetch sorted data from the server.</span></div>
          <div class="prop-row"><span><code>show-column-toggle</code></span><span><code>boolean</code></span><span><code>false</code></span><span>Shows a "Columns" button that toggles a panel to show/hide columns; columns with <code>hidden: true</code> start hidden.</span></div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Slots</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header"><span>Slot</span><span colspan="3">Description</span></div>
          <div class="prop-row"><span><em>none</em></span><span>Cell content is driven by <code>columns[].renderCell</code>. Use <code>renderCell(row, rowIndex)</code> to return a Lit template or string for custom cells; omit for default <code>row[col.key]</code>.</span></div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Events</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header"><span>Event</span><span colspan="3">Detail</span></div>
          <div class="prop-row"><span><code>table-sort</code></span><span><code>{ column: string, dir: 'asc' | 'desc', pageSize: number }</code> — fired when a sortable column header is clicked; reflects current sort state.</span></div>
          <div class="prop-row"><span><code>table-page</code></span><span><code>{ page: number, pageSize: number }</code> — fired when the user changes page. In server-side mode, use this to fetch the next page of data.</span></div>
          <div class="prop-row"><span><code>table-column-toggle</code></span><span><code>{ column: string, hidden: boolean }</code> — fired when a column is shown or hidden via the column-toggle panel.</span></div>
        </div>
      </section>
    </div>
  `
}

function renderMenuPage() {
  return html`
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">Menu</h1>
        <p class="page-desc">Collapsible sidebar navigation with search, nested items, and keyboard support. The sidebar you're using right now is <code>app-menu</code>.</p>
      </div>

      <section class="demo-section">
        <h2 class="section-title">Use cases</h2>
        <p class="section-desc">
          Use <code>app-menu</code> for persistent app navigation in a sidebar: main nav items, optional footer items (e.g. Settings), and nested groups. Enable <code>searchable</code> when the list is long; use <code>collapsed</code> for an icon-only rail that expands on hover. For contextual action menus (e.g. row actions, toolbar dropdowns), use <code>app-dropdown-button</code> instead.
        </p>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Properties</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header">
            <span>Property</span><span>Type</span><span>Default</span><span>Description</span>
          </div>
          <div class="prop-row"><span><code>items</code></span><span><code>MenuItem[]</code></span><span><code>[]</code></span><span>Main nav items: <code>{ label, value?, icon?, href?, children? }</code>. Items with <code>children</code> render as expandable groups. Set via property.</span></div>
          <div class="prop-row"><span><code>footerItems</code></span><span><code>MenuItem[]</code></span><span><code>[]</code></span><span>Items rendered at the bottom of the sidebar (e.g. Settings); same shape as <code>items</code>.</span></div>
          <div class="prop-row"><span><code>activeValue</code></span><span><code>string</code></span><span>—</span><span>When equal to an item's <code>value</code>, that item gets <code>is-active</code> styling and <code>aria-current="page"</code> for the current page.</span></div>
          <div class="prop-row"><span><code>collapsed</code></span><span><code>boolean</code></span><span><code>false</code></span><span>When true, sidebar shows icons only; expands on hover to reveal labels. Use with <code>logo-icon</code> slot for a compact rail.</span></div>
          <div class="prop-row"><span><code>searchable</code></span><span><code>boolean</code></span><span><code>false</code></span><span>Shows a search input above main items; filters <code>items</code> and <code>footerItems</code> by label (case-insensitive).</span></div>
          <div class="prop-row"><span><code>searchPlaceholder</code></span><span><code>string</code></span><span><code>'Search…'</code></span><span>Placeholder text for the search input when <code>searchable</code> is true.</span></div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Slots</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header"><span>Slot</span><span colspan="3">Description</span></div>
          <div class="prop-row"><span><code>logo</code></span><span>Content shown when the menu is expanded (e.g. full "Web Components" text). Hidden when <code>collapsed</code>.</span></div>
          <div class="prop-row"><span><code>logo-icon</code></span><span>Content shown when <code>collapsed</code> (e.g. "WC" abbreviation). Displayed in the icon-only rail.</span></div>
          <div class="prop-row"><span><code>bottom</code></span><span>Rendered below <code>footerItems</code>, anchored to the bottom of the sidebar (e.g. dark mode toggle). Stays visible when search is used.</span></div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Events</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header"><span>Event</span><span colspan="3">Detail</span></div>
          <div class="prop-row"><span><code>menu-select</code></span><span><code>{ item: MenuItem, value?: string }</code> — fired when a leaf item is clicked; for items with <code>href</code> the browser may navigate unless you call <code>preventDefault()</code>.</span></div>
          <div class="prop-row"><span><code>menu-search</code></span><span><code>{ query: string }</code> — fired on input when <code>searchable</code> is true; use to sync search state or perform server-side search.</span></div>
        </div>
      </section>
    </div>
  `
}

function renderFormLayoutPage() {
  return html`
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">Form Layout</h1>
        <p class="page-desc">Configurable form shell with optional multi-step stages, 1–3 column grids, title, and description.</p>
      </div>

      <section class="demo-section">
        <h2 class="section-title">Use cases</h2>
        <p class="section-desc">
          Use <code>app-form-layout</code> for structured forms: contact forms (single column), profile or settings (2–3 columns), and multi-step wizards (onboarding, checkout). Use <code>seamless</code> when embedding inside <code>app-modal</code> so the form blends into the dialog. Single-step mode uses the <code>fields</code> slot; multi-step uses <code>stage-0</code>, <code>stage-1</code>, etc., with <code>stages</code> for labels.
        </p>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Single column — contact form</h2>
        <app-form-layout
          title="Contact us"
          description="We'll get back to you within 24 hours."
          @form-layout-submit=${() => console.log('contact form submitted')}
        >
          <app-input slot="fields" label="Full name" placeholder="Jane Smith" required></app-input>
          <app-input slot="fields" label="Email" type="email" placeholder="jane@example.com" required></app-input>
          <app-input slot="fields" label="Subject" placeholder="How can we help?"></app-input>
        </app-form-layout>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Two columns — profile settings</h2>
        <app-form-layout
          title="Profile settings"
          description="Update your personal information."
          .columns=${2}
          @form-layout-submit=${() => console.log('profile form submitted')}
        >
          <app-input slot="fields" label="First name" placeholder="Jane"></app-input>
          <app-input slot="fields" label="Last name" placeholder="Smith"></app-input>
          <app-input slot="fields" label="Email" type="email" placeholder="jane@example.com"></app-input>
          <app-input slot="fields" label="Phone" type="tel" placeholder="+1 (555) 000-0000"></app-input>
          <app-input slot="fields" label="Role" placeholder="Product Designer"></app-input>
          <app-input slot="fields" label="Department" placeholder="Design"></app-input>
        </app-form-layout>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Three columns — address form</h2>
        <app-form-layout
          title="Shipping address"
          description="Enter your delivery details."
          .columns=${3}
          @form-layout-submit=${() => console.log('address form submitted')}
        >
          <app-input slot="fields" label="Street address" placeholder="123 Main St"></app-input>
          <app-input slot="fields" label="Apt / Suite" placeholder="Apt 4B"></app-input>
          <app-input slot="fields" label="City" placeholder="New York"></app-input>
          <app-input slot="fields" label="State" placeholder="NY"></app-input>
          <app-input slot="fields" label="ZIP code" placeholder="10001"></app-input>
          <app-input slot="fields" label="Country" placeholder="United States"></app-input>
        </app-form-layout>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Multi-step wizard — account onboarding</h2>
        <app-form-layout
          title="Create your account"
          description="Complete the steps below to get started."
          .columns=${2}
          .stages=${['Personal info', 'Credentials', 'Review']}
          @form-layout-next=${(e: Event) => console.log('next →', (e as CustomEvent).detail)}
          @form-layout-back=${(e: Event) => console.log('← back', (e as CustomEvent).detail)}
          @form-layout-submit=${() => console.log('onboarding submitted')}
        >
          <!-- Stage 0: Personal info -->
          <app-input slot="stage-0" label="First name" placeholder="Jane"></app-input>
          <app-input slot="stage-0" label="Last name" placeholder="Smith"></app-input>
          <app-input slot="stage-0" label="Date of birth" type="date"></app-input>
          <app-input slot="stage-0" label="Phone" type="tel" placeholder="+1 (555) 000-0000"></app-input>

          <!-- Stage 1: Credentials -->
          <app-input slot="stage-1" label="Email" type="email" placeholder="jane@example.com" required></app-input>
          <app-input slot="stage-1" label="Username" placeholder="jane_smith"></app-input>
          <app-input slot="stage-1" label="Password" type="password" placeholder="••••••••" required></app-input>
          <app-input slot="stage-1" label="Confirm password" type="password" placeholder="••••••••" required></app-input>

          <!-- Stage 2: Review (1-col summary) -->
          <div slot="stage-2" style="grid-column:1/-1;padding:0.5rem 0">
            <p style="margin:0 0 0.5rem;font-size:0.9375rem;color:var(--color-text);font-weight:600">Ready to submit?</p>
            <p style="margin:0;font-size:0.875rem;color:var(--color-text-muted);line-height:1.6">
              Review your details above. Click <strong>Submit</strong> to create your account,
              or <strong>Back</strong> to make changes.
            </p>
          </div>
        </app-form-layout>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Properties</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header">
            <span>Property</span><span>Type</span><span>Default</span><span>Description</span>
          </div>
          <div class="prop-row"><span><code>title</code></span><span><code>string</code></span><span><code>''</code></span><span>Heading at the top of the form; always visible in single-step and multi-step.</span></div>
          <div class="prop-row"><span><code>description</code></span><span><code>string</code></span><span>—</span><span>Optional subtitle below the title; hidden when <code>seamless</code> is true.</span></div>
          <div class="prop-row"><span><code>columns</code></span><span><code>1 | 2 | 3</code></span><span><code>1</code></span><span>Number of columns in the fields grid; slotted fields flow into a CSS grid.</span></div>
          <div class="prop-row"><span><code>stages</code></span><span><code>string[]</code></span><span><code>[]</code></span><span>Stage labels for multi-step mode (e.g. <code>['Personal info', 'Credentials']</code>). Empty array = single-step; only <code>fields</code> slot is used.</span></div>
          <div class="prop-row"><span><code>seamless</code></span><span><code>boolean</code></span><span><code>false</code></span><span>When true, removes the outer card shell (border, background, radius). Use when embedding inside <code>app-modal</code> with <code>flush</code> so the form blends into the dialog.</span></div>
          <div class="prop-row"><span><code>current-stage</code></span><span><code>number</code></span><span><code>0</code></span><span>Active stage index in multi-step mode. Omit for uncontrolled (component manages state); set for controlled with <code>form-layout-next</code> / <code>form-layout-back</code>.</span></div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Slots</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header"><span>Slot</span><span colspan="3">Description</span></div>
          <div class="prop-row"><span><code>fields</code></span><span>Form fields for single-step mode. Slot all inputs/controls with <code>slot="fields"</code>; they are laid out in the grid defined by <code>columns</code>.</span></div>
          <div class="prop-row"><span><code>stage-{n}</code></span><span>In multi-step mode, fields for step <em>n</em> (zero-based): e.g. <code>slot="stage-0"</code>, <code>slot="stage-1"</code>. Only the active stage's slot content is shown. Submit button appears on the last stage.</span></div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Events</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header"><span>Event</span><span colspan="3">Detail</span></div>
          <div class="prop-row"><span><code>form-layout-next</code></span><span><code>{ stage: number }</code> — fired when the user clicks Next; <code>stage</code> is the new active index. In uncontrolled mode the component advances automatically.</span></div>
          <div class="prop-row"><span><code>form-layout-back</code></span><span><code>{ stage: number }</code> — fired when the user clicks Back; <code>stage</code> is the new active index.</span></div>
          <div class="prop-row"><span><code>form-layout-submit</code></span><span><code>{ stage: number }</code> — fired when the user clicks Submit (single-step or last step of multi-step). Handle here to validate and send data.</span></div>
        </div>
      </section>
    </div>
  `
}

function renderModalPage() {
  return html`
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">Modal</h1>
        <p class="page-desc">Dialog component for info messages, confirmations, simple forms, multi-step forms, and fully custom content. Supports focus trapping, Escape to close, and backdrop click.</p>
      </div>

      <section class="demo-section">
        <h2 class="section-title">Use cases</h2>
        <p class="section-desc">
          Use <code>app-modal</code> for: <strong>Info</strong> — single OK to acknowledge a message; <strong>Confirm</strong> — Cancel + Confirm for destructive or important choices; <strong>Form</strong> — Cancel + Save with slotted inputs; <strong>Multi-step</strong> — embed <code>app-form-layout</code> with <code>hide-actions</code> and <code>flush</code>; <strong>Custom footer</strong> — slot <code>footer</code> to replace built-in buttons (e.g. Save draft, Cancel, Submit).
        </p>
      </section>

      <!-- ── Info ── -->
      <section class="demo-section">
        <h2 class="section-title">Info — single OK button</h2>
        <div class="demo-row">
          <button class="demo-trigger-btn" @click=${() => { modalInfoOpen = true; rerenderDemo() }}>
            Open info modal
          </button>
        </div>
        <app-modal
          title="Changes saved"
          description="Your profile has been updated successfully."
          variant="info"
          ?open=${modalInfoOpen}
          @modal-close=${() => { modalInfoOpen = false; rerenderDemo() }}
          @modal-confirm=${(e: Event) => console.log('modal-confirm', (e as CustomEvent).detail)}
        ></app-modal>
      </section>

      <!-- ── Confirm ── -->
      <section class="demo-section">
        <h2 class="section-title">Confirm — Cancel + Confirm buttons</h2>
        <div class="demo-row">
          <button class="demo-trigger-btn" @click=${() => { modalConfirmOpen = true; rerenderDemo() }}>
            Open confirm modal
          </button>
        </div>
        <app-modal
          title="Delete record?"
          description="This action is permanent and cannot be undone. Are you sure you want to continue?"
          variant="confirm"
          confirm-label="Delete"
          ?open=${modalConfirmOpen}
          @modal-close=${() => { modalConfirmOpen = false; rerenderDemo() }}
          @modal-confirm=${(e: Event) => { console.log('modal-confirm', (e as CustomEvent).detail); modalConfirmOpen = false; rerenderDemo() }}
          @modal-cancel=${(e: Event) => { console.log('modal-cancel', (e as CustomEvent).detail); modalConfirmOpen = false; rerenderDemo() }}
        ></app-modal>
      </section>

      <!-- ── Simple form ── -->
      <section class="demo-section">
        <h2 class="section-title">Form — Cancel + Save with slotted inputs</h2>
        <div class="demo-row">
          <button class="demo-trigger-btn" @click=${() => { modalFormOpen = true; rerenderDemo() }}>
            Open form modal
          </button>
        </div>
        <app-modal
          title="Edit profile"
          description="Update your account information below."
          variant="form"
          ?open=${modalFormOpen}
          @modal-close=${() => { modalFormOpen = false; rerenderDemo() }}
          @modal-confirm=${(e: Event) => { console.log('modal-confirm (save)', (e as CustomEvent).detail); modalFormOpen = false; rerenderDemo() }}
          @modal-cancel=${(e: Event) => { console.log('modal-cancel', (e as CustomEvent).detail); modalFormOpen = false; rerenderDemo() }}
        >
          <app-input label="Full name" placeholder="Jane Smith" value="Jane Smith"></app-input>
          <app-input label="Email" type="email" placeholder="jane@example.com" value="jane@example.com"></app-input>
          <app-input label="Role" placeholder="Product Designer" value="Product Designer"></app-input>
        </app-modal>
      </section>

      <!-- ── Multi-step form ── -->
      <section class="demo-section">
        <h2 class="section-title">Multi-step form — embedded app-form-layout</h2>
        <p class="section-desc">
          Uses <code>size="lg"</code>, <code>hide-actions</code>, and <code>flush</code> on the modal,
          plus <code>seamless</code> on the form layout so it blends into the dialog.
          The form layout handles its own step navigation and Submit button.
        </p>
        <div class="demo-row">
          <button class="demo-trigger-btn" @click=${() => { modalMultiStepOpen = true; rerenderDemo() }}>
            Open multi-step modal
          </button>
        </div>
        <app-modal
          title="Create account"
          size="lg"
          hide-actions
          flush
          ?open=${modalMultiStepOpen}
          @modal-close=${() => { modalMultiStepOpen = false; rerenderDemo() }}
        >
          <app-form-layout
            seamless
            description="Complete the steps below to get started."
            .columns=${2}
            .stages=${['Personal info', 'Credentials', 'Review']}
            @form-layout-next=${(e: Event) => console.log('next →', (e as CustomEvent).detail)}
            @form-layout-back=${(e: Event) => console.log('← back', (e as CustomEvent).detail)}
            @form-layout-submit=${() => { console.log('form submitted'); modalMultiStepOpen = false; rerenderDemo() }}
          >
            <!-- Stage 0: Personal info -->
            <app-input slot="stage-0" label="First name" placeholder="Jane"></app-input>
            <app-input slot="stage-0" label="Last name" placeholder="Smith"></app-input>
            <app-input slot="stage-0" label="Date of birth" type="date"></app-input>
            <app-input slot="stage-0" label="Phone" type="tel" placeholder="+1 (555) 000-0000"></app-input>

            <!-- Stage 1: Credentials -->
            <app-input slot="stage-1" label="Email" type="email" placeholder="jane@example.com" required></app-input>
            <app-input slot="stage-1" label="Username" placeholder="jane_smith"></app-input>
            <app-input slot="stage-1" label="Password" type="password" placeholder="••••••••" required></app-input>
            <app-input slot="stage-1" label="Confirm password" type="password" placeholder="••••••••" required></app-input>

            <!-- Stage 2: Review -->
            <div slot="stage-2" style="grid-column:1/-1;padding:0.5rem 0">
              <p style="margin:0 0 0.5rem;font-size:0.9375rem;color:var(--color-text);font-weight:600">Ready to submit?</p>
              <p style="margin:0;font-size:0.875rem;color:var(--color-text-muted);line-height:1.6">
                Review your details above. Click <strong>Submit</strong> to create your account,
                or <strong>Back</strong> to make changes.
              </p>
            </div>
          </app-form-layout>
        </app-modal>
      </section>

      <!-- ── Custom footer buttons ── -->
      <section class="demo-section">
        <h2 class="section-title">Custom footer — slot="footer" replaces built-in buttons</h2>
        <p class="section-desc">
          Place any content in <code>slot="footer"</code> to replace the built-in action buttons.
          The slotted elements are laid out in a flex row aligned to the end of the dialog.
        </p>
        <div class="demo-row">
          <button class="demo-trigger-btn" @click=${() => { modalCustomOpen = true; rerenderDemo() }}>
            Open custom-footer modal
          </button>
        </div>
        <app-modal
          title="Submit support request"
          description="Describe your issue and we'll get back to you within one business day."
          ?open=${modalCustomOpen}
          @modal-close=${() => { modalCustomOpen = false; rerenderDemo() }}
        >
          <app-input label="Subject" placeholder="Brief description of the issue"></app-input>
          <app-input label="Severity" placeholder="Low / Medium / High / Critical"></app-input>
          <app-input label="Affected area" placeholder="e.g. Billing, Login, API"></app-input>

          <!-- Custom footer: three buttons — Save draft / Cancel / Submit -->
          <div slot="footer" style="display:contents">
            <app-button
              label="Save draft"
              style="margin-inline-end:auto"
              .onClick=${() => { console.log('save draft'); modalCustomOpen = false; rerenderDemo() }}
            ></app-button>
            <app-button
              label="Cancel"
              .onClick=${() => { console.log('cancel'); modalCustomOpen = false; rerenderDemo() }}
            ></app-button>
            <app-button
              label="Submit"
              .onClick=${() => { console.log('submit'); modalCustomOpen = false; rerenderDemo() }}
            ></app-button>
          </div>
        </app-modal>
      </section>

      <!-- ── Reference tables ── -->
      <section class="demo-section">
        <h2 class="section-title">Properties</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header">
            <span>Property</span><span>Type</span><span>Default</span><span>Description</span>
          </div>
          <div class="prop-row"><span><code>open</code></span><span><code>boolean</code></span><span><code>false</code></span><span>Controls visibility; set to <code>true</code> to open. Focus is trapped inside while open and restored to the previously focused element on close. Reflects to attribute for <code>:host([open])</code> styling.</span></div>
          <div class="prop-row"><span><code>title</code></span><span><code>string</code></span><span><code>''</code></span><span>Dialog heading; set as <code>aria-labelledby</code> for accessibility.</span></div>
          <div class="prop-row"><span><code>description</code></span><span><code>string</code></span><span>—</span><span>Optional subtitle; linked via <code>aria-describedby</code> when set.</span></div>
          <div class="prop-row"><span><code>variant</code></span><span><code>'info' | 'confirm' | 'form'</code></span><span><code>'info'</code></span><span><code>info</code> = single OK; <code>confirm</code> = Cancel + Confirm; <code>form</code> = Cancel + Save. Ignored when <code>slot="footer"</code> has content.</span></div>
          <div class="prop-row"><span><code>size</code></span><span><code>'sm' | 'md' | 'lg'</code></span><span><code>'md'</code></span><span>Dialog width: <code>sm</code> 24rem, <code>md</code> 32rem, <code>lg</code> 44rem. Use <code>lg</code> for multi-step or wide forms.</span></div>
          <div class="prop-row"><span><code>confirm-label</code></span><span><code>string</code></span><span><code>'Save' / 'Confirm'</code></span><span>Label for the primary action button (form vs confirm variant).</span></div>
          <div class="prop-row"><span><code>cancel-label</code></span><span><code>string</code></span><span><code>'Cancel'</code></span><span>Label for the secondary/cancel button.</span></div>
          <div class="prop-row"><span><code>ok-label</code></span><span><code>string</code></span><span><code>'OK'</code></span><span>Label for the single action in <code>variant="info"</code>.</span></div>
          <div class="prop-row"><span><code>hide-actions</code></span><span><code>boolean</code></span><span><code>false</code></span><span>When true, the built-in footer is hidden. Use with custom body content (e.g. embedded <code>app-form-layout</code>) that provides its own Submit/Back.</span></div>
          <div class="prop-row"><span><code>flush</code></span><span><code>boolean</code></span><span><code>false</code></span><span>Removes inner body padding so slotted content can extend edge-to-edge (e.g. form layout with <code>seamless</code>).</span></div>
          <div class="prop-row"><span><code>close-on-backdrop</code></span><span><code>boolean</code></span><span><code>true</code></span><span>When true, clicking the overlay closes the modal and fires <code>modal-close</code>. Set to <code>false</code> to require an explicit button or Escape.</span></div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Slots</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header"><span>Slot</span><span colspan="3">Description</span></div>
          <div class="prop-row"><span><em>(default)</em></span><span>Body content: form inputs, text, or any component. Rendered inside the scrollable dialog body; use with <code>flush</code> for full-bleed content.</span></div>
          <div class="prop-row"><span><code>footer</code></span><span>When slotted, replaces the built-in action buttons entirely. Content is laid out in a flex row at the end of the dialog; use for custom actions (e.g. Save draft, Cancel, Submit).</span></div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Events</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header"><span>Event</span><span colspan="3">Description</span></div>
          <div class="prop-row"><span><code>modal-confirm</code></span><span>Fired when the user clicks the primary button (OK, Confirm, or Save). Close the modal in your handler if you control <code>open</code>.</span></div>
          <div class="prop-row"><span><code>modal-cancel</code></span><span>Fired when the user clicks the Cancel button. Does not fire on backdrop click or Escape — use <code>modal-close</code> for those.</span></div>
          <div class="prop-row"><span><code>modal-close</code></span><span>Fired on any close: Escape key, backdrop click (if <code>close-on-backdrop</code>), or when OK/Confirm/Cancel is clicked. Restore focus after closing.</span></div>
        </div>
      </section>
    </div>

    <style>
      .demo-trigger-btn {
        display: inline-flex;
        align-items: center;
        padding: 0.5rem 1rem;
        font-size: 1rem;
        font-weight: 500;
        border: none;
        border-radius: var(--radius-button, 0.375rem);
        background: var(--color-primary);
        color: var(--color-text-inverse);
        cursor: pointer;
        transition: background-color 0.2s;
      }
      .demo-trigger-btn:hover { background: var(--color-primary-hover); }
      .demo-trigger-btn:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
      }
    </style>
  `
}

function renderTabsPage() {
  return html`
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">Tabs</h1>
        <p class="page-desc">Tabbed interface for switching between content panels.</p>
      </div>

      <section class="demo-section">
        <h2 class="section-title">Use cases</h2>
        <p class="section-desc">
          Use <code>app-tabs</code> to organize content into panels that share the same space. Ideal for settings pages, detail views, and dashboards. Pass a <code>.tabs</code> array to define the tab bar and use named <code>&lt;slot&gt;</code>s for each panel's content. Arrow keys navigate between tabs for keyboard accessibility.
        </p>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Basic</h2>
        <div class="demo-col">
          <app-tabs
            .tabs=${[
              { label: 'General', value: 'general' },
              { label: 'Notifications', value: 'notifications' },
              { label: 'Security', value: 'security' },
            ]}
            value="general"
          >
            <div slot="general">
              <p style="color:var(--color-text)">General account settings and preferences.</p>
            </div>
            <div slot="notifications">
              <p style="color:var(--color-text)">Manage your email and push notification preferences.</p>
            </div>
            <div slot="security">
              <p style="color:var(--color-text)">Two-factor authentication and password settings.</p>
            </div>
          </app-tabs>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">With disabled tab</h2>
        <div class="demo-col">
          <app-tabs
            .tabs=${[
              { label: 'Profile', value: 'profile' },
              { label: 'Billing', value: 'billing' },
              { label: 'Admin', value: 'admin', disabled: true },
            ]}
            value="profile"
          >
            <div slot="profile">
              <p style="color:var(--color-text)">Edit your name, avatar, and bio.</p>
            </div>
            <div slot="billing">
              <p style="color:var(--color-text)">Manage payment methods and invoices.</p>
            </div>
            <div slot="admin">
              <p style="color:var(--color-text)">Admin-only settings (requires elevated permissions).</p>
            </div>
          </app-tabs>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Event logging</h2>
        <p class="section-desc">Open the browser console and switch tabs to see <code>tab-change</code> events.</p>
        <div class="demo-col">
          <app-tabs
            .tabs=${[
              { label: 'Overview', value: 'overview' },
              { label: 'Analytics', value: 'analytics' },
              { label: 'Reports', value: 'reports' },
            ]}
            value="overview"
            @tab-change=${(e: Event) => console.log('tab-change:', (e as CustomEvent).detail)}
          >
            <div slot="overview">
              <p style="color:var(--color-text)">Dashboard overview with key metrics.</p>
            </div>
            <div slot="analytics">
              <p style="color:var(--color-text)">Detailed analytics and charts.</p>
            </div>
            <div slot="reports">
              <p style="color:var(--color-text)">Generate and download reports.</p>
            </div>
          </app-tabs>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Properties</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header">
            <span>Property</span><span>Type</span><span>Default</span><span>Description</span>
          </div>
          <div class="prop-row"><span><code>tabs</code></span><span><code>TabItem[]</code></span><span><code>[]</code></span><span>Array of tab definitions. Each item has <code>label</code>, <code>value</code>, and optional <code>disabled</code>.</span></div>
          <div class="prop-row"><span><code>value</code></span><span><code>string</code></span><span><code>''</code></span><span>The <code>value</code> of the currently active tab. Falls back to the first non-disabled tab.</span></div>
          <div class="prop-row"><span><code>onChange</code></span><span><code>(e: CustomEvent&lt;{ value: string }&gt;) => void</code></span><span>—</span><span>Optional callback fired after <code>tab-change</code>; set via property.</span></div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Events</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header"><span>Event</span><span colspan="3">Detail</span></div>
          <div class="prop-row"><span><code>tab-change</code></span><span><code>{ value: string }</code> — fired when the user selects a different tab.</span></div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Keyboard</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header"><span>Key</span><span colspan="3">Action</span></div>
          <div class="prop-row"><span><code>ArrowRight</code></span><span>Move focus to the next enabled tab (wraps).</span></div>
          <div class="prop-row"><span><code>ArrowLeft</code></span><span>Move focus to the previous enabled tab (wraps).</span></div>
          <div class="prop-row"><span><code>Home</code></span><span>Move focus to the first enabled tab.</span></div>
          <div class="prop-row"><span><code>End</code></span><span>Move focus to the last enabled tab.</span></div>
        </div>
      </section>
    </div>
  `
}

function renderSelectorPage() {
  return html`
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">Selector</h1>
        <p class="page-desc">Dropdown selector with optional search, chip display for selected items, single and multi-select modes, option groups, icons, and disabled items.</p>
      </div>

      <section class="demo-section">
        <h2 class="section-title">Use cases</h2>
        <p class="section-desc">
          Use <code>app-selector</code> for choosing one or multiple values from a list. Enable <code>searchable</code> for long lists. Use <code>multiple</code> for multi-select with chip display. In single-select mode the dropdown closes on pick; in multi-select it stays open. Chips have an <code>X</code> button to deselect, and you can also toggle items off directly in the dropdown.
        </p>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Single select</h2>
        <div class="demo-col" style="max-width:320px">
          <app-selector
            label="Favorite fruit"
            placeholder="Pick a fruit…"
            .items=${fruitOptions}
            .value=${selectorSingleValue}
            @selector-change=${(e: Event) => {
              selectorSingleValue = (e as CustomEvent).detail.value
              rerenderDemo()
            }}
          ></app-selector>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Multi-select with chips</h2>
        <div class="demo-col" style="max-width:320px">
          <app-selector
            label="Select fruits"
            placeholder="Pick fruits…"
            multiple
            .items=${fruitOptions}
            .value=${selectorMultiValue}
            @selector-change=${(e: Event) => {
              selectorMultiValue = (e as CustomEvent).detail.value
              rerenderDemo()
            }}
          ></app-selector>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Searchable multi-select</h2>
        <div class="demo-col" style="max-width:320px">
          <app-selector
            label="Countries"
            placeholder="Search countries…"
            multiple
            searchable
            .items=${countryOptions}
            .groups=${countryGroups}
            .value=${selectorSearchValue}
            @selector-change=${(e: Event) => {
              selectorSearchValue = (e as CustomEvent).detail.value
              rerenderDemo()
            }}
          ></app-selector>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Grouped with icons and disabled items</h2>
        <div class="demo-col" style="max-width:320px">
          <app-selector
            label="Assign role"
            placeholder="Choose a role…"
            .items=${roleOptions}
            .value=${selectorGroupedValue}
            @selector-change=${(e: Event) => {
              selectorGroupedValue = (e as CustomEvent).detail.value
              rerenderDemo()
            }}
          ></app-selector>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Disabled</h2>
        <div class="demo-col" style="max-width:320px">
          <app-selector
            label="Disabled selector"
            placeholder="Cannot select…"
            disabled
            .items=${fruitOptions}
            .value=${['banana']}
          ></app-selector>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Validation states</h2>
        <div class="demo-row" style="max-width:700px">
          <app-selector
            label="Valid"
            state="valid"
            .items=${fruitOptions}
            .value=${['apple']}
            style="flex:1;min-width:200px"
          ></app-selector>
          <app-selector
            label="Invalid"
            state="invalid"
            error-message="Please select at least one option."
            .items=${fruitOptions}
            .value=${[]}
            style="flex:1;min-width:200px"
          ></app-selector>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Properties</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header">
            <span>Property</span><span>Type</span><span>Default</span><span>Description</span>
          </div>
          <div class="prop-row"><span><code>items</code></span><span><code>SelectorOption[]</code></span><span><code>[]</code></span><span>Flat list of options. Each has <code>label</code>, <code>value</code>, optional <code>icon</code>, <code>disabled</code>, <code>group</code>.</span></div>
          <div class="prop-row"><span><code>groups</code></span><span><code>SelectorGroup[]</code></span><span><code>[]</code></span><span>Optional group definitions for ordering and labeling groups. Each has <code>key</code> and <code>label</code>.</span></div>
          <div class="prop-row"><span><code>value</code></span><span><code>string[]</code></span><span><code>[]</code></span><span>Currently selected values (array for both single and multi modes).</span></div>
          <div class="prop-row"><span><code>label</code></span><span><code>string</code></span><span><code>''</code></span><span>Label displayed above the selector.</span></div>
          <div class="prop-row"><span><code>placeholder</code></span><span><code>string</code></span><span><code>'Select…'</code></span><span>Placeholder text when nothing is selected.</span></div>
          <div class="prop-row"><span><code>searchable</code></span><span><code>boolean</code></span><span><code>false</code></span><span>Show a search input inside the dropdown for filtering options.</span></div>
          <div class="prop-row"><span><code>multiple</code></span><span><code>boolean</code></span><span><code>false</code></span><span>Enable multi-select mode with chip display.</span></div>
          <div class="prop-row"><span><code>disabled</code></span><span><code>boolean</code></span><span><code>false</code></span><span>Disable the selector.</span></div>
          <div class="prop-row"><span><code>name</code></span><span><code>string</code></span><span><code>''</code></span><span>Form field name.</span></div>
          <div class="prop-row"><span><code>state</code></span><span><code>'default' | 'valid' | 'invalid'</code></span><span><code>'default'</code></span><span>Visual validation state.</span></div>
          <div class="prop-row"><span><code>error-message</code></span><span><code>string</code></span><span><code>''</code></span><span>Error message shown when <code>state="invalid"</code>.</span></div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Events</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header"><span>Event</span><span colspan="3">Detail</span></div>
          <div class="prop-row"><span><code>selector-change</code></span><span><code>{ value: string[] }</code> — fired when selection changes. Array contains selected values.</span></div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Keyboard</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header"><span>Key</span><span colspan="3">Action</span></div>
          <div class="prop-row"><span><code>ArrowDown / ArrowUp</code></span><span>Navigate through options (wraps around).</span></div>
          <div class="prop-row"><span><code>Enter / Space</code></span><span>Open dropdown or toggle the focused option.</span></div>
          <div class="prop-row"><span><code>Escape</code></span><span>Close the dropdown and return focus to the trigger.</span></div>
          <div class="prop-row"><span><code>Home / End</code></span><span>Jump to first / last option.</span></div>
        </div>
      </section>
    </div>
  `
}

function renderRadioGroupPage() {
  return html`
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">Radio Group</h1>
        <p class="page-desc">Single-option selector with keyboard navigation and validation.</p>
      </div>

      <section class="demo-section">
        <h2 class="section-title">Use cases</h2>
        <p class="section-desc">
          Use <code>app-radio-group</code> for mutually-exclusive choices such as sizes, plans, or preferences. Pass an <code>items</code> array and listen to <code>radio-change</code> to track the selected value. Use <code>orientation="horizontal"</code> when space allows and the list is short. Disable individual items via <code>disabled</code> on the item, or disable the entire group with the <code>disabled</code> attribute.
        </p>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Basic (vertical)</h2>
        <div class="demo-col">
          <app-radio-group
            label="Size"
            .items=${radioSizeItems}
            .value=${radioSizeValue}
            @radio-change=${(e: CustomEvent) => { radioSizeValue = e.detail.value; rerenderDemo() }}
          ></app-radio-group>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Horizontal</h2>
        <div class="demo-col">
          <app-radio-group
            label="Size"
            orientation="horizontal"
            .items=${radioSizeItems}
            .value=${radioSizeValue}
            @radio-change=${(e: CustomEvent) => { radioSizeValue = e.detail.value; rerenderDemo() }}
          ></app-radio-group>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">With disabled option</h2>
        <div class="demo-col">
          <app-radio-group
            label="Plan"
            .items=${radioPlanItems}
            .value=${radioPlanValue}
            @radio-change=${(e: CustomEvent) => { radioPlanValue = e.detail.value; rerenderDemo() }}
          ></app-radio-group>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Disabled group</h2>
        <div class="demo-col">
          <app-radio-group
            label="Size (disabled)"
            disabled
            .items=${radioSizeItems}
            value="md"
          ></app-radio-group>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Validation</h2>
        <div class="demo-row">
          <app-radio-group
            label="Required field"
            state="invalid"
            error-message="Please select an option"
            .items=${radioSizeItems}
            .value=${radioValidationValue}
            @radio-change=${(e: CustomEvent) => { radioValidationValue = e.detail.value; rerenderDemo() }}
          ></app-radio-group>
          <app-radio-group
            label="Confirmed"
            state="valid"
            .items=${radioSizeItems}
            value="sm"
          ></app-radio-group>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Properties</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header">
            <span>Property</span><span>Type</span><span>Default</span><span>Description</span>
          </div>
          <div class="prop-row"><span><code>items</code></span><span><code>RadioGroupItem[]</code></span><span><code>[]</code></span><span>Array of options: <code>{ label, value, disabled? }</code>.</span></div>
          <div class="prop-row"><span><code>value</code></span><span><code>string</code></span><span><code>''</code></span><span>Currently selected value.</span></div>
          <div class="prop-row"><span><code>label</code></span><span><code>string</code></span><span><code>''</code></span><span>Visible group label rendered above the options.</span></div>
          <div class="prop-row"><span><code>name</code></span><span><code>string</code></span><span><code>''</code></span><span>Form field name.</span></div>
          <div class="prop-row"><span><code>disabled</code></span><span><code>boolean</code></span><span><code>false</code></span><span>Disables the entire group.</span></div>
          <div class="prop-row"><span><code>orientation</code></span><span><code>'vertical' | 'horizontal'</code></span><span><code>'vertical'</code></span><span>Layout direction of the radio options.</span></div>
          <div class="prop-row"><span><code>state</code></span><span><code>'default' | 'valid' | 'invalid'</code></span><span><code>'default'</code></span><span>Validation visual state.</span></div>
          <div class="prop-row"><span><code>error-message</code></span><span><code>string</code></span><span><code>''</code></span><span>Error text shown below the group when state is <code>'invalid'</code>.</span></div>
          <div class="prop-row"><span><code>onChange</code></span><span><code>(e: CustomEvent&lt;{ value: string }&gt;) => void</code></span><span>—</span><span>Optional callback; set via property.</span></div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Events</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header"><span>Event</span><span colspan="3">Detail</span></div>
          <div class="prop-row"><span><code>radio-change</code></span><span><code>{ value: string }</code> — fired when the selected option changes.</span></div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Keyboard</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header"><span>Key</span><span colspan="3">Action</span></div>
          <div class="prop-row"><span><code>Tab</code></span><span>Move focus into / out of the radio group.</span></div>
          <div class="prop-row"><span><code>Arrow Up / Left</code></span><span>Select the previous enabled option (wraps).</span></div>
          <div class="prop-row"><span><code>Arrow Down / Right</code></span><span>Select the next enabled option (wraps).</span></div>
          <div class="prop-row"><span><code>Space / Enter</code></span><span>Select the focused option.</span></div>
        </div>
      </section>
    </div>
  `
}

function renderCardPage() {
  return html`
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">Card</h1>
        <p class="page-desc">Collapsible content container with title, body, and footer slots. Supports elevated, outlined, and filled variants with optional click interaction.</p>
      </div>

      <section class="demo-section">
        <h2 class="section-title">Use cases</h2>
        <p class="section-desc">
          Use <code>app-card</code> to group related content into a visually distinct container. The title slot is always visible and acts as a toggle to expand or collapse the body. Use the <code>elevated</code> variant for prominent cards, <code>outlined</code> for subtle bordered cards, and <code>filled</code> for subdued background cards. Enable <code>clickable</code> when the entire card should act as an interactive target.
        </p>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Variants</h2>
        <div style="display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(250px,1fr))">
          <app-card variant="elevated">
            <span slot="title"><strong>Elevated</strong></span>
            <p style="margin:0;color:var(--color-text-muted)">This card uses a subtle box-shadow to create depth. Good for primary content sections.</p>
          </app-card>
          <app-card variant="outlined">
            <span slot="title"><strong>Outlined</strong></span>
            <p style="margin:0;color:var(--color-text-muted)">This card uses a border for definition. Works well in dense layouts.</p>
          </app-card>
          <app-card variant="filled">
            <span slot="title"><strong>Filled</strong></span>
            <p style="margin:0;color:var(--color-text-muted)">This card uses an elevated background color. Ideal for secondary content areas.</p>
          </app-card>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Collapsible</h2>
        <div style="display:grid;gap:1rem;max-width:400px">
          <app-card variant="outlined">
            <span slot="title"><strong>Starts open (default)</strong></span>
            <p style="margin:0;color:var(--color-text-muted)">Click the header to collapse this card. The chevron rotates to indicate state.</p>
          </app-card>
          <app-card variant="outlined" .open=${false}>
            <span slot="title"><strong>Starts closed</strong></span>
            <p style="margin:0;color:var(--color-text-muted)">This card starts collapsed. Click the header to expand it.</p>
          </app-card>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Clickable</h2>
        <div style="display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(250px,1fr))">
          <app-card variant="elevated" clickable .onClick=${() => console.log('Card 1 clicked')}>
            <span slot="title"><strong>Clickable elevated</strong></span>
            <p style="margin:0;color:var(--color-text-muted)">Hover to see the shadow lift. Click anywhere on the card body.</p>
          </app-card>
          <app-card variant="outlined" clickable .onClick=${() => console.log('Card 2 clicked')}>
            <span slot="title"><strong>Clickable outlined</strong></span>
            <p style="margin:0;color:var(--color-text-muted)">Hover to see the border darken.</p>
          </app-card>
          <app-card variant="filled" clickable .onClick=${() => console.log('Card 3 clicked')}>
            <span slot="title"><strong>Clickable filled</strong></span>
            <p style="margin:0;color:var(--color-text-muted)">Hover to see the background shift.</p>
          </app-card>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">With footer</h2>
        <div style="max-width:400px">
          <app-card variant="outlined">
            <span slot="title"><strong>User profile</strong></span>
            <div>
              <p style="margin:0 0 0.5rem;color:var(--color-text-muted)">Jane Doe — Software Engineer</p>
              <p style="margin:0;color:var(--color-text-muted)">Building great things with web components.</p>
            </div>
            <div slot="footer" style="display:flex;gap:0.5rem;padding-top:0.75rem;border-top:1px solid var(--color-border)">
              <app-button label="Edit" variant="secondary"></app-button>
              <app-button label="Delete" variant="danger"></app-button>
            </div>
          </app-card>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Properties</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header">
            <span>Property</span><span>Type</span><span>Default</span><span>Description</span>
          </div>
          <div class="prop-row"><span><code>variant</code></span><span><code>'elevated' | 'outlined' | 'filled'</code></span><span><code>'elevated'</code></span><span>Visual style variant controlling shadow, border, or background treatment.</span></div>
          <div class="prop-row"><span><code>open</code></span><span><code>boolean</code></span><span><code>true</code></span><span>Whether the card body is expanded. Toggle by clicking the title row.</span></div>
          <div class="prop-row"><span><code>clickable</code></span><span><code>boolean</code></span><span><code>false</code></span><span>Enables hover/active effects and click handling on the entire card.</span></div>
          <div class="prop-row"><span><code>onClick</code></span><span><code>(e: MouseEvent) => void</code></span><span>—</span><span>Optional callback when the card is clicked (only fires when <code>clickable</code> is true). Set via property.</span></div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Slots</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header"><span>Slot</span><span>Description</span></div>
          <div class="prop-row"><span><code>title</code></span><span>Header content, always visible. Clicking it toggles the card body open/closed.</span></div>
          <div class="prop-row"><span><em>(default)</em></span><span>Main body content. Hidden when the card is collapsed.</span></div>
          <div class="prop-row"><span><code>footer</code></span><span>Bottom actions area. Hidden when the card is collapsed.</span></div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Events</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header"><span>Event</span><span>Detail</span><span>Description</span></div>
          <div class="prop-row"><span><code>card-toggle</code></span><span><code>{ open: boolean }</code></span><span>Fires when the card is toggled open or closed via the title row.</span></div>
        </div>
      </section>

      <section class="demo-section">
        <h2 class="section-title">Keyboard</h2>
        <div class="props-table">
          <div class="prop-row prop-row--header"><span>Key</span><span>Action</span></div>
          <div class="prop-row"><span><code>Enter / Space</code></span><span>Toggle the card open/closed when the title row is focused.</span></div>
          <div class="prop-row"><span><code>Tab</code></span><span>Move focus to/from the title toggle button.</span></div>
        </div>
      </section>
    </div>
  `
}

function renderPage(page: string) {
  switch (page) {
    case 'button':      return renderButtonPage()
    case 'dropdown':    return renderDropdownPage()
    case 'input':       return renderInputPage()
    case 'toggle':      return renderTogglePage()
    case 'table':       return renderTablePage()
    case 'menu':        return renderMenuPage()
    case 'form-layout': return renderFormLayoutPage()
    case 'modal':       return renderModalPage()
    case 'tabs':        return renderTabsPage()
    case 'selector':    return renderSelectorPage()
    case 'radio-group': return renderRadioGroupPage()
    case 'card':        return renderCardPage()
    default:            return renderButtonPage()
  }
}

// ── Main render ──────────────────────────────────────────────────────────────

const demoEl = document.querySelector<HTMLDivElement>('#app')!

function rerenderDemo() {
  render(html`
    <app-layout>
      <app-menu
        slot="sidebar"
        collapsed
        searchable
        searchPlaceholder="Search…"
        .items=${sidebarItems}
        .footerItems=${sidebarFooterItems}
        .activeValue=${activePage}
        @menu-select=${(e: Event) => {
          const val = (e as CustomEvent).detail.value as string
          if (val && val !== '_components_group' && val !== '_layouts_group') navigate(val)
        }}
      >
        <span slot="logo" class="demo-logo">Web Components</span>
        <span slot="logo-icon" class="demo-logo-icon" aria-hidden="true">WC</span>
        <app-toggle
          slot="bottom"
          label="Dark mode"
          ?checked=${isDark}
          @toggle-change=${(e: Event) => {
            isDark = (e as CustomEvent<ToggleChangeEventDetail>).detail.checked
            applyTheme(isDark)
            rerenderDemo()
          }}
        >
          <svg slot="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </app-toggle>
      </app-menu>

      <main slot="content" class="demo-main">
        ${renderPage(activePage)}
      </main>
    </app-layout>

    <style>
      .demo-main {
        background: var(--color-surface-elevated, #fafafa);
        min-height: 100%;
      }
      .demo-logo {
        font-weight: 700;
        font-size: 1.125rem;
        color: var(--color-text, #333);
      }
      .demo-logo-icon {
        font-weight: 700;
        font-size: 0.875rem;
        color: var(--color-primary, #6366f1);
        letter-spacing: -0.02em;
      }

      /* Page layout */
      .page-content {
        max-width: 860px;
        margin: 0 auto;
        padding: 2.5rem 2rem;
        display: flex;
        flex-direction: column;
        gap: 2.5rem;
      }
      .page-header {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        border-bottom: 1px solid var(--color-border);
        padding-bottom: 1.25rem;
      }
      .page-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--color-text);
        margin: 0;
      }
      .page-desc {
        font-size: 0.9375rem;
        color: var(--color-text-muted);
        margin: 0;
      }

      /* Demo sections */
      .demo-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .section-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--color-text);
        margin: 0;
      }
      .section-desc {
        margin: 0;
        font-size: 0.875rem;
        color: var(--color-text-muted);
        line-height: 1.6;
      }
      .demo-row {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: 0.75rem;
      }
      .demo-col {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .demo-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1.25rem;
      }

      /* Status badges (table) */
      .status-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: capitalize;
      }
      .status-active   { background: oklch(0.93 0.08 160); color: oklch(0.3 0.12 160); }
      .status-inactive { background: oklch(0.93 0.02 0);   color: oklch(0.4 0.06 0);   }

      /* Props reference table */
      .props-table {
        display: flex;
        flex-direction: column;
        border: 1px solid var(--color-border);
        border-radius: 0.5rem;
        overflow: hidden;
        font-size: 0.875rem;
      }
      .prop-row {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 2fr;
        gap: 0.5rem;
        padding: 0.625rem 0.875rem;
        border-bottom: 1px solid var(--color-border);
        color: var(--color-text);
        align-items: start;
      }
      .prop-row:last-child { border-bottom: none; }
      .prop-row--header {
        background: var(--color-surface-elevated);
        font-weight: 600;
        color: var(--color-text-muted);
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .prop-row code {
        font-family: ui-monospace, monospace;
        font-size: 0.8125rem;
        background: var(--color-surface-elevated);
        padding: 1px 4px;
        border-radius: 3px;
        border: 1px solid var(--color-border);
      }
    </style>
  `, demoEl)

  // Wire up tables imperatively only on the table page
  if (activePage === 'table') {
    requestAnimationFrame(() => {
      const fullTableContainer = document.querySelector('#full-table')
      if (fullTableContainer && !fullTableContainer.querySelector('app-table')) {
        const el = document.createElement('app-table') as import('./components/table').Table
        fullTableContainer.appendChild(el)
        el.columns = columns
        el.rows = mockTableRows as unknown as Record<string, unknown>[]
        el.pageSize = 8
        el.showColumnToggle = true
        el.addEventListener('table-sort', (e: Event) => console.log('sort:', (e as CustomEvent).detail))
        el.addEventListener('table-page', (e: Event) => console.log('page:', (e as CustomEvent).detail))
        el.addEventListener('table-column-toggle', (e: Event) => console.log('toggle:', (e as CustomEvent).detail))
      }

      const simpleTableContainer = document.querySelector('#simple-table')
      if (simpleTableContainer && !simpleTableContainer.querySelector('app-table')) {
        const el = document.createElement('app-table') as import('./components/table').Table
        simpleTableContainer.appendChild(el)
        el.columns = simpleColumns
        el.rows = mockTableRowsSmall as unknown as Record<string, unknown>[]
      }

      const serverTableContainer = document.querySelector('#server-table')
      let serverEl = serverTableContainer?.querySelector('app-table') as import('./components/table').Table | null
      if (serverTableContainer && !serverEl) {
        serverEl = document.createElement('app-table') as import('./components/table').Table
        serverTableContainer.appendChild(serverEl)
        serverEl.columns = simpleColumns
        serverEl.pageSize = SERVER_PAGE_SIZE
        serverEl.externalSort = true
        serverEl.addEventListener('table-page', (e: Event) => {
          const { page } = (e as CustomEvent).detail
          simulateFetchPage(page)
        })
        serverEl.addEventListener('table-sort', (e: Event) => {
          console.log('server sort:', (e as CustomEvent).detail)
        })
      }
      if (serverEl) {
        serverEl.rows = serverRows
        serverEl.totalItems = SERVER_TOTAL
        serverEl.page = serverPage
        serverEl.loading = serverLoading
      }
    })
  }
}

rerenderDemo()
