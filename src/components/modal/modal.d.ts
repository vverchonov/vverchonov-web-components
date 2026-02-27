import type { Modal } from './modal'

declare global {
  interface HTMLElementTagNameMap {
    'app-modal': Modal
  }
}
