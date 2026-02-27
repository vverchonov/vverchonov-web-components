import type { TemplateResult } from 'lit'

/** A single navigation item (or parent of nested items) in `<app-menu>`. */
export interface MenuItem {
  /** Visible label text. */
  label: string
  /** Unique value emitted in the `menu-select` event. */
  value?: string
  /** Per-item icon: a slot name string or an inline Lit TemplateResult. */
  icon?: string | TemplateResult
  /** When set, the item renders as an `<a>` link instead of a `<button>`. */
  href?: string
  /** @deprecated Use `activeValue` on the component instead. */
  active?: boolean
  /** Nested child items; renders an expandable sub-menu when present. */
  children?: MenuItem[]
}

/** Detail payload for the `menu-select` custom event. */
export interface MenuSelectEventDetail {
  /** The selected item object. */
  item: MenuItem
  /** Shorthand for `item.value`. */
  value: string | undefined
}

/** Detail payload for the `menu-search` custom event. */
export interface MenuSearchEventDetail {
  /** Current search query string. */
  query: string
}
