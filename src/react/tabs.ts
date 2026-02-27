import * as React from 'react'
import { createComponent, type EventName } from '@lit/react'
import { Tabs as TabsElement } from '../components/tabs/tabs.ts'
import type { TabChangeEventDetail } from '../components/tabs/tabs.ts'

export const Tabs = createComponent({
  tagName: 'app-tabs',
  elementClass: TabsElement,
  react: React,
  events: {
    onTabChange: 'tab-change' as EventName<CustomEvent<TabChangeEventDetail>>,
  },
})
