import { LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import layoutStyles from './layout.css?inline'

let _stylesInjected = false

function injectStyles() {
  if (_stylesInjected) return
  _stylesInjected = true
  const style = document.createElement('style')
  style.dataset['appLayout'] = ''
  style.textContent = layoutStyles
  document.head.appendChild(style)
}

/**
 * Two-column shell with a sticky sidebar and a scrollable content area.
 *
 * No Shadow DOM: styles are injected once into document.head and target
 * `app-layout > [slot="sidebar"]` / `app-layout > [slot="content"]` directly.
 *
 * Usage:
 *   <app-layout>
 *     <app-menu slot="sidebar" collapsed></app-menu>
 *     <main slot="content">…</main>
 *   </app-layout>
 *
 * The sidebar width is fixed to --menu-collapsed-width (default 3.5rem).
 * When the menu expands on hover it overlays the content via overflow:visible
 * on the sidebar — the content area never moves.
 *
 * @tag app-layout
 * @slot sidebar - Fixed sidebar area (typically `<app-menu collapsed>`).
 * @slot content - Main scrollable content area.
 */
@customElement('app-layout')
export class Layout extends LitElement {
  override createRenderRoot(): HTMLElement {
    injectStyles()
    return this
  }
}
