import type { TemplateResult } from 'lit'

/** A single menu item in `<app-dropdown-button>`. */
export interface DropdownItem {
  /** Visible label text. */
  label: string
  /** Optional value identifying this item; emitted in `dropdown-select` detail. */
  value?: string
  /** Optional icon (Lit TemplateResult) shown before the label. */
  icon?: TemplateResult
  /** When true the item cannot be selected. */
  disabled?: boolean
  /** Group key — matches `DropdownGroup.key` for visual grouping. */
  group?: string
}

/** Defines a named group for visually grouping dropdown items. */
export interface DropdownGroup {
  /** Unique group identifier referenced by `DropdownItem.group`. */
  key: string
  /** Visible group header label. */
  label: string
}

/** Preferred placement direction for the dropdown panel. */
export type DropdownPlacement = 'bottom' | 'top'

/** Detail payload for the `dropdown-select` custom event. */
export interface DropdownSelectEventDetail {
  /** The selected item. */
  item: DropdownItem
  /** The item's value, if defined. */
  value?: string
}
