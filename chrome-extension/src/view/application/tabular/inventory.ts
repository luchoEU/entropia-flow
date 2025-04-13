import { RowValue } from "../../components/common/SortableTabularSection.data";
import { hideByContainer, hideByName, hideByValue, showByContainer, showByName, showByValue, showTradingItemData } from "../actions/inventory";
import { setTabularFilter } from "../actions/tabular";
import { loadTTService } from "../actions/ttService";
import { INVENTORY_TABULAR_OWNED, InventoryState, ItemOwned, TradeItemData } from "../state/inventory";
import { ItemsMap, ItemState } from "../state/items";
import { FEATURE_TT_SERVICE_TRADE_COLUMN, isFeatureEnabled, SettingsState } from "../state/settings";
import { TabularDefinitions, TabularRawData } from "../state/tabular";
import { TTServiceInventoryWebData, TTServiceState } from "../state/ttService";

interface InventoryTabularOwnedData {
    ttService: {
        featureEnabled: boolean,
        loadingSource?: string,
        loadingError?: string
    },
    chain: TradeItemData[]
}

const inventoryTabularData = (state: InventoryState, settings: SettingsState, items: ItemsMap, ttService: TTServiceState): TabularRawData<ItemOwned, InventoryTabularOwnedData> => {
    let list: ItemOwned[] = state.owned.hideCriteria.show ? state.owned.items : state.owned.items.filter(d => !d.c.hidden.any);
    if (state.owned.options.reserve) {
        list = list.map(d => {
            const m: ItemState = items[d.data.n];
            if (!m) return d;
            const reserve: number = parseFloat(m.reserveAmount);
            if (isNaN(reserve)) return d;
            const unitValue = m.web?.item?.data.value.value
            const nv = Number(d.data.v) - reserve;
            const v = nv.toFixed(2);
            const q = unitValue ? (nv / unitValue).toFixed(0) : ''; // dont show quantity if unit value is unknown
            return { ...d, data: { ...d.data, v, q } }
        });
    }
    if (state.owned.options.auction) {
        const auctionItems: string[] = state.owned.items.filter(d => d.data.c === 'AUCTION').map(d => d.data.n);
        list = list.filter(d => !auctionItems.includes(d.data.n));
    }
    const chainRootName = state.tradeItemDataChain?.[0]?.name;
    const ttServiceWebData: TTServiceInventoryWebData = ttService.web?.inventory?.data?.value
    const ttServiceValueMap: { [name: string]: number } = ttServiceWebData?.reduce((p, c) => ({
        ...p, [c.name]: c.value + (p[c.name] ?? 0)
    }), { });
    return {
        [INVENTORY_TABULAR_OWNED]: {
            data: {
                ttService: {
                    featureEnabled: isFeatureEnabled(FEATURE_TT_SERVICE_TRADE_COLUMN, settings),
                    loadingSource: ttService.web?.inventory?.loading?.source,
                    loadingError: ttService.web?.inventory?.errors?.[0].message
                },
                chain: state.tradeItemDataChain
            },
            items: list.map(d => ({ ...d, t: {
                showingTradeItem: d.data.n === chainRootName,
                ttServiceValue: ttServiceValueMap?.[d.data.n]
            }})),
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
            return [true, true, true, hasChain && data?.ttService.featureEnabled, hasChain]
        },
        columnHeaderAfterName: (data?: InventoryTabularOwnedData) => [,,,
            data?.ttService.loadingSource ?
                { img: 'img/loading.gif', title: `Loading from ${data.ttService.loadingSource}`, class: 'img-tt-service-loading' } :
                [
                    ...data?.ttService.loadingError ? [{ img: 'img/error.png', title: data.ttService.loadingError, class: 'img-tt-service-error' }] : [],
                    { img: 'img/reload.png', title: 'Reload TT Service from sheet', class: 'img-tt-service-reload', dispatch: loadTTService }
                ]
        ],
        getRow: (g: ItemOwned): RowValue[] => {
            return [
                { // Name
                    dispatch: () => showTradingItemData(g.t?.showingTradeItem ? undefined : g.data.n, 0),
                    sub: [
                        g.c.hidden.any ?
                            { img: 'img/tick.png', title: 'Show this item name', dispatch: () => showByName(g.data.n), visible: g.c.hidden.name } :
                            { img: 'img/cross.png', title: 'Hide this item name', dispatch: () => hideByName(g.data.n) },
                        { text: g.data.n, class: g.t?.showingTradeItem && 'active' },
                        g.t?.showingTradeItem ?
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
                    g.t?.ttServiceValue !== undefined ? `${g.t.ttServiceValue.toFixed(2)} PED` : ''
                ], [ // Container
                    g.c.hidden.any ?
                        { img: 'img/tick.png', title: 'Show this container', dispatch: () => showByContainer(g.data.c), visible: g.c.hidden.container } :
                        { img: 'img/cross.png', title: 'Hide this container', dispatch: () => hideByContainer(g.data.c) },
                    g.data.c
                ]
            ]
        },
        getRowClass: (g: ItemOwned) => g.c.hidden.any ? 'hidden-item-row' : undefined,
        getRowForSort: (g: ItemOwned) => [g.data.n, Number(g.data.q), Number(g.data.v), g.t?.ttServiceValue ?? 0, g.data.c],
        getPedValue: (g: ItemOwned) => Number(g.data.v)
    }
}

export {
    inventoryTabularDefinitions,
    inventoryTabularData,
}
