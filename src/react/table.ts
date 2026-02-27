import * as React from 'react'
import { createComponent, type EventName } from '@lit/react'
import { Table as TableElement } from '../components/table/table.ts'
import type { TableSortEvent, TablePageEvent, TableColumnToggleEvent } from '../components/table/table-types.ts'

export const Table = createComponent({
  tagName: 'app-table',
  elementClass: TableElement,
  react: React,
  events: {
    onTableSort: 'table-sort' as EventName<CustomEvent<TableSortEvent>>,
    onTablePage: 'table-page' as EventName<CustomEvent<TablePageEvent>>,
    onTableColumnToggle: 'table-column-toggle' as EventName<CustomEvent<TableColumnToggleEvent>>,
  },
})
