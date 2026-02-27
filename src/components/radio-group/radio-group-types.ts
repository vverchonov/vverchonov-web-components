/** Layout direction for `<app-radio-group>`. */
export type RadioGroupOrientation = 'vertical' | 'horizontal'

/** Visual validation state for `<app-radio-group>`. */
export type RadioGroupState = 'default' | 'valid' | 'invalid'

/** A single option in `<app-radio-group>`. */
export interface RadioGroupItem {
  /** Visible label text. */
  label: string
  /** Unique value identifying this option. */
  value: string
  /** When true the option cannot be selected. */
  disabled?: boolean
}

/** Detail payload for the `radio-change` custom event. */
export interface RadioGroupChangeEventDetail {
  /** The newly selected value. */
  value: string
}
