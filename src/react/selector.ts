import * as React from 'react'
import { createComponent, type EventName } from '@lit/react'
import { Selector as SelectorElement } from '../components/selector/selector.ts'
import type { SelectorChangeEventDetail } from '../components/selector/selector-types.ts'

export const Selector = createComponent({
  tagName: 'app-selector',
  elementClass: SelectorElement,
  react: React,
  events: {
    onSelectorChange: 'selector-change' as EventName<CustomEvent<SelectorChangeEventDetail>>,
  },
})
