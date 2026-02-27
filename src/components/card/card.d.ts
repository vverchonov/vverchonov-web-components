import type { Card } from './card'

declare global {
  interface HTMLElementTagNameMap {
    'app-card': Card
  }
}
