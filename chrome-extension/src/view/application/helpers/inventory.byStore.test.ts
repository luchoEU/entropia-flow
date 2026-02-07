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
      materialItems: [],
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
