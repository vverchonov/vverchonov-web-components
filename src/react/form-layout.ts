import * as React from 'react'
import { createComponent, type EventName } from '@lit/react'
import { FormLayout as FormLayoutElement } from '../components/layouts/form/form-layout.ts'
import type { FormLayoutStageEventDetail } from '../components/layouts/form/form-layout-types.ts'

export const FormLayout = createComponent({
  tagName: 'app-form-layout',
  elementClass: FormLayoutElement,
  react: React,
  events: {
    onFormLayoutNext: 'form-layout-next' as EventName<CustomEvent<FormLayoutStageEventDetail>>,
    onFormLayoutBack: 'form-layout-back' as EventName<CustomEvent<FormLayoutStageEventDetail>>,
    onFormLayoutSubmit: 'form-layout-submit' as EventName<CustomEvent<FormLayoutStageEventDetail>>,
  },
})
