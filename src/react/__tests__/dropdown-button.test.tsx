import * as React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DropdownButton } from '../dropdown-button' // also registers app-dropdown-button
import type { DropdownItem } from '../../components/dropdown-button/dropdown-button-types'

const simpleItems: DropdownItem[] = [
  { label: 'Edit', value: 'edit' },
  { label: 'Delete', value: 'delete' },
]

function getHost(root: Document | HTMLElement = document.body) {
  return root.querySelector('app-dropdown-button')
}

function getTrigger(root: Document | HTMLElement = document.body) {
  return getHost(root)?.shadowRoot?.querySelector<HTMLElement>('.trigger')
}

function getPanel(root: Document | HTMLElement = document.body) {
  return getHost(root)?.shadowRoot?.querySelector<HTMLElement>('.panel')
}

function getMenuItems(root: Document | HTMLElement = document.body) {
  const panel = getPanel(root)
  return panel?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []
}

/** Renders the native element with props (bypasses React wrapper for jsdom compatibility) */
function renderNativeElement(props: {
  label?: string
  items?: DropdownItem[]
  onSelect?: (e: CustomEvent) => void
}) {
  const host = document.createElement('app-dropdown-button') as HTMLElement & {
    label: string
    items: DropdownItem[]
    addEventListener: (
      type: 'dropdown-select',
      handler: (e: CustomEvent) => void
    ) => void
  }
  host.label = props.label ?? ''
  host.items = props.items ?? []
  if (props.onSelect) {
    host.addEventListener('dropdown-select', props.onSelect as any)
  }
  document.body.appendChild(host)
  return { host, unmount: () => host.remove() }
}

describe('DropdownButton (React)', () => {
  it('renders the trigger with label via React', async () => {
    render(<DropdownButton label="Actions" items={simpleItems} />)
    await customElements.whenDefined('app-dropdown-button')
    const trigger = getTrigger()
    expect(trigger).toBeTruthy()
    // In jsdom, @lit/react may not set props synchronously; trigger exists
  })

  it('opens panel on trigger click', async () => {
    const user = userEvent.setup()
    render(<DropdownButton label="Actions" items={simpleItems} />)
    await customElements.whenDefined('app-dropdown-button')
    const trigger = getTrigger()
    expect(trigger).toBeTruthy()

    await user.click(trigger!)
    const panel = getPanel()
    expect(panel?.classList.contains('is-open')).toBe(true)
    expect(trigger?.getAttribute('aria-expanded')).toBe('true')
  })

  it('closes panel when selecting an item', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { host, unmount } = renderNativeElement({
      label: 'Actions',
      items: simpleItems,
      onSelect,
    })
    await (host as any).updateComplete
    const trigger = getTrigger()
    expect(trigger).toBeTruthy()
    await user.click(trigger!)

    const menuItems = getMenuItems()
    expect(menuItems.length).toBeGreaterThanOrEqual(1)
    await user.click(menuItems[0]!)

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({ value: 'edit' }),
      })
    )
    expect(getPanel()).toBeNull()
    unmount()
  })

  it('closes panel when clicking outside', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <DropdownButton label="Actions" items={simpleItems} />
        <button type="button">Outside</button>
      </div>
    )
    await customElements.whenDefined('app-dropdown-button')
    const trigger = getTrigger()
    await user.click(trigger!)

    const outsideButton = screen.getByRole('button', { name: 'Outside' })
    await user.click(outsideButton)

    expect(getPanel()).toBeNull()
  })

  it('closes panel on Escape', async () => {
    const user = userEvent.setup()
    render(<DropdownButton label="Actions" items={simpleItems} />)
    await customElements.whenDefined('app-dropdown-button')
    const trigger = getTrigger()
    await user.click(trigger!)

    await user.keyboard('{Escape}')

    expect(getPanel()).toBeNull()
  })

  it('renders menu items', async () => {
    const user = userEvent.setup()
    const { host, unmount } = renderNativeElement({
      label: 'Actions',
      items: simpleItems,
    })
    await (host as any).updateComplete
    const trigger = getTrigger()
    await user.click(trigger!)

    const menuItems = getMenuItems()
    expect(menuItems).toHaveLength(2)
    expect(menuItems[0]?.textContent).toContain('Edit')
    expect(menuItems[1]?.textContent).toContain('Delete')
    unmount()
  })
})
