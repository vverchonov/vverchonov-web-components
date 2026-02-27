import themeCSS from 'virtual:theme-inject'

let injected = false

export function injectTheme() {
  if (injected || typeof document === 'undefined') return
  injected = true
  const sheet = new CSSStyleSheet()
  sheet.replaceSync(themeCSS)
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet]
}
