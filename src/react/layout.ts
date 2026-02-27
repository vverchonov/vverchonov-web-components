import * as React from 'react'
import { createComponent } from '@lit/react'
import { Layout as LayoutElement } from '../components/layouts/page/layout.ts'

export const Layout = createComponent({
  tagName: 'app-layout',
  elementClass: LayoutElement,
  react: React,
})
