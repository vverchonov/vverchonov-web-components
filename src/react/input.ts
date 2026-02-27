import * as React from 'react'
import { createComponent } from '@lit/react'
import { Input as InputElement } from '../components/input/input.ts'

export const Input = createComponent({
  tagName: 'app-input',
  elementClass: InputElement,
  react: React,
})
