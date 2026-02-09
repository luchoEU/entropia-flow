/**
 * Test for tree-aware sorting in inventory by store
 *
 * Problem: When you have a multi-level tree (containers with child items) and
 * sort the FLAT array instead of the TREE structure, parent-child relationships
 * break because children get separated from their parents.
 *
 * Test structure:
 *   Input (containers deliberately ordered Z before A):
 *     Storage (root)
 *       Z-Container
 *         Z-Child
 *         A-Child
 *       A-Container
 *         M-Child
 *
 *   Expected output (sorted at each level, hierarchy preserved):
 *     Storage (root)
 *       A-Container (A < Z, sorted)
 *         M-Child (stays with parent)
 *       Z-Container
 *         A-Child (A < Z, sorted within parent)
 *         Z-Child (stays with parent)
 */

describe('loadInventoryByStore preserves hierarchy when sorting multi-level trees', () => {
  it('should keep children under their parent containers after sorting', () => {
    // ============================================================================
    // ARRANGE
    // ============================================================================

    const { loadInventoryByStore } = require('./inventory.byStore')

    // Items with c='Z-Container' become children of the item named 'Z-Container'.
    // Containers are placed Z before A so sorting must reorder them.
    // Children within Z-Container are placed Z before A to test inner sorting.
    const itemData: any[] = [
      { id: 'z-cont', n: 'Z-Container', q: '1', v: '10.00', c: 'Storage', r: undefined },
      { id: 'a-cont', n: 'A-Container', q: '1', v: '20.00', c: 'Storage', r: undefined },
      { id: 'z-child', n: 'Z-Child', q: '2', v: '5.00', c: 'Z-Container', r: undefined },
      { id: 'a-child', n: 'A-Child', q: '3', v: '8.00', c: 'Z-Container', r: undefined },
      { id: 'm-child', n: 'M-Child', q: '1', v: '3.00', c: 'A-Container', r: undefined },
    ]

    const emptyByStore: any = {
      containers: {},
      staredExpanded: [],
      materialExpanded: [],
      items: [],
      staredItems: [],
    }

    // ============================================================================
    // ACT
    // ============================================================================

    const result = loadInventoryByStore(emptyByStore, itemData)

    // ============================================================================
    // ASSERT
    // ============================================================================

    const flatItems = result.items
    const names = flatItems.map((item: any) => item.n)

    // Find positions in the flat output
    const aContainerIdx = names.indexOf('A-Container')
    const zContainerIdx = names.indexOf('Z-Container')
    const mChildIdx = names.indexOf('M-Child')
    const aChildIdx = names.indexOf('A-Child')
    const zChildIdx = names.indexOf('Z-Child')

    // All items must be present
    expect(aContainerIdx).toBeGreaterThanOrEqual(0)
    expect(zContainerIdx).toBeGreaterThanOrEqual(0)
    expect(mChildIdx).toBeGreaterThanOrEqual(0)
    expect(aChildIdx).toBeGreaterThanOrEqual(0)
    expect(zChildIdx).toBeGreaterThanOrEqual(0)

    // Containers sorted: A-Container before Z-Container
    expect(aContainerIdx).toBeLessThan(zContainerIdx)

    // Hierarchy preserved: M-Child between A-Container and Z-Container
    expect(mChildIdx).toBeGreaterThan(aContainerIdx)
    expect(mChildIdx).toBeLessThan(zContainerIdx)

    // Hierarchy preserved: A-Child and Z-Child after Z-Container
    expect(aChildIdx).toBeGreaterThan(zContainerIdx)
    expect(zChildIdx).toBeGreaterThan(zContainerIdx)

    // Children sorted within Z-Container: A-Child before Z-Child
    expect(aChildIdx).toBeLessThan(zChildIdx)
  })
})

describe('getContainerBreadcrumb', () => {
  const { getContainerBreadcrumb } = require('./inventory.byStore')

  it('should return empty array for root containers (indent=0)', () => {
    const items: any[] = [
      { id: '1', n: 'STORAGE', q: '1', v: '0', c: 'STORAGE', indent: 0 }
    ]
    const item = items[0]
    const breadcrumb = getContainerBreadcrumb(item, items)
    expect(breadcrumb).toEqual([])
  })

  it('should return single parent for direct children (indent=1)', () => {
    const items: any[] = [
      { id: '1', n: 'STORAGE', q: '1', v: '0', c: 'STORAGE', indent: 0 },
      { id: '2', n: 'Item A', q: '5', v: '10.00', c: 'STORAGE', indent: 1 }
    ]
    const item = items[1]
    const breadcrumb = getContainerBreadcrumb(item, items)
    expect(breadcrumb).toEqual(['STORAGE'])
  })

  it('should return full path for multi-level nested items', () => {
    const items: any[] = [
      { id: '1', n: 'STORAGE', q: '1', v: '0', c: 'STORAGE', indent: 0 },
      { id: '2', n: 'Viceroy MK1', q: '1', v: '100.00', c: 'STORAGE', indent: 1 },
      { id: '3', n: 'Weapon A', q: '3', v: '50.00', c: 'Viceroy MK1', indent: 2 }
    ]
    const item = items[2]
    const breadcrumb = getContainerBreadcrumb(item, items)
    expect(breadcrumb).toEqual(['STORAGE', 'Viceroy MK1'])
  })

  it('should handle deeply nested items (indent=3+)', () => {
    const items: any[] = [
      { id: '1', n: 'STORAGE', q: '1', v: '0', c: 'STORAGE', indent: 0 },
      { id: '2', n: 'Cabinet', q: '1', v: '100.00', c: 'STORAGE', indent: 1 },
      { id: '3', n: 'Drawer', q: '1', v: '50.00', c: 'Cabinet', indent: 2 },
      { id: '4', n: 'Item', q: '5', v: '10.00', c: 'Drawer', indent: 3 }
    ]
    const item = items[3]
    const breadcrumb = getContainerBreadcrumb(item, items)
    expect(breadcrumb).toEqual(['STORAGE', 'Cabinet', 'Drawer'])
  })

  it('should return empty array for item not in list', () => {
    const items: any[] = [
      { id: '1', n: 'STORAGE', q: '1', v: '0', c: 'STORAGE', indent: 0 }
    ]
    const item = { id: 'unknown', n: 'Unknown', q: '1', v: '0', c: 'STORAGE', indent: 1 }
    const breadcrumb = getContainerBreadcrumb(item, items)
    expect(breadcrumb).toEqual([])
  })

  it('should skip siblings at same indent level when walking backwards', () => {
    const items: any[] = [
      { id: '1', n: 'STORAGE', q: '1', v: '0', c: 'STORAGE', indent: 0 },
      { id: '2', n: 'Item A', q: '1', v: '10.00', c: 'STORAGE', indent: 1 },
      { id: '3', n: 'Item B', q: '2', v: '20.00', c: 'STORAGE', indent: 1 },
      { id: '4', n: 'Item C', q: '3', v: '30.00', c: 'STORAGE', indent: 1 }
    ]
    // Item C should skip over Item B and A (siblings) to find STORAGE
    const item = items[3]
    const breadcrumb = getContainerBreadcrumb(item, items)
    expect(breadcrumb).toEqual(['STORAGE'])
  })

  it('should handle multiple containers at root level', () => {
    const items: any[] = [
      { id: '1', n: 'STORAGE', q: '1', v: '0', c: 'STORAGE', indent: 0 },
      { id: '2', n: 'CARRIED', q: '1', v: '0', c: 'CARRIED', indent: 0 },
      { id: '3', n: 'Item A', q: '5', v: '10.00', c: 'CARRIED', indent: 1 }
    ]
    const item = items[2]
    const breadcrumb = getContainerBreadcrumb(item, items)
    expect(breadcrumb).toEqual(['CARRIED'])
  })

  it('should build breadcrumb by walking backwards correctly', () => {
    // In a properly flattened tree, all children of a container appear before siblings
    const items: any[] = [
      { id: '1', n: 'Root', q: '1', v: '0', c: 'Root', indent: 0 },
      { id: '2', n: 'Child', q: '1', v: '10.00', c: 'Root', indent: 1 },
      { id: '3', n: 'GrandChild', q: '3', v: '5.00', c: 'Child', indent: 2 },
      { id: '4', n: 'Sibling', q: '2', v: '20.00', c: 'Root', indent: 1 }
    ]
    const grandChild = items[2]
    const breadcrumb = getContainerBreadcrumb(grandChild, items)
    expect(breadcrumb).toEqual(['Root', 'Child'])
  })
})
