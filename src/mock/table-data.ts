/**
 * Mock data for app-table demos and tests.
 * Use: import { mockTableRows, type MockTableRow } from './mock/table-data'
 */

export interface MockTableRow {
  id: number
  name: string
  department: string
  role: string
  salary: number
  status: 'active' | 'inactive'
}

const NAMES = [
  'Alice Johnson',
  'Bob Smith',
  'Carol White',
  'David Brown',
  'Eva Martinez',
  'Frank Lee',
  'Grace Kim',
  'Henry Davis',
  'Isla Chen',
  'Jake Wilson',
] as const

const DEPARTMENTS = ['Engineering', 'Design', 'Product', 'Marketing'] as const
const ROLES = ['Senior', 'Mid', 'Junior', 'Lead'] as const

/** Default mock rows for table (42 items). */
export const mockTableRows: MockTableRow[] = Array.from({ length: 42 }, (_, i) => ({
  id: i + 1,
  name: NAMES[i % NAMES.length],
  department: DEPARTMENTS[i % DEPARTMENTS.length],
  role: ROLES[i % ROLES.length],
  salary: 60000 + (i % 10) * 8000,
  status: i % 5 === 0 ? 'inactive' : 'active',
}))

/** Small subset (e.g. for minimal table demos). */
export const mockTableRowsSmall: MockTableRow[] = mockTableRows.slice(0, 5)
