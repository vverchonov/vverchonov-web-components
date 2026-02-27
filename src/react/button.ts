import * as React from 'react'
import { createComponent } from '@lit/react'
import { Button as ButtonElement } from '../components/button/button.ts'

export const Button = createComponent({
  tagName: 'app-button',
  elementClass: ButtonElement,
  react: React,
})
