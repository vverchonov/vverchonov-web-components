import * as React from 'react'
import { createComponent, type EventName } from '@lit/react'
import { RadioGroup as RadioGroupElement } from '../components/radio-group/radio-group.ts'
import type { RadioGroupChangeEventDetail } from '../components/radio-group/radio-group-types.ts'

export const RadioGroup = createComponent({
  tagName: 'app-radio-group',
  elementClass: RadioGroupElement,
  react: React,
  events: {
    onRadioChange: 'radio-change' as EventName<CustomEvent<RadioGroupChangeEventDetail>>,
  },
})
