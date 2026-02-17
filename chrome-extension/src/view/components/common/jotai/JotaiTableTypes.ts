import { Atom } from 'jotai'
import { CellElement } from './cellDSL'

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

  /** DSL element renderer for cell content */
  renderRow: (item: TItem) => CellElement
  /** Optional: Transform item to value for sorting */
  sortAccessor?: (item: TItem) => string | number
  /** Optional: Transform item to string for filtering */
  filterAccessor?: (item: TItem) => string
  /** Optional: Minimum column width in pixels (default: 20) */
  minWidth?: number
  /** Optional: Maximum column width in pixels (default: 600) */
  maxWidth?: number
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
  /** Optional: Get count value for item (1 to count, 0 to exclude from total) - useful for tree structures */
  getCountValue?: (item: TItem) => number
  /** Optional: Handle row click events */
  onRowClick?: (item: TItem, index: number, event: React.MouseEvent) => void
  /** Optional: Render expanded row content below the main row */
  renderExpandedRow?: (item: TItem) => React.ReactNode
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
  /** Jotai atom containing the array of items to display */
  itemsAtom: Atom<TItem[]>
  /** Table configuration including columns and callbacks */
  config: JotaiTableConfig<TItem>
  /** Optional: Content to render above the search section */
  beforeTable?: React.ReactNode
  /** Optional: Content to render to the right of the search input */
  afterSearch?: React.ReactNode
  /** Optional: Height of each row in pixels (default: 20) */
  itemHeight?: number
  /** Optional: Additional CSS class names to apply to the table wrapper */
  className?: string
  /** Optional: Whether to use FixedSizeList for virtualization (default: true) */
  useFixedSizeList?: boolean
  /** Optional: Maximum number of visible rows before scrolling (default: 10, ignored when fillHeight is true) */
  maxNumberOfLines?: number
  /** Optional: Whether to fill all available vertical space (default: false) */
  fillHeight?: boolean
  /** Optional: Content to render below the table */
  children?: React.ReactNode
  /** Optional: Custom sort handler - when provided, disables internal sorting */
  onSortChange?: (columnIndex: number, ascending: boolean) => void
  /** Optional: Custom filter handler - when provided, disables internal filtering */
  onFilterChange?: (filter: string) => void
}
