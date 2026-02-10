/**
 * Integration test for JotaiSortableTable with tree-structured data
 *
 * THE PROBLEM:
 * JotaiSortableTable uses createComputedTableDataAtom which sorts the FLAT array
 * at tableUtils.ts:94. When given TreeLineData[] with parent-child hierarchy,
 * this flat-array sorting BREAKS the tree structure by separating children from parents.
 *
 * Architecture:
 *   - byStoreStateAtom produces TreeLineData[] (already sorted by tree-aware sorting)
 *   - JotaiSortableTable wraps this in createComputedTableDataAtom
 *   - User clicks column header → changes uiStateAtom.sortColumn
 *   - createComputedTableDataAtom re-sorts the FLAT array (line 94) → BREAKS HIERARCHY
 *
 * This test verifies that when JotaiSortableTable sorts by column, hierarchy is BROKEN.
 * The test should FAIL until we fix createComputedTableDataAtom to preserve tree structure.
 */

import { atom, createStore } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { createComputedTableDataAtom } from '../../application/atoms/tableUtils'
import { TreeLineData } from '../../application/state/inventory'
import { JotaiTableConfig, TableUIState } from '../common/jotai/JotaiTableTypes'

describe('JotaiSortableTable tree hierarchy bug - flat array sorting', () => {
  it('should FAIL: JotaiSortableTable breaks hierarchy when sorting flat TreeLineData array', () => {
    // ============================================================================
    // ARRANGE
    // ============================================================================

    const store = createStore()

    // Create TreeLineData array with hierarchy encoded via indent levels
    // This simulates what byStoreStateAtom produces after tree-aware sorting and flattening
    //
    // Tree structure:
    //   Storage (indent=0)
    //     A-Container (indent=1) - sorted correctly
    //       M-Child (indent=2) - child of A-Container
    //     Z-Container (indent=1) - sorted correctly
    //       A-Child (indent=2) - child of Z-Container, sorted within parent
    //       Z-Child (indent=2) - child of Z-Container, sorted within parent
    //
    // Expected order after flat-array sort by name ascending:
    //   WRONG: A-Child, A-Container, M-Child, Storage, Z-Child, Z-Container
    //   (All items sorted alphabetically, ignoring tree structure!)
    const treeLineData: TreeLineData[] = [
      {
        id: 'storage',
        n: 'Storage',
        q: '[2]',
        v: '80.00',
        c: '',
        indent: 0,
        isContainer: true,
        expanded: true
      },
      {
        id: 'a-cont',
        n: 'A-Container',
        q: '[1]',
        v: '30.00',
        c: 'Storage',
        indent: 1,
        isContainer: true,
        expanded: true
      },
      {
        id: 'm-child',
        n: 'M-Child',
        q: '1',
        v: '15.00',
        c: 'A-Container',
        indent: 2
      },
      {
        id: 'z-cont',
        n: 'Z-Container',
        q: '[2]',
        v: '50.00',
        c: 'Storage',
        indent: 1,
        isContainer: true,
        expanded: true
      },
      {
        id: 'a-child',
        n: 'A-Child',
        q: '3',
        v: '20.00',
        c: 'Z-Container',
        indent: 2
      },
      {
        id: 'z-child',
        n: 'Z-Child',
        q: '2',
        v: '25.00',
        c: 'Z-Container',
        indent: 2
      }
    ]

    // Create source data atom
    const sourceDataAtom = atom<TreeLineData[]>(treeLineData)

    // Create UI state atom (simulates JotaiSortableTable's internal state)
    const uiStateAtom = atomWithStorage<TableUIState>('test-table-ui', {
      sortColumn: 0, // Sort by name column
      sortAscending: true,
      filter: ''
    })

    // Create table config (simulates InventoryByStoreList column config)
    const config: JotaiTableConfig<TreeLineData> = {
      title: 'Test Table',
      columns: [
        {
          id: 'name',
          header: 'Name',
          sortAccessor: (item: TreeLineData) => item.n, // Sort by name
          filterAccessor: (item: TreeLineData) => item.n,
          renderRow: (item: TreeLineData) => ({ type: 'text' as const, value: item.n })
        },
        {
          id: 'quantity',
          header: 'Quantity',
          sortAccessor: (item: TreeLineData) => parseFloat(item.q),
          filterAccessor: (item: TreeLineData) => item.q,
          renderRow: (item: TreeLineData) => ({ type: 'text' as const, value: item.q })
        },
        {
          id: 'value',
          header: 'Value',
          sortAccessor: (item: TreeLineData) => parseFloat(item.v),
          filterAccessor: (item: TreeLineData) => item.v,
          renderRow: (item: TreeLineData) => ({ type: 'text' as const, value: item.v })
        }
      ],
      itemTypeName: 'item',
      getRowKey: (item: TreeLineData) => item.id,
      getPedValue: (item: TreeLineData) => parseFloat(item.v)
    }

    // Create computed data atom (this is what JotaiSortableTable uses internally)
    const computedDataAtom = createComputedTableDataAtom(sourceDataAtom, uiStateAtom, config)

    // ============================================================================
    // ACT
    // ============================================================================

    // Simulate user clicking "Name" column header to sort
    // (uiStateAtom already set to sortColumn: 0, sortAscending: true)
    const computedData = store.get(computedDataAtom)

    // ============================================================================
    // ASSERT
    // ============================================================================

    const sortedItems = computedData.items
    const names = sortedItems.map((item) => item.n)

    // DEBUG: Log actual order to see what happened
    console.log('Sorted names:', names)

    // Extract positions
    const storageIdx = names.indexOf('Storage')
    const aContainerIdx = names.indexOf('A-Container')
    const zContainerIdx = names.indexOf('Z-Container')
    const mChildIdx = names.indexOf('M-Child')
    const aChildIdx = names.indexOf('A-Child')
    const zChildIdx = names.indexOf('Z-Child')

    console.log('Positions:', {
      storageIdx,
      aContainerIdx,
      mChildIdx,
      zContainerIdx,
      aChildIdx,
      zChildIdx
    })

    // All items must be present
    expect(storageIdx).toBeGreaterThanOrEqual(0)
    expect(aContainerIdx).toBeGreaterThanOrEqual(0)
    expect(zContainerIdx).toBeGreaterThanOrEqual(0)
    expect(mChildIdx).toBeGreaterThanOrEqual(0)
    expect(aChildIdx).toBeGreaterThanOrEqual(0)
    expect(zChildIdx).toBeGreaterThanOrEqual(0)

    // BUG REPRODUCTION: Flat-array sorting breaks hierarchy
    // After sorting by name, all items are sorted alphabetically, ignoring tree structure.
    // This is WRONG because children should stay immediately after their parents.

    // The bug is that createComputedTableDataAtom sorts the flat array,
    // breaking parent-child relationships encoded in the indent structure.

    // Verify that hierarchy IS BROKEN by checking that children are NOT
    // immediately after their parents (as they should be)

    // If hierarchy were preserved:
    // - M-Child should be at aContainerIdx + 1
    // - A-Child should be at zContainerIdx + 1
    // - Z-Child should be at zContainerIdx + 2

    // But after flat-array sorting, they're separated (alphabetically sorted instead)
    const hierarchyBroken =
      mChildIdx !== aContainerIdx + 1 ||
      aChildIdx !== zContainerIdx + 1 ||
      zChildIdx !== zContainerIdx + 2

    expect(hierarchyBroken).toBe(true)
  })

  it('should PASS: Using onSortChange prevents internal sorting and preserves hierarchy', () => {
    // ============================================================================
    // ARRANGE
    // ============================================================================

    const store = createStore()

    // Same tree structure as before
    const treeLineData: TreeLineData[] = [
      {
        id: 'storage',
        n: 'Storage',
        q: '[2]',
        v: '80.00',
        c: '',
        indent: 0,
        isContainer: true,
        expanded: true
      },
      {
        id: 'a-cont',
        n: 'A-Container',
        q: '[1]',
        v: '30.00',
        c: 'Storage',
        indent: 1,
        isContainer: true,
        expanded: true
      },
      {
        id: 'm-child',
        n: 'M-Child',
        q: '1',
        v: '15.00',
        c: 'A-Container',
        indent: 2
      },
      {
        id: 'z-cont',
        n: 'Z-Container',
        q: '[2]',
        v: '50.00',
        c: 'Storage',
        indent: 1,
        isContainer: true,
        expanded: true
      },
      {
        id: 'a-child',
        n: 'A-Child',
        q: '3',
        v: '20.00',
        c: 'Z-Container',
        indent: 2
      },
      {
        id: 'z-child',
        n: 'Z-Child',
        q: '2',
        v: '25.00',
        c: 'Z-Container',
        indent: 2
      }
    ]

    const sourceDataAtom = atom<TreeLineData[]>(treeLineData)
    const uiStateAtom = atomWithStorage<TableUIState>('test-table-ui-2', {
      sortColumn: 0,
      sortAscending: true,
      filter: ''
    })

    const config: JotaiTableConfig<TreeLineData> = {
      title: 'Test Table',
      columns: [
        {
          id: 'name',
          header: 'Name',
          sortAccessor: (item: TreeLineData) => item.n,
          filterAccessor: (item: TreeLineData) => item.n,
          renderRow: (item: TreeLineData) => ({ type: 'text' as const, value: item.n })
        },
        {
          id: 'quantity',
          header: 'Quantity',
          sortAccessor: (item: TreeLineData) => parseFloat(item.q),
          filterAccessor: (item: TreeLineData) => item.q,
          renderRow: (item: TreeLineData) => ({ type: 'text' as const, value: item.q })
        },
        {
          id: 'value',
          header: 'Value',
          sortAccessor: (item: TreeLineData) => parseFloat(item.v),
          filterAccessor: (item: TreeLineData) => item.v,
          renderRow: (item: TreeLineData) => ({ type: 'text' as const, value: item.v })
        }
      ],
      itemTypeName: 'item',
      getRowKey: (item: TreeLineData) => item.id,
      getPedValue: (item: TreeLineData) => parseFloat(item.v)
    }

    // Create computed data atom with sorting DISABLED (simulates onSortChange behavior)
    const computedDataAtom = createComputedTableDataAtom(sourceDataAtom, uiStateAtom, config, true)

    // ============================================================================
    // ACT
    // ============================================================================

    // Simulate the onSortChange flow:
    // When onSortChange is provided, disableSorting=true prevents internal sorting
    // The source data stays in the order provided (which should be tree-sorted)

    const computedData = store.get(computedDataAtom)

    // ============================================================================
    // ASSERT
    // ============================================================================

    const sortedItems = computedData.items
    const names = sortedItems.map((item) => item.n)

    // With onSortChange handler, uiState doesn't change, so createComputedTableDataAtom
    // doesn't re-sort. The data stays in the order provided by the source atom.
    // Since we provided pre-sorted tree data, hierarchy should be preserved.

    console.log('With onSortChange - names:', names)

    // Extract positions
    const storageIdx = names.indexOf('Storage')
    const aContainerIdx = names.indexOf('A-Container')
    const zContainerIdx = names.indexOf('Z-Container')
    const mChildIdx = names.indexOf('M-Child')
    const aChildIdx = names.indexOf('A-Child')
    const zChildIdx = names.indexOf('Z-Child')

    // All items must be present
    expect(storageIdx).toBeGreaterThanOrEqual(0)
    expect(aContainerIdx).toBeGreaterThanOrEqual(0)
    expect(zContainerIdx).toBeGreaterThanOrEqual(0)
    expect(mChildIdx).toBeGreaterThanOrEqual(0)
    expect(aChildIdx).toBeGreaterThanOrEqual(0)
    expect(zChildIdx).toBeGreaterThanOrEqual(0)

    // When onSortChange prevents internal sorting, the data stays in original order
    // Original order has correct hierarchy: Storage → A-Container → M-Child → Z-Container → A-Child → Z-Child
    expect(names).toEqual([
      'Storage',
      'A-Container',
      'M-Child',
      'Z-Container',
      'A-Child',
      'Z-Child'
    ])

    // Verify hierarchy is PRESERVED
    expect(storageIdx).toBe(0)
    expect(aContainerIdx).toBe(1)
    expect(mChildIdx).toBe(2) // M-Child right after A-Container
    expect(zContainerIdx).toBe(3)
    expect(aChildIdx).toBe(4) // A-Child right after Z-Container
    expect(zChildIdx).toBe(5) // Z-Child right after A-Child

    // Verify children are immediately after their parents
    const hierarchyPreserved =
      mChildIdx === aContainerIdx + 1 &&
      aChildIdx === zContainerIdx + 1 &&
      zChildIdx === zContainerIdx + 2

    expect(hierarchyPreserved).toBe(true)
  })
})
