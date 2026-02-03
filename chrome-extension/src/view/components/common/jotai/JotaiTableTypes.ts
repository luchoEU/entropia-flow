import { Atom } from 'jotai'

/**
 * UI state for table (sort column, direction, and filter)
 * This state is persisted to localStorage for each table
 */
export interface TableUIState {
  sortColumn: number
  sortAscending: boolean
  filter: string
}

/**
 * Definition for a single column in a jotai table
 */
export interface JotaiTableColumn<TItem = any> {
  id: string
  header: string
  /** Transforms item to React node for rendering */
  renderRowCell: (item: TItem) => React.ReactNode
  /** Optional: Transform item to value for sorting */
  sortAccessor?: (item: TItem) => string | number
  /** Optional: Transform item to string for filtering */
  filterAccessor?: (item: TItem) => string
  /** Optional: Column width in pixels */
  width?: number
  /** Optional: CSS justify-content value */
  justifyContent?: 'start' | 'center' | 'end'
}

/**
 * Configuration for a jotai-based sortable table
 */
export interface JotaiTableConfig<TItem = any> {
  columns: JotaiTableColumn<TItem>[]
  title?: string
  subtitle?: string
  itemTypeName?: string  // e.g., 'item', 'blueprint'
  /** Optional: Custom function to get unique key for each row */
  getRowKey?: (item: TItem, index: number) => string | number
  /** Optional: Custom function to get CSS class for each row */
  getRowClass?: (item: TItem, index: number) => string
  /** Optional: Extract PED value for total calculation */
  getPedValue?: (item: TItem) => number
  /** Optional: Handle row click events */
  onRowClick?: (item: TItem, index: number, event: React.MouseEvent) => void
}

/**
 * Result of computed table data atom
 */
export interface ComputedTableData<TItem = any> {
  items: TItem[]
  stats: {
    count: number
    ped?: string
  }
}

/**
 * Props for JotaiSortableTable component
 */
export interface JotaiSortableTableProps<TItem = any> {
  itemsAtom: Atom<TItem[]>
  config: JotaiTableConfig<TItem>
  beforeTable?: React.ReactNode
  afterSearch?: React.ReactNode
  itemHeight?: number
  useFixedSizeList?: boolean
  children?: React.ReactNode
}
