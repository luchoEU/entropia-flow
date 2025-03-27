import { SHOW_TT_SERVICE } from "../../../config";
import { RowValue } from "../../components/common/SortableTabularSection.data";
import { hideByContainer, hideByName, hideByValue, showTradingItemData } from "../actions/inventory";
import { setTabularFilter } from "../actions/tabular";
import { reloadTTService } from "../actions/ttService";
import { INVENTORY_TABULAR_OWNED, InventoryState, ItemVisible, TradeItemData } from "../state/inventory";
import { TabularDefinitions, TabularRawData } from "../state/tabular";

const inventoryTabularData = (state: InventoryState): TabularRawData<ItemVisible> => ({
    [INVENTORY_TABULAR_OWNED]: { data: state.tradeItemDataChain, items: state.visible }
})

const inventoryTabularDefinitions: TabularDefinitions = {
    [INVENTORY_TABULAR_OWNED]: {
        title: 'Owned List',
        subtitle: 'List of the Items you own, excluding hidden ones',
        columns: ['Name', 'Quantity', 'Value', 'TT Service', 'Container'],
        columnVisible: (data: TradeItemData[]) => [true, true, true, !data && SHOW_TT_SERVICE, !data],
        columnHeaderAfterName: [,,,{ img: 'img/reload.png', title: 'Reload TT Service from sheet', dispatch: reloadTTService }],
        getRow: (g: ItemVisible): RowValue[] => {
            return [
                { // Name
                    dispatch: () => showTradingItemData(g.c?.showingTradeItem ? undefined : g.data.n, 0),
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
                ], [ // TT Service
                    g.c?.ttServiceValue?.toFixed(2) + ' PED'
                ], [ // Container
                    { img: 'img/cross.png', title: 'Hide this container', dispatch: () => hideByContainer(g.data.c) },
                    g.data.c
                ]
            ]
        },
        getRowForSort: (g: ItemVisible) => [g.data.n, Number(g.data.q), Number(g.data.v), g.c?.ttServiceValue ?? 0, g.data.c],
        getPedValue: (g: ItemVisible) => Number(g.data.v)
    }
}

export {
    inventoryTabularDefinitions,
    inventoryTabularData,
}
