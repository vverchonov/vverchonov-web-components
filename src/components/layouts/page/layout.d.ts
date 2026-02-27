import type { Layout } from './layout'

declare global {
  interface HTMLElementTagNameMap {
    'app-layout': Layout
  }
}
