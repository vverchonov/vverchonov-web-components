/** Visual style variant for `<app-card>`. */
export type CardVariant = 'elevated' | 'outlined' | 'filled'

/** Detail payload for the `card-toggle` custom event. */
export interface CardToggleEventDetail {
  /** Whether the card body is now visible. */
  open: boolean
}
