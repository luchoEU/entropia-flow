import { RowValue } from "../../components/common/SortableTabularSection.data";
import { hideByContainer, hideByName, hideByValue, showByContainer, showByName, showByValue, showTradingItemData } from "../actions/inventory";
import { setTabularFilter } from "../actions/tabular";
import { reloadTTService } from "../actions/ttService";
import { INVENTORY_TABULAR_OWNED, InventoryState, ItemOwned, TradeItemData } from "../state/inventory";
import { FEATURE_TT_SERVICE_TRADE_COLUMN, isFeatureEnabled, SettingsState } from "../state/settings";
import { TabularDefinitions, TabularRawData } from "../state/tabular";

interface InventoryTabularOwnedData {
    ttService: boolean
    chain: TradeItemData[]
}

const inventoryTabularData = (state: InventoryState, settings: SettingsState): TabularRawData<ItemOwned, InventoryTabularOwnedData> => ({
    [INVENTORY_TABULAR_OWNED]: {
        data: {
            ttService: isFeatureEnabled(FEATURE_TT_SERVICE_TRADE_COLUMN, settings),
            chain: state.tradeItemDataChain
        },
        items: state.hiddenCriteria.show ? state.owned : state.owned.filter(d => !d.c.hidden.any)
    },
})

const inventoryTabularDefinitions: TabularDefinitions = {
    [INVENTORY_TABULAR_OWNED]: {
        title: 'Owned List',
        subtitle: 'List of the Items you own, excluding hidden ones',
        columns: ['Name', 'Quantity', 'Value', 'TT Service', 'Container'],
        columnVisible: (d?: InventoryTabularOwnedData) => [true, true, true, !d?.chain && d?.ttService, !d?.chain],
        columnHeaderAfterName: [,,,{ img: 'img/reload.png', title: 'Reload TT Service from sheet', dispatch: reloadTTService }],
        getRow: (g: ItemOwned): RowValue[] => {
            return g.c.hidden.any ? [
                [ // Name
                    { img: 'img/tick.png', title: 'Show this item name', dispatch: () => showByName(g.data.n), visible: g.c.hidden.name },
                    g.data.n,
                    { flex: 1 },
                    { img: 'img/find.png', title: 'Search by this item name', dispatch: () => setTabularFilter(INVENTORY_TABULAR_OWNED)(`!${g.data.n}`) }
                ], g.data.q // Quantity
                , [ // Value
                    { img: 'img/tick.png', title: 'Show this value or higher', dispatch: () => showByValue(g.data.v), visible: g.c.hidden.value },
                    g.data.v + ' PED'
                ], [ // TT Service
                    g.c?.ttServiceValue?.toFixed(2) + ' PED'
                ], [ // Container
                    { img: 'img/tick.png', title: 'Show this container', dispatch: () => showByContainer(g.data.c), visible: g.c.hidden.container },
                    g.data.c
                ]
            ] : [
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
        getRowClass: (g: ItemOwned) => g.c.hidden.any ? 'hidden-item-row' : undefined,
        getRowForSort: (g: ItemOwned) => [g.data.n, Number(g.data.q), Number(g.data.v), g.c?.ttServiceValue ?? 0, g.data.c],
        getPedValue: (g: ItemOwned) => Number(g.data.v)
    }
}

export {
    inventoryTabularDefinitions,
    inventoryTabularData,
}
