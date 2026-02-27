import type { TemplateResult } from 'lit'

/** Visual validation state for `<app-selector>`. */
export type SelectorState = 'default' | 'valid' | 'invalid'

/** A single option in `<app-selector>`. */
export interface SelectorOption {
  /** Visible label text. */
  label: string
  /** Unique value identifying this option. */
  value: string
  /** Per-item icon: a slot name string or an inline Lit TemplateResult. */
  icon?: string | TemplateResult
  /** When true the option cannot be selected. */
  disabled?: boolean
  /** Group key — matches `SelectorGroup.key` for visual grouping. */
  group?: string
}

/** Defines a named group for visually grouping selector options. */
export interface SelectorGroup {
  /** Unique group identifier referenced by `SelectorOption.group`. */
  key: string
  /** Visible group header label. */
  label: string
}

/** Detail payload for the `selector-change` custom event. */
export interface SelectorChangeEventDetail {
  /** Selected values. Always an array (single-select wraps in a one-element array). */
  value: string[]
}
