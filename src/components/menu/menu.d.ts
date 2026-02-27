import type { Menu } from './menu'

declare global {
  interface HTMLElementTagNameMap {
    'app-menu': Menu
  }
}
