import React, { useMemo, useCallback } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { FixedSizeList } from 'react-window'
import { JotaiSortableTableProps } from './JotaiTableTypes'
import { TableUIState } from './JotaiTableTypes'
import SearchInput from '../SearchInput'
import { ITEM_HEIGHT, COLUMN_PADDING } from '../SortableTabularSection.data'
import './JotaiSortableTable.scss'

// Import the data computation utility
import { createComputedTableDataAtom } from '../../../application/atoms/tableUtils'

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
    itemHeight = ITEM_HEIGHT,
    useFixedSizeList = true,
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
  const computedDataAtomRef = React.useRef(
    createComputedTableDataAtom(itemsAtom, uiStateAtomRef.current, config)
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
      setUIState({
        sortColumn: columnIndex,
        sortAscending: uiState.sortColumn === columnIndex ? !uiState.sortAscending : true,
        filter: uiState.filter
      })
    },
    [setUIState, uiState.sortColumn, uiState.sortAscending, uiState.filter]
  )

  // Handle filter change
  const handleFilterChange = useCallback(
    (filter: string) => {
      setUIState({
        sortColumn: uiState.sortColumn,
        sortAscending: uiState.sortAscending,
        filter
      })
    },
    [setUIState, uiState.sortColumn, uiState.sortAscending]
  )

  // Get column widths
  const columnWidths = useMemo(() => {
    return config.columns.map((col) => col.width ?? 80)
  }, [config.columns])

  const totalWidth = useMemo(() => {
    return columnWidths.reduce((a, b) => a + b, 0) + COLUMN_PADDING * 2 * columnWidths.length
  }, [columnWidths])

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
            flex: `0 0 ${columnWidths[index]}px`,
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
        const rowValue = col.renderRowCell(item)

        return (
          <div
            key={`${col.id}-${index}`}
            style={{
              flex: `0 0 ${columnWidths[colIndex]}px`,
              justifyContent: col.justifyContent ?? 'start',
              padding: `0 ${COLUMN_PADDING}px`,
              width: col.width ? `${col.width}px` : undefined,
              height: itemHeight
            }}
            className='table-data-cell'
          >
            {rowValue}
          </div>
        )
      })
    },
    [config.columns, columnWidths, itemHeight]
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
        <div className='table-wrapper'>
          <div style={{ width: totalWidth }} className='table-container'>
            {/* Header */}
            <div className='table-header'>
              {renderHeaderRow()}
            </div>

            {/* Body */}
            <div className='table-body'>
              {data.items.length === 0 ? (
                <div className='table-empty-state'>No items found</div>
              ) : useFixedSizeList ? (
                <FixedSizeList
                  height={Math.min(data.items.length * itemHeight, 600)}
                  itemCount={data.items.length}
                  itemSize={itemHeight}
                  width={totalWidth}
                >
                  {VirtualizedRow}
                </FixedSizeList>
              ) : (
                data.items.map((item, index) => (
                  <div
                    key={config.getRowKey ? config.getRowKey(item, index) : index}
                    className={`table-row img-hover-container ${config.getRowClass?.(item, index) ?? ''}`}
                    onClick={(e) => config.onRowClick?.(item, index, e)}
                  >
                    {renderRow(item, index)}
                  </div>
                ))
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
