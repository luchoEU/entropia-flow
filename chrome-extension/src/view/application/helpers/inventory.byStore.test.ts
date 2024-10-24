import { ItemData } from "../../../common/state"
import { InventoryState } from "../state/inventory"
import { initialState, reduceLoadInventoryState, reduceSetCurrentInventory } from "./inventory"
import { cleanForSaveByStore, reduceCancelByStoreStaredItemNameEditing, reduceConfirmByStoreItemNameEditing, reduceConfirmByStoreStaredItemNameEditing, reduceSetByStoreItemExpanded, reduceSetByStoreItemName, reduceSetByStoreItemStared, reduceSetByStoreStaredInventoryExpanded, reduceSetByStoreStaredInventoryFilter, reduceSetByStoreStaredItemExpanded, reduceSetByStoreStaredItemName, reduceSetByStoreStaredItemStared, reduceSortByStoreBy, reduceSortByStoreStaredBy, reduceStartByStoreItemNameEditing, reduceStartByStoreStaredItemNameEditing } from "./inventory.byStore"
import { SORT_NAME_ASCENDING, SORT_QUANTITY_ASCENDING } from "./inventory.sort"

describe('inventory by store reducers', () => {
    let item1: ItemData
    let item2: ItemData
    let item3: ItemData
    let state: InventoryState

    beforeEach(() => {
        item1 = { id: 'y', n: 'item1', q: '2', v: '0.00', c: 'A' }
        item2 = { id: 'x', n: 'item2', q: '1', v: '0.00', c: 'A' }
        item3 = { id: 'z', n: 'item3', q: '3', v: '0.00', c: 'item2', r: 'x' }
        state = reduceSetCurrentInventory(initialState, { meta: undefined, itemlist: [item1, item2, item3] })
    })

    test('load original', async () => {
        expect(state.byStore.originalList.items[0].list.items.map((i) => i.data)).toEqual([item1, item2])
    })

    test('star item', async () => {
        state = reduceSetByStoreItemStared(state, '-1', true)
        expect(state.byStore.containers['-1'].stared).toBe(true)
        expect(state.byStore.showList.items[0].stared).toBe(true)
        expect(state.byStore.staredList.items[0].list.items.map((i) => i.data.n)).toEqual(['item1', 'item2'])
    })

    test('save star item', async () => {
        state = reduceSetByStoreItemStared(state, '-1', true)
        state.byStore = cleanForSaveByStore(state.byStore)
        state = reduceLoadInventoryState(initialState, state)
        expect(state.byStore.containers['-1'].stared).toBe(true)
        expect(state.byStore.staredList.items[0].list.items.map((i) => i.data.n)).toEqual(['item1', 'item2'])
    })

    test('sort stared by quantity', async () => {
        state = reduceSetByStoreItemStared(state, '-1', true)
        state = reduceSortByStoreStaredBy(state, SORT_QUANTITY_ASCENDING)
        expect(state.byStore.staredList.items[0].list.items.map((i) => i.data.n)).toEqual(['item2', 'item1'])
    })

    test('save sort stared by quantity', async () => {
        state = reduceSetByStoreItemStared(state, '-1', true)
        state = reduceSortByStoreStaredBy(state, SORT_QUANTITY_ASCENDING)
        state.byStore = cleanForSaveByStore(state.byStore)
        state = reduceLoadInventoryState(initialState, state)
        expect(state.byStore.staredList.items[0].list.items.map((i) => i.data.q)).toEqual(['1', '2'])
    })

    test('expand stared inventory', async () => {
        state = reduceSetByStoreStaredInventoryExpanded(state, false)
        expect(state.byStore.staredList.expanded).toBe(false)
    })

    test('save expand stared inventory', async () => {
        state = reduceSetByStoreStaredInventoryExpanded(state, false)
        state.byStore = cleanForSaveByStore(state.byStore)
        state = reduceLoadInventoryState(initialState, state)
        expect(state.byStore.staredList.expanded).toBe(false)
    })

    test('expand item stared', async () => {
        state = reduceSetByStoreItemStared(state, '-1', true)
        state = reduceSetByStoreStaredItemExpanded(state, 'x', false)
        expect(state.byStore.staredList.items[0].list.items[1].list.expanded).toBe(false)
        expect(state.byStore.containers['x'].expanded).toBe(true)
    })

    test('save expand item stared', async () => {
        state = reduceSetByStoreItemStared(state, '-1', true)
        state = reduceSetByStoreStaredItemExpanded(state, 'x', false)
        state.byStore = cleanForSaveByStore(state.byStore)
        state = reduceLoadInventoryState(initialState, state)
        expect(state.byStore.staredList.items[0].list.items[1].list.expanded).toBe(false)
    })

    test('filter stared', async () => {
        state = reduceSetByStoreItemStared(state, '-1', true)
        state = reduceSetByStoreStaredInventoryFilter(state, 'item2')
        expect(state.byStore.staredList.items[0].list.items.map((i) => i.data.n)).toEqual(['item2'])
    })

    test('save filter stared', async () => {
        state = reduceSetByStoreItemStared(state, '-1', true)
        state = reduceSetByStoreStaredInventoryFilter(state, 'item2')
        state.byStore = cleanForSaveByStore(state.byStore)
        state = reduceLoadInventoryState(initialState, state)
        expect(state.byStore.staredList.items[0].list.items.map((i) => i.data.n)).toEqual(['item2'])
    })

    test('clear filter stared', async () => {
        state = reduceSetByStoreItemStared(state, '-1', true)
        state = reduceSetByStoreStaredInventoryFilter(state, 'item2')
        state = reduceSetByStoreStaredInventoryFilter(state, '')
        expect(state.byStore.staredList.items[0].list.items.map((i) => i.data.n)).toEqual(['item1', 'item2'])
    })

    test('start name editing stared', async () => {
        state = reduceSetByStoreItemStared(state, '-1', true)
        state = reduceStartByStoreStaredItemNameEditing(state, '-1.x')
        expect(state.byStore.staredList.items[0].list.items[1].editing).toEqual({ originalName: 'item2' })
    })

    test('save start name editing stared', async () => {
        state = reduceSetByStoreItemStared(state, '-1', true)
        state = reduceStartByStoreStaredItemNameEditing(state, '-1.x')
        state.byStore = cleanForSaveByStore(state.byStore)
        state = reduceLoadInventoryState(initialState, state)
        expect(state.byStore.staredList.items[0].list.items[1].editing).toBe(undefined)
    })

    test('remove stared', async () => {
        state = reduceSetByStoreItemStared(state, '-1', true)
        state = reduceSetByStoreStaredItemName(state, '-1.x', 'item2renamed')
        expect(state.byStore.staredList.items[0].list.items[1].displayName).toBe('item2renamed')
    })

    test('confirm name editing', async () => {
        state = reduceSetByStoreItemStared(state, '-1', true)
        state = reduceStartByStoreStaredItemNameEditing(state, '-1.x')
        state = reduceSetByStoreStaredItemName(state, '-1.x', 'item2renamed')
        state = reduceConfirmByStoreStaredItemNameEditing(state, '-1.x')
        expect(state.byStore.containers['x'].displayName).toBe('item2renamed')
    })

    test('save confirm name editing', async () => {
        state = reduceSetByStoreItemStared(state, '-1', true)
        state = reduceStartByStoreStaredItemNameEditing(state, '-1.x')
        state = reduceSetByStoreStaredItemName(state, '-1.x', 'item2renamed')
        state = reduceConfirmByStoreStaredItemNameEditing(state, '-1.x')
        state.byStore = cleanForSaveByStore(state.byStore)
        state = reduceLoadInventoryState(initialState, state)
        expect(state.byStore.containers['x'].displayName).toBe('item2renamed')
    })

    test('rename root stared changes other places', async () => {
        state = reduceSetByStoreItemStared(state, '-1', true)
        state = reduceSetByStoreItemStared(state, 'x', true)
        state = reduceStartByStoreStaredItemNameEditing(state, 'x')
        state = reduceSetByStoreStaredItemName(state, 'x', 'item2renamed')
        state = reduceConfirmByStoreStaredItemNameEditing(state, 'x')
        expect(state.byStore.staredList.items[1].displayName).toBe('item2renamed')
        expect(state.byStore.staredList.items[0].list.items[1].displayName).toBe('item2renamed')
        expect(state.byStore.showList.items[0].list.items[1].displayName).toBe('item2renamed')
    })

    test('rename child stared changes other places', async () => {
        state = reduceSetByStoreItemStared(state, '-1', true)
        state = reduceSetByStoreItemStared(state, 'x', true)
        state = reduceStartByStoreStaredItemNameEditing(state, '-1.x')
        state = reduceSetByStoreStaredItemName(state, '-1.x', 'item2renamed')
        state = reduceConfirmByStoreStaredItemNameEditing(state, '-1.x')
        expect(state.byStore.staredList.items[1].displayName).toBe('item2renamed')
        expect(state.byStore.staredList.items[0].list.items[1].displayName).toBe('item2renamed')
        expect(state.byStore.showList.items[0].list.items[1].displayName).toBe('item2renamed')
    })

    test('rename stared changes other places', async () => {
        state = reduceSetByStoreItemStared(state, '-1', true)
        state = reduceSetByStoreItemStared(state, 'x', true)
        state = reduceStartByStoreItemNameEditing(state, 'x')
        state = reduceSetByStoreItemName(state, 'x', 'item2renamed')
        state = reduceConfirmByStoreItemNameEditing(state, 'x')
        expect(state.byStore.staredList.items[1].displayName).toBe('item2renamed')
        expect(state.byStore.staredList.items[0].list.items[1].displayName).toBe('item2renamed')
        expect(state.byStore.showList.items[0].list.items[1].displayName).toBe('item2renamed')
    })

    test('cancel name editing stared', async () => {
        state = reduceSetByStoreItemStared(state, '-1', true)
        state = reduceStartByStoreStaredItemNameEditing(state, '-1.x')
        state = reduceSetByStoreStaredItemName(state, '-1.x', 'item2renamed')
        state = reduceCancelByStoreStaredItemNameEditing(state, '-1.x')
        expect(state.byStore.staredList.items[0].list.items[1].displayName).toBe('item2')
    })

    test('remove star item stared', async () => {
        state = reduceSetByStoreItemStared(state, '-1', true)
        state = reduceSetByStoreStaredItemStared(state, '-1', false)
        expect(state.byStore.staredList.items.length).toBe(0)
    })

    test('child item stared', async () => {
        state = reduceSetByStoreItemStared(state, '-1', true)
        state = reduceSetByStoreStaredItemStared(state, '-1.x', true)
        expect(state.byStore.staredList.items[1].data.n).toBe('item2')
    })

    test('save child item stared', async () => {
        state = reduceSetByStoreItemStared(state, '-1', true)
        state = reduceSetByStoreStaredItemStared(state, '-1.x', true)
        state.byStore = cleanForSaveByStore(state.byStore)
        state = reduceLoadInventoryState(initialState, state)
        expect(state.byStore.staredList.items[1].data.n).toBe('item2')
    })

    test('stable position on rename', async () => {
        state = reduceSetByStoreItemStared(state, '-1', true)
        state = reduceStartByStoreItemNameEditing(state, 'x')
        state = reduceSetByStoreItemName(state, 'x', 'aitem2')
        state = reduceConfirmByStoreItemNameEditing(state, 'x')
        expect(state.byStore.showList.items[0].list.items[1].displayName).toBe('aitem2')
    })

    test('stable position clears on sort', async () => {
        state = reduceSetByStoreItemStared(state, '-1', true)
        state = reduceStartByStoreItemNameEditing(state, 'x')
        state = reduceSetByStoreItemName(state, 'x', 'aitem2')
        state = reduceConfirmByStoreItemNameEditing(state, 'x')
        state = reduceSortByStoreBy(state, SORT_NAME_ASCENDING)
        state = reduceSortByStoreBy(state, SORT_NAME_ASCENDING) // twice as WA of nextSortType
        expect(state.byStore.showList.items[0].list.sortType).toBe(SORT_NAME_ASCENDING)
        expect(state.byStore.showList.items[0].list.items[0].displayName).toBe('aitem2')
    })

    test('save stable position on rename', async () => {
        state = reduceSetByStoreItemStared(state, '-1', true)
        state = reduceStartByStoreItemNameEditing(state, 'x')
        state = reduceSetByStoreItemName(state, 'x', 'aitem2')
        state = reduceConfirmByStoreItemNameEditing(state, 'x')
        state.byStore = cleanForSaveByStore(state.byStore)
        state = reduceLoadInventoryState(initialState, state)
        expect(state.byStore.showList.items[0].list.items[0].displayName).toBe('aitem2')
    })

    test('stable position on rename stared', async () => {
        state = reduceSetByStoreItemStared(state, '-1', true)
        state = reduceStartByStoreStaredItemNameEditing(state, '-1.x')
        state = reduceSetByStoreStaredItemName(state, '-1.x', 'aitem2')
        state = reduceConfirmByStoreStaredItemNameEditing(state, '-1.x')
        expect(state.byStore.staredList.items[0].list.items[1].displayName).toBe('aitem2')
    })

    test('stable position stared clears on sort', async () => {
        state = reduceSetByStoreItemStared(state, '-1', true)
        state = reduceStartByStoreStaredItemNameEditing(state, '-1.x')
        state = reduceSetByStoreStaredItemName(state, '-1.x', 'aitem2')
        state = reduceConfirmByStoreStaredItemNameEditing(state, '-1.x')
        state = reduceSortByStoreStaredBy(state, SORT_NAME_ASCENDING)
        state = reduceSortByStoreStaredBy(state, SORT_NAME_ASCENDING) // twice as WA of nextSortType
        expect(state.byStore.staredList.items[0].list.sortType).toBe(SORT_NAME_ASCENDING)
        expect(state.byStore.staredList.items[0].list.items[0].displayName).toBe('aitem2')
    })

    test('save stable position on rename stared', async () => {
        state = reduceSetByStoreItemStared(state, '-1', true)
        state = reduceStartByStoreStaredItemNameEditing(state, '-1.x')
        state = reduceSetByStoreStaredItemName(state, '-1.x', 'aitem2')
        state = reduceConfirmByStoreStaredItemNameEditing(state, '-1.x')
        state.byStore = cleanForSaveByStore(state.byStore)
        state = reduceLoadInventoryState(initialState, state)
        expect(state.byStore.staredList.items[0].list.items[0].displayName).toBe('aitem2')
    })

    test('preseve expanded when star container', async () => {
        item1 = { id: '1', n: 'item1', q: '11', v: '0.00', c: 'A' }
        item2 = { id: '2', n: 'item2', q: '12', v: '0.00', c: 'B' }
        state = reduceSetCurrentInventory(initialState, { meta: undefined, itemlist: [item1, item2] })
        state = reduceSetByStoreItemExpanded(state, '-1', false)
        expect(state.byStore.showList.items[0].list.expanded).toBe(false)

        state = reduceSetByStoreItemStared(state, '-2', true)
        expect(state.byStore.showList.items[0].list.expanded).toBe(false)
    })
})
