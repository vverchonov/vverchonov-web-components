import * as React from 'react'
import { createComponent, type EventName } from '@lit/react'
import { Toggle as ToggleElement } from '../components/toggle/toggle.ts'
import type { ToggleChangeEventDetail } from '../components/toggle/toggle-types.ts'

export const Toggle = createComponent({
  tagName: 'app-toggle',
  elementClass: ToggleElement,
  react: React,
  events: {
    onToggleChange: 'toggle-change' as EventName<CustomEvent<ToggleChangeEventDetail>>,
  },
})
