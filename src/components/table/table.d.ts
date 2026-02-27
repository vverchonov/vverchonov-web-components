import type { Table } from './table'

declare global {
  interface HTMLElementTagNameMap {
    'app-table': Table
  }
}
