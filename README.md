# @vverchonov/web-components

A library of reusable UI components built with [Lit 3](https://lit.dev/), shipped as standard web components with first-class [React](https://react.dev/) wrappers.

## Features

- **13 components** — Button, Input, Toggle, Table, Menu, Modal, Tabs, Selector, Dropdown Button, Layout, Form Layout, Card, Radio Group
- **React wrappers** via `@lit/react` — use every component as a native React element
- **Dark mode** — automatic (system preference) and manual (`data-theme`)
- **Fully typed** — written in TypeScript with exported types for every component
- **Tree-shakeable** — import the entire library or only the components you need
- **Themeable** — override any design token with CSS custom properties

## Installation

```bash
npm install @vverchonov/web-components lit
```

### Peer dependencies

| Package | Version | Required |
|---------|---------|----------|
| `lit`   | `^3.0.0` | Yes |
| `react` | `^18.0.0 \|\| ^19.0.0` | Only for React wrappers |

## Usage

### Vanilla JS / HTML

Import the entire library or individual components:

```js
// All components
import '@vverchonov/web-components'

// Single component (tree-shakeable)
import '@vverchonov/web-components/button'
```

Then use the custom element in your markup:

```html
<app-button>Click me</app-button>
```

### React

```jsx
import { Button } from '@vverchonov/web-components/react/button'

function App() {
  return <Button onClick={() => console.log('clicked')}>Click me</Button>
}
```

You can also import all React wrappers at once:

```js
import { Button, Input, Table } from '@vverchonov/web-components/react'
```

## Components

| Tag name | React export | Import path | Description |
|----------|-------------|-------------|-------------|
| `app-button` | `Button` | `./button` | Button with optional icon slot |
| `app-input` | `Input` | `./input` | Text input with validation states and icons |
| `app-toggle` | `Toggle` | `./toggle` | Boolean switch with optional label |
| `app-table` | `Table` | `./table` | Data table with sorting, pagination, column toggle |
| `app-menu` | `Menu` | `./menu` | Sidebar navigation with search and nested items |
| `app-modal` | `Modal` | `./modal` | Dialog (info, confirm, form variants) with focus trapping |
| `app-tabs` | `Tabs` | `./tabs` | Tabbed interface with keyboard navigation |
| `app-selector` | `Selector` | `./selector` | Dropdown selector (single/multi, searchable, grouped) |
<!-- | `app-dropdown-button` | `DropdownButton` | `./dropdown-button` | Dropdown menu button (disabled – broken) | -->
| `app-layout` | `Layout` | `./layouts` | Page layout with sidebar slot |
| `app-form-layout` | `FormLayout` | `./layouts` | Form shell with multi-step support and column grids |
| `app-card` | `Card` | `./card` | Collapsible content card (elevated, outlined, filled) |
| `app-radio-group` | `RadioGroup` | `./radio-group` | Radio button group with validation states |

## Theming

Design tokens are defined as CSS custom properties in `src/styles/theme.css`. Because they live on `:root`, they inherit through Shadow DOM boundaries.

Override any token on `:root` or a parent element:

```css
:root {
  --color-primary: oklch(0.55 0.24 29);
  --radius-button: 0.5rem;
}
```

### Dark mode

Dark mode activates automatically based on `prefers-color-scheme`. To force a theme manually, set a `data-theme` attribute on `<html>`:

```html
<html data-theme="dark">
```

Available values: `"dark"`, `"light"` (overrides system preference), or omit the attribute to follow system preference.

### Token categories

| Category | Examples |
|----------|----------|
| Colors | `--color-primary`, `--color-surface`, `--color-text`, `--color-border` |
| State | `--color-valid`, `--color-invalid` |
| Radius | `--radius-button`, `--radius-card`, `--radius-input` |
| Button | `--button-font-size`, `--button-padding-block`, `--button-icon-gap` |
| Table | `--table-cell-padding-block`, `--table-header-bg` |
| Input | `--input-font-size`, `--input-padding-block` |
| Modal | `--modal-width`, `--modal-padding`, `--modal-backdrop` |
| Menu | `--menu-width`, `--menu-collapsed-width` |
| Toggle | `--toggle-track-width`, `--toggle-thumb-size` |
| Tabs | `--tab-padding-block`, `--tab-indicator-height` |
| Dropdown | `--dropdown-padding`, `--dropdown-item-padding-block`, `--dropdown-item-font-size` |
| Radio Group | `--radio-size`, `--radio-dot-size`, `--radio-gap` |
| Card | `--card-padding`, `--card-gap`, `--card-transition-duration` |
| Selector | `--selector-min-height`, `--selector-panel-max-height` |

See `src/styles/theme.css` for the full list of tokens and their default values.

## Development

```bash
# Start the dev server (opens a demo page showcasing every component)
npm run dev

# Production library build
npm run build

# Preview the production build
npm run preview
```

### Tech stack

- [Lit 3](https://lit.dev/) — Web components framework
- [TypeScript 5.9](https://www.typescriptlang.org/) — Type safety
- [Vite 8](https://vite.dev/) — Build tool and dev server
- [Tailwind CSS 4](https://tailwindcss.com/) — Design tokens and utility classes

## License

MIT
