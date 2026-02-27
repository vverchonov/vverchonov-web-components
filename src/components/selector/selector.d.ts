import type { Selector } from './selector'

declare global {
  interface HTMLElementTagNameMap {
    'app-selector': Selector
  }
}
