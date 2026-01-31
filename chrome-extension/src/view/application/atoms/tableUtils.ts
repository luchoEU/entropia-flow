import { atom, Atom } from 'jotai'
import { LOCAL_STORAGE } from '../../../chrome/chromeStorageArea'
import {
  TableUIState,
  JotaiTableConfig,
  ComputedTableData
} from '../../components/common/jotai/JotaiTableTypes'
import { multiIncludes } from '../../../common/filter'

/**
 * Creates a persisted table UI state atom (sort column, direction, filter)
 * The state is automatically saved to localStorage and restored on initialization
 */
export function createTableStateAtom(tableId: string) {
  const storageKey = `table.ui.${tableId}`

  const initialState: TableUIState = {
    sortColumn: 0,
    sortAscending: true,
    filter: ''
  }

  // Base mutable atom
  const baseStateAtom = atom<TableUIState>(initialState)

  // Persisted atom - wraps the base atom with persistence
  const persistedStateAtom = atom(
    (get) => get(baseStateAtom),
    async (get, set, newValue: TableUIState) => {
      set(baseStateAtom, newValue)
      try {
        await LOCAL_STORAGE.set(storageKey, newValue)
      } catch (error) {
        console.error(`Failed to persist table state for ${tableId}:`, error)
        // Continue anyway - persistence is not critical
      }
    }
  )

  // Initialize atom - loads from storage and restores state
  const initAtom = atom(null, async (get, set) => {
    try {
      const stored = await LOCAL_STORAGE.get(storageKey)
      if (stored && typeof stored === 'object') {
        set(baseStateAtom, {
          sortColumn: stored.sortColumn ?? initialState.sortColumn,
          sortAscending: stored.sortAscending ?? initialState.sortAscending,
          filter: stored.filter ?? initialState.filter
        })
      }
    } catch (error) {
      console.error(`Failed to load table state for ${tableId}:`, error)
      // Use defaults if loading fails
    }
  })

  return { persistedStateAtom, initAtom }
}

/**
 * Creates a computed table data atom that automatically sorts and filters data
 * Changes to the source data or UI state trigger automatic recomputation
 */
export function createComputedTableDataAtom<TItem>(
  sourceDataAtom: Atom<TItem[]>,
  uiStateAtom: Atom<TableUIState>,
  config: JotaiTableConfig<TItem>
): Atom<ComputedTableData<TItem>> {
  return atom((get) => {
    const sourceData = get(sourceDataAtom)
    const uiState = get(uiStateAtom)
    const sortColumn = config.columns[uiState.sortColumn]

    if (!sortColumn) {
      return { items: sourceData, stats: { count: sourceData.length } }
    }

    // Apply filter
    let filtered = sourceData
    if (uiState.filter.trim()) {
      const searchTerm = uiState.filter.toLowerCase().trim()
      filtered = sourceData.filter((item) => {
        const filterValue = config.columns.reduce((acc, col) => {
          if (col.filterAccessor) {
            return acc + ' ' + col.filterAccessor(item)
          }
          return acc
        }, '')
        return multiIncludes(searchTerm, filterValue)
      })
    }

    // Apply sort
    const sorted = [...filtered].sort((a, b) => {
      const aVal = sortColumn.sortAccessor ? sortColumn.sortAccessor(a) : sortColumn.renderRowCell(a)
      const bVal = sortColumn.sortAccessor ? sortColumn.sortAccessor(b) : sortColumn.renderRowCell(b)

      // Type-aware comparison
      let compare: number
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        compare = aVal - bVal
      } else {
        const aStr = String(aVal)
        const bStr = String(bVal)
        compare = aStr.localeCompare(bStr)
      }

      return uiState.sortAscending ? compare : -compare
    })

    // Calculate stats
    let pedTotal: string | undefined = undefined
    if (config.getPedValue) {
      const total = sorted.reduce((sum, item) => sum + config.getPedValue!(item), 0)
      pedTotal = total.toFixed(2)
    }

    return {
      items: sorted,
      stats: {
        count: sorted.length,
        ped: pedTotal
      }
    }
  })
}
