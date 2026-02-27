import type { TemplateResult } from 'lit'

/** Direction the dropdown panel opens relative to the trigger. */
export type DropdownPlacement = 'bottom' | 'top'

/** A single item (or parent of nested items) in a dropdown menu. */
export interface DropdownItem {
  /** Visible label text. */
  label: string
  /** Value emitted in the `dropdown-select` event. */
  value?: string
  /** Per-item icon: a slot name string or an inline Lit TemplateResult. */
  icon?: string | TemplateResult
  /** Nested child items; renders an inline sub-menu when present. */
  children?: DropdownItem[]
}

/** Detail payload for the `dropdown-select` custom event. */
export interface DropdownSelectEventDetail {
  /** The selected item object. */
  item: DropdownItem
  /** Shorthand for `item.value`. */
  value?: string
}
