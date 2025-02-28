import { RowValue } from "../../components/common/SortableTabularSection.data";
import { hideByContainer, hideByName, hideByValue, showTradingItemData } from "../actions/inventory";
import { setTabularFilter } from "../actions/tabular";
import { INVENTORY_TABULAR_OWNED, InventoryState, ItemVisible } from "../state/inventory";
import { TabularDefinitions, TabularRawData } from "../state/tabular";

const inventoryTabularData = (state: InventoryState): TabularRawData<ItemVisible> => ({
    [INVENTORY_TABULAR_OWNED]: state.visible
})

const inventoryTabularDefinitions: TabularDefinitions = {
    [INVENTORY_TABULAR_OWNED]: {
        title: 'Owned List',
        columns: ['Name', 'Quantity', 'Value', 'Container', 'TT Service'],
        // TODO:
        // [TT_SERVICE_COLUMN]: { justifyContent: 'end', show: SHOW_TT_SERVICE, sortable: false, sub: [
        // { title: 'Reload TT Service from sheet', imgButton: { src: 'img/reload.png', dispatch: () => reloadTTService }}
        getRow: (g: ItemVisible): RowValue[] => {
            return [
                { // Name
                    dispatch: () => showTradingItemData(g.c?.showingTradeItem ? undefined : g.data.n),
                    sub: [
                        { img: 'img/cross.png', title: 'Hide this item name', dispatch: () => hideByName(g.data.n) },
                        g.data.n,
                        g.c?.showingTradeItem ?
                            { img: 'img/left.png', title: 'Hide item details' } :
                            { img: 'img/right.png', title: 'Show item details' },
                        { flex: 1 },
                        { img: 'img/find.png', title: 'Search by this item name', dispatch: () => setTabularFilter(INVENTORY_TABULAR_OWNED)(`!${g.data.n}`) }
                    ]
                }, g.data.q // Quantity
                , [ // Value
                    { img: 'img/cross.png', title: 'Hide this value or lower', dispatch: () => hideByValue(g.data.v) },
                    g.data.v + ' PED'
                ], [ // Container
                    { img: 'img/cross.png', title: 'Hide this container', dispatch: () => hideByContainer(g.data.c) },
                    g.data.c
                ], [ // TT Service
                    g.c?.ttServiceValue?.toFixed(2) + ' PED'
                ]
            ]
        },
        getRowForSort: (g: ItemVisible) => [g.data.n,, g.data.v, g.data.c, g.c?.ttServiceValue ?? ''],
        getPedValue: (g: ItemVisible) => Number(g.data.v)
    }
}

export {
    inventoryTabularDefinitions,
    inventoryTabularData,
}
