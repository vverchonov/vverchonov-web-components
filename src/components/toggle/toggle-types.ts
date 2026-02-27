/** Icon placement relative to the toggle label. */
export type ToggleIconPosition = 'start' | 'end'

/** Detail payload for the `toggle-change` custom event. */
export interface ToggleChangeEventDetail {
  /** Current checked state after the toggle. */
  checked: boolean
}
