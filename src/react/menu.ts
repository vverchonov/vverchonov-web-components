import * as React from 'react'
import { createComponent, type EventName } from '@lit/react'
import { Menu as MenuElement } from '../components/menu/menu.ts'
import type { MenuSelectEventDetail, MenuSearchEventDetail } from '../components/menu/menu-types.ts'

export const Menu = createComponent({
  tagName: 'app-menu',
  elementClass: MenuElement,
  react: React,
  events: {
    onMenuSelect: 'menu-select' as EventName<CustomEvent<MenuSelectEventDetail>>,
    onMenuSearch: 'menu-search' as EventName<CustomEvent<MenuSearchEventDetail>>,
  },
})
