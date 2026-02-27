import type { Button } from './button'

declare global {
  interface HTMLElementTagNameMap {
    'app-button': Button
  }
}
