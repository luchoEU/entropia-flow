import React, { useMemo, useCallback } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { FixedSizeList } from 'react-window'
import { JotaiSortableTableProps, JotaiTableColumn } from './JotaiTableTypes'
import { TableUIState } from './JotaiTableTypes'
import SearchInput from '../SearchInput'
import './JotaiSortableTable.scss'

// Import the data computation utility
import { createComputedTableDataAtom } from '../../../application/atoms/tableUtils'

// Import DSL utilities
import { calculateColumnWidth } from './cellMeasurement'
import { renderCellElement } from './cellRenderer'
import type { CellElement } from './cellDSL'

// Constants for table layout
const ITEM_HEIGHT = 32
const COLUMN_PADDING = 4

/**
 * A modern, jotai-based sortable table component
 * Data is provided via raw items atom, UI state and sorting/filtering handled internally
 * UI state (sort, filter) is managed internally
 */
const JotaiSortableTableComponent = function<TItem>(
  props: JotaiSortableTableProps<TItem>
) {
  const {
    itemsAtom,
    config,
    beforeTable,
    afterSearch,
    className,
    itemHeight = ITEM_HEIGHT,
    useFixedSizeList = true,
    maxNumberOfLines = 10,
    children
  } = props

  // Create internal UI state atom for this table instance with persistence
  const tableStorageKey = `table-ui-state-${config.title}`
  const uiStateAtomRef = React.useRef(atomWithStorage<TableUIState>(tableStorageKey, {
    sortColumn: 0,
    sortAscending: true,
    filter: ''
  }))

  // Create computed data atom using the raw items atom and internal UI state
  // Disable sorting if custom onSortChange handler is provided (e.g., for tree data)
  // Disable filtering if custom onFilterChange handler is provided (e.g., for tree data)
  const computedDataAtomRef = React.useRef(
    createComputedTableDataAtom(itemsAtom, uiStateAtomRef.current, config, !!props.onSortChange, !!props.onFilterChange)
  )

  const data = useAtomValue(computedDataAtomRef.current)
  const uiState = useAtomValue(uiStateAtomRef.current)
  const setUIState = useSetAtom(uiStateAtomRef.current)

  // Handle sort by column
  const handleSortColumn = useCallback(
    (columnIndex: number) => {
      if (config.columns[columnIndex].sortAccessor === undefined) {
        return
      }

      const newAscending = uiState.sortColumn === columnIndex ? !uiState.sortAscending : true

      // Always update internal state for UI indicators (arrows)
      setUIState({
        sortColumn: columnIndex,
        sortAscending: newAscending,
        filter: uiState.filter
      })

      // If custom handler provided, call it to trigger external sort logic
      if (props.onSortChange) {
        props.onSortChange(columnIndex, newAscending)
      }
    },
    [setUIState, uiState.sortColumn, uiState.sortAscending, uiState.filter, props.onSortChange, config.columns]
  )

  // Handle filter change
  const handleFilterChange = useCallback(
    (filter: string) => {
      // Always update internal state for UI (search box)
      setUIState({
        sortColumn: uiState.sortColumn,
        sortAscending: uiState.sortAscending,
        filter
      })

      // If custom handler provided, call it to trigger external filter logic
      if (props.onFilterChange) {
        props.onFilterChange(filter)
      }
    },
    [setUIState, uiState.sortColumn, uiState.sortAscending, props.onFilterChange]
  )

  // Get column widths - use explicit width or calculate from DSL
  const columnWidths = useMemo(() => {
    return config.columns.map((col) => {
      // If column has flex, use minWidth for fixed sizing
      if (col.flex !== undefined) {
        return col.minWidth ?? 80
      }

      // Calculate width from DSL
      const calculatedWidth = calculateColumnWidth(
        col.renderRow,
        data.items,
        10,  // sample size
        '13px Arial'  // TODO: get from CSS
      )

      const minWidth = col.minWidth ?? 20
      const maxWidth = col.maxWidth ?? 600

      return Math.min(maxWidth, Math.max(minWidth, calculatedWidth))
    })
  }, [config.columns, data.items])

  const totalWidth = useMemo(() => {
    return columnWidths.reduce((a, b) => a + b, 0) + COLUMN_PADDING * 2 * columnWidths.length
  }, [columnWidths])

  const tableMaxHeight = useMemo(() => {
    return itemHeight * maxNumberOfLines + itemHeight * (useFixedSizeList ? 1/2 : 3/4)
  }, [itemHeight, maxNumberOfLines, useFixedSizeList])

  // Render data cell using DSL
  const renderCell = useCallback(
    (col: JotaiTableColumn<TItem>, item: TItem, index: number) => {
      const element = col.renderRow(item)
      return renderCellElement(element, item, index, itemHeight)
    },
    [itemHeight]
  )

  // Render header row
  const renderHeaderRow = useCallback(() => {
    return config.columns.map((col, index) => {
      const isCurrentSort = uiState.sortColumn === index
      const sortIcon = isCurrentSort ? (
        <img
          src={uiState.sortAscending ? 'img/up.png' : 'img/down.png'}
          alt={uiState.sortAscending ? 'ascending' : 'descending'}
        />
      ) : null

      return (
        <div
          key={col.id}
          onClick={() => handleSortColumn(index)}
          style={{
            flex: col.flex !== undefined ? col.flex : `0 0 ${columnWidths[index]}px`,
            minWidth: col.minWidth ? `${col.minWidth}px` : undefined,
            justifyContent: col.justifyContent ?? 'start',
            padding: `0 ${COLUMN_PADDING}px`
          }}
          className='table-header-cell'
        >
          <span>{col.header}</span>
          {sortIcon}
        </div>
      )
    })
  }, [
    config.columns,
    columnWidths,
    uiState.sortColumn,
    uiState.sortAscending,
    handleSortColumn
  ])

  // Render data row
  const renderRow = useCallback(
    (item: TItem, index: number) => {
      return config.columns.map((col, colIndex) => {
        return (
          <div
            key={`${col.id}-${index}`}
            style={{
              flex: col.flex !== undefined ? col.flex : `0 0 ${columnWidths[colIndex]}px`,
              minWidth: col.minWidth ? `${col.minWidth}px` : undefined,
              justifyContent: col.justifyContent ?? 'start',
              padding: `0 ${COLUMN_PADDING}px`,
              height: itemHeight
            }}
            className='table-data-cell'
          >
            {renderCell(col, item, index)}
          </div>
        )
      })
    },
    [config.columns, columnWidths, itemHeight, renderCell]
  )

  // Virtualized row renderer for FixedSizeList
  const VirtualizedRow = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const item = data.items[index]
      return (
        <div
          style={style}
          className={`table-row img-hover-container ${config.getRowClass?.(item, index) ?? ''}`}
          onClick={(e) => config.onRowClick?.(item, index, e)}
        >
          {renderRow(item, index)}
        </div>
      )
    },
    [data.items, renderRow, config]
  )

  return (
    <div className='jotai-sortable-table'>
      <div>
        {/* Search section */}
        <div className='table-search-section'>
          <div className='search-info'>
            {data.stats.ped && <span>Total value {data.stats.ped} PED for </span>}
            <span>{data.stats.count} </span>
            <span>
              {config.itemTypeName ?? 'item'}
              {data.stats.count === 1 ? '' : 's'}
            </span>
          </div>

          <div className='search-input-container'>
            <SearchInput filter={uiState.filter} setFilter={handleFilterChange} />
            {afterSearch}
          </div>
        </div>

        {/* Before table controls */}
        {beforeTable && <div className='table-before-controls'>{beforeTable}</div>}

        {/* Table */}
        <div className={`table-wrapper ${className}`}>
          <div style={{ width: totalWidth }} className='table-container'>
            {/* Header */}
            <div className='table-header'>
              {renderHeaderRow()}
            </div>

            {/* Body */}
            {}
            <div className='table-body' style={!useFixedSizeList ? { maxHeight: `${tableMaxHeight}px`, overflowY: 'auto' } : undefined}>
              {data.items.length === 0 ? (
                <div className='table-empty-state'>No items found</div>
              ) : useFixedSizeList ? (
                <FixedSizeList
                  itemCount={data.items.length}
                  itemSize={itemHeight}
                  width={totalWidth}
                  height={tableMaxHeight}
                  style={{ overflow: 'auto' }}
                >
                  {VirtualizedRow}
                </FixedSizeList>
              ) : (
                data.items.flatMap((item, index) => {
                  const expandedContent = config.renderExpandedRow?.(item)
                  return [
                    <div
                      key={config.getRowKey ? config.getRowKey(item, index) : index}
                      className={`table-row img-hover-container ${config.getRowClass?.(item, index) ?? ''}`}
                      onClick={(e) => config.onRowClick?.(item, index, e)}
                    >
                      {renderRow(item, index)}
                    </div>,
                    ...(expandedContent ? [
                      <div
                        key={`expanded-${config.getRowKey ? config.getRowKey(item, index) : index}`}
                        className='table-expanded-row'
                      >
                        {expandedContent}
                      </div>
                    ] : [])
                  ]
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Children content */}
      {children}
    </div>
  )
}

export const JotaiSortableTable = React.memo(JotaiSortableTableComponent) as typeof JotaiSortableTableComponent
