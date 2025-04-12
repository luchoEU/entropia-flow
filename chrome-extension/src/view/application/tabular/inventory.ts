import { RowValue } from "../../components/common/SortableTabularSection.data";
import { hideByContainer, hideByName, hideByValue, showByContainer, showByName, showByValue, showTradingItemData } from "../actions/inventory";
import { setTabularFilter } from "../actions/tabular";
import { reloadTTService } from "../actions/ttService";
import { INVENTORY_TABULAR_OWNED, InventoryState, ItemOwned, TradeItemData } from "../state/inventory";
import { MaterialsMap, MaterialState } from "../state/materials";
import { FEATURE_TT_SERVICE_TRADE_COLUMN, isFeatureEnabled, SettingsState } from "../state/settings";
import { TabularDefinitions, TabularRawData } from "../state/tabular";

interface InventoryTabularOwnedData {
    ttService: boolean
    chain: TradeItemData[]
}

const inventoryTabularData = (state: InventoryState, settings: SettingsState, materials: MaterialsMap): TabularRawData<ItemOwned, InventoryTabularOwnedData> => {
    let items: ItemOwned[] = state.owned.hideCriteria.show ? state.owned.items : state.owned.items.filter(d => !d.c.hidden.any);
    if (state.owned.options.reserve) {
        items = items.map(d => {
            const m: MaterialState = materials[d.data.n];
            if (!m) return d;
            const reserve: number = parseFloat(m.reserveAmount);
            if (isNaN(reserve)) return d;
            const unitValue = m.web?.material?.data.value.value
            const nv = Number(d.data.v) - reserve;
            const v = nv.toFixed(2);
            const q = unitValue ? (nv / unitValue).toFixed(0) : ''; // dont show quantity if unit value is unknown
            return { ...d, data: { ...d.data, v, q } }
        });
    }
    return {
        [INVENTORY_TABULAR_OWNED]: {
            data: {
                ttService: isFeatureEnabled(FEATURE_TT_SERVICE_TRADE_COLUMN, settings),
                chain: state.tradeItemDataChain
            },
            items
        },
    }
}

const inventoryTabularDefinitions: TabularDefinitions = {
    [INVENTORY_TABULAR_OWNED]: {
        title: 'Owned List',
        subtitle: 'List of the Items you own, excluding hidden ones',
        columns: ['Name', 'Quantity', 'Value', 'TT Service', 'Container'],
        columnVisible: (items?: ItemOwned[], data?: InventoryTabularOwnedData) => {
            const chainRootName = data?.chain?.[0].name;
            const hasChain = !chainRootName || !items?.some(g => g.data.n === chainRootName);
            return [true, true, true, hasChain && data?.ttService, hasChain]
        },
        columnHeaderAfterName: [,,,{ img: 'img/reload.png', title: 'Reload TT Service from sheet', dispatch: reloadTTService }],
        getRow: (g: ItemOwned): RowValue[] => {
            return [
                { // Name
                    dispatch: () => showTradingItemData(g.c?.showingTradeItem ? undefined : g.data.n, 0),
                    sub: [
                        g.c.hidden.any ?
                            { img: 'img/tick.png', title: 'Show this item name', dispatch: () => showByName(g.data.n), visible: g.c.hidden.name } :
                            { img: 'img/cross.png', title: 'Hide this item name', dispatch: () => hideByName(g.data.n) },
                        { text: g.data.n, class: g.c?.showingTradeItem && 'active' },
                        g.c?.showingTradeItem ?
                            { img: 'img/left.png', title: 'Hide item details', show: true } :
                            { img: 'img/right.png', title: 'Show item details' },
                        { flex: 1 },
                        { img: 'img/find.png', title: 'Search by this item name', dispatch: () => setTabularFilter(INVENTORY_TABULAR_OWNED)(`!${g.data.n}`) }
                    ]
                }, g.data.q // Quantity
                , [ // Value
                    g.c.hidden.any ?
                        { img: 'img/tick.png', title: 'Show this value or higher', dispatch: () => showByValue(g.data.v), visible: g.c.hidden.value } :
                        { img: 'img/cross.png', title: 'Hide this value or lower', dispatch: () => hideByValue(g.data.v) },
                    g.data.v + ' PED'
                ], [ // TT Service
                    g.c?.ttServiceValue?.toFixed(2) + ' PED'
                ], [ // Container
                    g.c.hidden.any ?
                        { img: 'img/tick.png', title: 'Show this container', dispatch: () => showByContainer(g.data.c), visible: g.c.hidden.container } :
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
