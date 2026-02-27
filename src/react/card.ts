import * as React from 'react'
import { createComponent, type EventName } from '@lit/react'
import { Card as CardElement } from '../components/card/card.ts'
import type { CardToggleEventDetail } from '../components/card/card-types.ts'

export const Card = createComponent({
  tagName: 'app-card',
  elementClass: CardElement,
  react: React,
  events: {
    onCardToggle: 'card-toggle' as EventName<CustomEvent<CardToggleEventDetail>>,
  },
})
