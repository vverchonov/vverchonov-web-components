import * as React from 'react'
import { createComponent, type EventName } from '@lit/react'
import { Modal as ModalElement } from '../components/modal/modal.ts'

export const Modal = createComponent({
  tagName: 'app-modal',
  elementClass: ModalElement,
  react: React,
  events: {
    onModalConfirm: 'modal-confirm' as EventName<CustomEvent>,
    onModalCancel: 'modal-cancel' as EventName<CustomEvent>,
    onModalClose: 'modal-close' as EventName<CustomEvent>,
  },
})
