import type { TemplateResult } from 'lit'

/** Describes a single column in `<app-table>`. */
export interface ColumnDef<T = Record<string, unknown>> {
  /** Unique key — matched against row object properties for default text rendering. */
  key: string
  /** Column header label. */
  label: string
  /** When set, columns sharing the same group string are merged under a group header row. */
  group?: string
  /** Adds a clickable sort indicator in the header. */
  sortable?: boolean
  /** Start hidden; the user can reveal it via the column-toggle panel. */
  hidden?: boolean
  /** Fixed column width, e.g. '200px'. Omit for auto. */
  width?: string
  /**
   * Custom cell renderer. Return a Lit TemplateResult (or any renderable value).
   * The result is rendered directly inside the table's Shadow DOM — no extra
   * shadow root per cell.
   */
  renderCell?: (row: T, rowIndex: number) => TemplateResult | unknown
}

/** Sort direction for a table column. */
export type SortDir = 'asc' | 'desc'

/** Detail payload for the `table-sort` custom event. */
export interface TableSortEvent {
  /** Key of the column being sorted. */
  column: string
  /** Current sort direction. */
  dir: SortDir
  /** Active page size (useful when re-fetching server data). */
  pageSize: number
}

/** Detail payload for the `table-page` custom event. */
export interface TablePageEvent {
  /** Newly selected page (1-based). */
  page: number
  /** Active page size. */
  pageSize: number
}

/** Detail payload for the `table-column-toggle` custom event. */
export interface TableColumnToggleEvent {
  /** Key of the toggled column. */
  column: string
  /** Whether the column is now hidden. */
  hidden: boolean
}
