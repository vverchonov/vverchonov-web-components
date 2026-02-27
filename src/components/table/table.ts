import { LitElement, html, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import tableStyles from './table.css?inline'
import type { ColumnDef, SortDir, TableColumnToggleEvent, TablePageEvent, TableSortEvent } from './table-types'

/**
 * Data table with sortable columns, pagination, column-visibility toggle,
 * and optional server-side data mode.
 *
 * @tag app-table
 * @fires table-sort - Fired when a sortable column header is clicked. Detail: `{ column, dir, pageSize }`.
 * @fires table-page - Fired when the user navigates to a different page. Detail: `{ page, pageSize }`.
 * @fires table-column-toggle - Fired when a column is shown/hidden via the toggle panel. Detail: `{ column, hidden }`.
 */
@customElement('app-table')
export class Table extends LitElement {
  static override styles = [unsafeCSS(tableStyles)]

  // ── Public properties ──────────────────────────────────────────────────────

  /** Column definitions describing each table column. */
  @property({ attribute: false })
  columns: ColumnDef<any>[] = []

  /** Row data objects keyed by column `key`. */
  @property({ attribute: false })
  rows: Record<string, unknown>[] = []

  /** If > 0, enables pagination with this many rows per page. */
  @property({ type: Number, attribute: 'page-size' })
  pageSize = 0

  /**
   * Total number of items across all pages. When > 0 (with pageSize > 0),
   * the table enters server-side pagination mode: `rows` is treated as the
   * current page's data and no local slicing is performed.
   */
  @property({ type: Number, attribute: 'total-items' })
  totalItems = 0

  /** Current page (1-based). Can be set externally to navigate programmatically. */
  @property({ type: Number })
  page = 1

  /** Shows a loading overlay on the table body while data is being fetched. */
  @property({ type: Boolean })
  loading = false

  /** When true, sorting is not performed locally — only the `table-sort` event fires. */
  @property({ type: Boolean, attribute: 'external-sort' })
  externalSort = false

  /** Show the column visibility toggle panel. */
  @property({ type: Boolean, attribute: 'show-column-toggle' })
  showColumnToggle = false

  // ── Internal state ─────────────────────────────────────────────────────────

  @state() private _hiddenCols: Set<string> = new Set()
  @state() private _sortCol: string | null = null
  @state() private _sortDir: SortDir = 'asc'
  @state() private _togglePanelOpen = false

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  override willUpdate(changed: Map<string, unknown>) {
    if (changed.has('columns')) {
      const initial = new Set<string>()
      for (const col of this.columns) {
        if (col.hidden) initial.add(col.key)
      }
      this._hiddenCols = initial
    }
    if (
      (changed.has('rows') || changed.has('pageSize')) &&
      !this._isServerPagination
    ) {
      this.page = 1
    }
  }

  // ── Derived helpers ────────────────────────────────────────────────────────

  private get _visibleCols(): ColumnDef[] {
    return this.columns.filter(c => !this._hiddenCols.has(c.key))
  }

  private get _hasGroups(): boolean {
    return this.columns.some(c => c.group)
  }

  private get _hasPagination(): boolean {
    return this.pageSize > 0
  }

  private get _isServerPagination(): boolean {
    return this.totalItems > 0 && this.pageSize > 0
  }

  private get _sortedRows(): Record<string, unknown>[] {
    if (this.externalSort || !this._sortCol) return this.rows
    const col = this._sortCol
    const dir = this._sortDir === 'asc' ? 1 : -1
    return [...this.rows].sort((a, b) => {
      const av = a[col]
      const bv = b[col]
      if (av == null && bv == null) return 0
      if (av == null) return dir
      if (bv == null) return -dir
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
      return String(av).localeCompare(String(bv)) * dir
    })
  }

  private get _pagedRows(): Record<string, unknown>[] {
    if (this._isServerPagination) return this._sortedRows
    if (!this._hasPagination) return this._sortedRows
    const start = (this.page - 1) * this.pageSize
    return this._sortedRows.slice(start, start + this.pageSize)
  }

  private get _totalPages(): number {
    if (this._isServerPagination)
      return Math.max(1, Math.ceil(this.totalItems / this.pageSize))
    if (!this._hasPagination) return 1
    return Math.max(1, Math.ceil(this.rows.length / this.pageSize))
  }

  // ── Event helpers ──────────────────────────────────────────────────────────

  private _dispatchSort(column: string, dir: SortDir) {
    this.dispatchEvent(new CustomEvent<TableSortEvent>('table-sort', {
      detail: { column, dir, pageSize: this.pageSize },
      bubbles: true,
      composed: true,
    }))
  }

  private _dispatchPage(page: number) {
    this.dispatchEvent(new CustomEvent<TablePageEvent>('table-page', {
      detail: { page, pageSize: this.pageSize },
      bubbles: true,
      composed: true,
    }))
  }

  private _dispatchColumnToggle(column: string, hidden: boolean) {
    this.dispatchEvent(new CustomEvent<TableColumnToggleEvent>('table-column-toggle', {
      detail: { column, hidden },
      bubbles: true,
      composed: true,
    }))
  }

  // ── Interaction handlers ───────────────────────────────────────────────────

  private _handleSortClick(key: string) {
    if (this._sortCol === key) {
      this._sortDir = this._sortDir === 'asc' ? 'desc' : 'asc'
    } else {
      this._sortCol = key
      this._sortDir = 'asc'
    }
    if (!this._isServerPagination) this.page = 1
    this._dispatchSort(this._sortCol, this._sortDir)
  }

  private _handleToggleColumn(key: string) {
    const next = new Set(this._hiddenCols)
    const nowHidden = !next.has(key)
    if (nowHidden) {
      next.add(key)
    } else {
      next.delete(key)
    }
    this._hiddenCols = next
    this._dispatchColumnToggle(key, nowHidden)
  }

  private _handlePageChange(page: number) {
    this.page = Math.max(1, Math.min(page, this._totalPages))
    this._dispatchPage(this.page)
  }

  // ── Render helpers ─────────────────────────────────────────────────────────

  private _renderColumnToggle() {
    return html`
      <div class="toolbar">
        <button
          class="toggle-btn"
          aria-expanded=${this._togglePanelOpen}
          @click=${() => { this._togglePanelOpen = !this._togglePanelOpen }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="1" y="3" width="14" height="1.5" rx=".75" fill="currentColor"/>
            <rect x="1" y="7.25" width="14" height="1.5" rx=".75" fill="currentColor"/>
            <rect x="1" y="11.5" width="14" height="1.5" rx=".75" fill="currentColor"/>
            <circle cx="5" cy="3.75" r="2" fill="var(--color-surface)" stroke="currentColor" stroke-width="1.5"/>
            <circle cx="11" cy="8" r="2" fill="var(--color-surface)" stroke="currentColor" stroke-width="1.5"/>
            <circle cx="5" cy="12.25" r="2" fill="var(--color-surface)" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          Columns
        </button>

        ${this._togglePanelOpen ? html`
          <div class="toggle-panel" role="menu">
            ${this.columns.map(col => html`
              <label class="toggle-item" role="menuitemcheckbox">
                <input
                  type="checkbox"
                  .checked=${!this._hiddenCols.has(col.key)}
                  @change=${() => this._handleToggleColumn(col.key)}
                />
                ${col.label}
              </label>
            `)}
          </div>
        ` : nothing}
      </div>
    `
  }

  private _renderGroupRow(visibleCols: ColumnDef[]) {
    // Build group spans: consecutive columns sharing the same group are merged
    const spans: Array<{ label: string | null; span: number }> = []
    for (const col of visibleCols) {
      const last = spans[spans.length - 1]
      if (last && last.label === (col.group ?? null)) {
        last.span++
      } else {
        spans.push({ label: col.group ?? null, span: 1 })
      }
    }
    return html`
      <tr class="group-row">
        ${spans.map(s => html`
          <th
            colspan=${s.span}
            class=${s.label ? 'group-header' : 'group-empty'}
          >${s.label ?? ''}</th>
        `)}
      </tr>
    `
  }

  private _renderHeaderRow(visibleCols: ColumnDef[]) {
    return html`
      <tr>
        ${visibleCols.map(col => {
          const isSorted = this._sortCol === col.key
          return html`
            <th
              style=${col.width ? `width:${col.width}` : ''}
              class=${col.sortable ? 'sortable' : ''}
              aria-sort=${isSorted ? (this._sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              ${col.sortable ? html`
                <button class="sort-btn" @click=${() => this._handleSortClick(col.key)}>
                  <span>${col.label}</span>
                  <svg
                    class="sort-icon sort-icon--${isSorted ? this._sortDir : 'none'}"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path class="sort-asc"  d="M6 1 L10 6 H2 Z"/>
                    <path class="sort-desc" d="M6 11 L2 6 H10 Z"/>
                  </svg>
                </button>
              ` : col.label}
            </th>
          `
        })}
      </tr>
    `
  }

  private _renderRows(visibleCols: ColumnDef[]) {
    const rows = this._pagedRows
    if (rows.length === 0) {
      return html`
        <tr>
          <td class="empty-cell" colspan=${visibleCols.length}>No data</td>
        </tr>
      `
    }

    return repeat(
      rows,
      (_, i) => i,
      (row, rowIndex) => html`
        <tr>
          ${visibleCols.map(col => html`
            <td style=${col.width ? `width:${col.width}` : ''}>
              ${col.renderCell
                ? col.renderCell(row, rowIndex)
                : row[col.key] ?? ''}
            </td>
          `)}
        </tr>
      `
    )
  }

  private _renderPagination() {
    const totalPages = this._totalPages
    const page = this.page
    const itemCount = this._isServerPagination ? this.totalItems : this.rows.length

    const pages: Array<number | 'ellipsis'> = []
    const add = (n: number) => { if (!pages.includes(n)) pages.push(n) }
    add(1)
    if (page - 2 > 2) pages.push('ellipsis')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) add(i)
    if (page + 2 < totalPages - 1) pages.push('ellipsis')
    if (totalPages > 1) add(totalPages)

    const startItem = (page - 1) * this.pageSize + 1
    const endItem = Math.min(page * this.pageSize, itemCount)

    return html`
      <div class="pagination" role="navigation" aria-label="Pagination">
        <span class="page-info">${startItem}–${endItem} of ${itemCount}</span>
        <div class="page-controls">
          <button
            class="page-btn"
            ?disabled=${page === 1}
            aria-label="Previous page"
            @click=${() => this._handlePageChange(page - 1)}
          >‹</button>

          ${pages.map(p => p === 'ellipsis'
            ? html`<span class="page-ellipsis">…</span>`
            : html`
              <button
                class="page-btn ${p === page ? 'active' : ''}"
                aria-current=${p === page ? 'page' : nothing}
                @click=${() => this._handlePageChange(p as number)}
              >${p}</button>
            `
          )}

          <button
            class="page-btn"
            ?disabled=${page === totalPages}
            aria-label="Next page"
            @click=${() => this._handlePageChange(page + 1)}
          >›</button>
        </div>
      </div>
      <span class="sr-only" aria-live="polite">Page ${page} of ${totalPages}</span>
    `
  }

  // ── Main render ────────────────────────────────────────────────────────────

  override render() {
    const visibleCols = this._visibleCols

    return html`
      ${this.showColumnToggle ? this._renderColumnToggle() : nothing}

      <div class="table-wrapper" role="region" aria-label="Data table">
        <table aria-busy=${this.loading}>
          <thead>
            ${this._hasGroups ? this._renderGroupRow(visibleCols) : nothing}
            ${this._renderHeaderRow(visibleCols)}
          </thead>
          <tbody>
            ${this._renderRows(visibleCols)}
          </tbody>
        </table>

        ${this.loading ? html`
          <div class="loading-overlay" role="status">
            <div class="spinner" aria-hidden="true"></div>
            <span class="sr-only">Loading table data</span>
          </div>
        ` : nothing}
      </div>

      ${this._hasPagination ? this._renderPagination() : nothing}
    `
  }
}
