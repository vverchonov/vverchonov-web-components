import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// jsdom does not support adoptedStyleSheets; polyfill for theme injection
if (!('adoptedStyleSheets' in Document.prototype)) {
  const sheets: CSSStyleSheet[] = []
  Object.defineProperty(document, 'adoptedStyleSheets', {
    configurable: true,
    enumerable: true,
    get: () => sheets,
    set: (value: CSSStyleSheet[]) => {
      sheets.length = 0
      sheets.push(...(value ?? []))
    },
  })
}

afterEach(() => {
  cleanup()
})
