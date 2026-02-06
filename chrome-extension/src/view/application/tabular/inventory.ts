import { RowValue } from "../../components/common/SortableTabularSection.data";
import { setTabularFilterAtom } from "../atoms/tabular";
import { loadTTServiceAtom } from "../atoms/inventory";
import { INVENTORY_TABULAR_OWNED, InventoryState, ItemOwned, TradeItemData } from "../state/inventory";
import { ItemsMap, ItemState } from "../state/items";
import { Feature, isFeatureEnabled, SettingsState } from "../state/settings";
import { TabularDefinitions, TabularRawData } from "../state/tabular";
import { TTServiceInventoryWebData, TTServiceState } from "../state/ttService";
import { getDefaultStore } from 'jotai';
import { hideByNameAtom, showByNameAtom, hideByValueAtom, showByValueAtom, hideByContainerAtom, showByContainerAtom } from "../atoms/inventory";

interface InventoryTabularOwnedData {
    ttService: {
        featureEnabled: boolean,
        loadingSource?: string,
        loadingError?: string
    },
    chain: TradeItemData[],
    reserve: boolean
}

const inventoryTabularData = (state: InventoryState, settings: SettingsState, items: ItemsMap, ttService: TTServiceState): TabularRawData<ItemOwned, InventoryTabularOwnedData> => {
    let list: ItemOwned[] = state.owned.hideCriteria.show ? state.owned.items : state.owned.items.filter(d => !d.c.hidden.any);
    if (state.owned.options.reserve) {
        list = list.map(d => {
            const m: ItemState = items[d.data.n];
            if (!m || !m.reserveAmount) return d;
            const reserve: number = parseFloat(m.reserveAmount);
            if (isNaN(reserve)) return d;
            const unitValue = m.web?.item?.data?.value.value
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
                    featureEnabled: isFeatureEnabled(settings, Feature.ttService),
                    loadingSource: ttService.web?.inventory?.loading?.source,
                    loadingError: ttService.web?.inventory?.errors?.[0].message
                },
                chain: state.tradeItemDataChain,
                reserve: state.owned.options.reserve ?? false
            },
            items: list.map(d => {
                const m: ItemState = items[d.data.n];
                return {
                    ...d, t: {
                        showingTradeItem: d.data.n === chainRootName,
                        reserveAmount: m?.reserveAmount ? parseFloat(m.reserveAmount) : undefined,
                        ttServiceValue: ttServiceValueMap?.[d.data.n]
                    }
                };
            }),
        },
    }
}

const inventoryTabularDefinitions: TabularDefinitions = {
    [INVENTORY_TABULAR_OWNED]: {
        title: 'Owned List',
        subtitle: 'List of the Items you own, excluding hidden ones',
        columns: ['Name', 'Quantity', 'Value', 'Reserve', 'TT Service', 'Container'],
        columnVisible: (items: ItemOwned[] = [], data?: InventoryTabularOwnedData) => {
            const chainRootName = data?.chain?.[0]?.name;
            const hasChain = !chainRootName || !items.some(g => g.data.n === chainRootName);
            return [true, true, true, hasChain && data?.reserve, hasChain && data?.ttService.featureEnabled, hasChain]
        },
        columnHeaderAfterName: (data?: InventoryTabularOwnedData) => [, , , , ,
            data?.ttService.loadingSource ?
                { img: 'img/loading.gif', title: `Loading from ${data.ttService.loadingSource}`, class: 'img-tt-service-loading' } :
                [
                    ...(data?.ttService.loadingError ? [{ img: 'img/error.png', title: data.ttService.loadingError, class: 'img-tt-service-error' }] : []),
                    { img: 'img/reload.png', title: 'Reload TT Service from sheet', class: 'img-tt-service-reload', dispatch: () => getDefaultStore().set(loadTTServiceAtom) }
                ]
        ],
        getRow: (g: ItemOwned, index: number, data?: InventoryTabularOwnedData): RowValue[] => {
            const jotaiStore = getDefaultStore()
            return [
                { // Name
                    // Use Jotai write atoms for showing trade item details
                    dispatch: () => { /* showTradingItemData handler - in separate atom */ },
                    sub: [
                        g.c.hidden.any ?
                            { img: 'img/tick.png', title: 'Show this item name', dispatch: () => jotaiStore.set(showByNameAtom, g.data.n), visible: g.c.hidden.name } :
                            { img: 'img/cross.png', title: 'Hide this item name', dispatch: () => jotaiStore.set(hideByNameAtom, g.data.n) },
                        { text: g.data.n, class: g.t?.showingTradeItem && 'active' },
                        g.t?.showingTradeItem ?
                            { img: 'img/left.png', title: 'Hide item details', show: true } :
                            { img: 'img/right.png', title: 'Show item details' },
                        { flex: 1 },
                        { img: 'img/find.png', title: 'Search by this item name', dispatch: () => jotaiStore.set(setTabularFilterAtom, INVENTORY_TABULAR_OWNED, `!${g.data.n}`) }
                    ]
                },
                g.data.q, // Quantity
                [ // Value
                    g.c.hidden.any ?
                        { img: 'img/tick.png', title: 'Show this value or higher', dispatch: () => jotaiStore.set(showByValueAtom), visible: g.c.hidden.value } :
                        { img: 'img/cross.png', title: 'Hide this value or lower', dispatch: () => jotaiStore.set(hideByValueAtom, Number(g.data.v)) },
                    g.data.v + ' PED'
                ], [ // Reserve
                    g.t?.reserveAmount !== undefined ? `${g.t.reserveAmount.toFixed(2)} PED` : ''
                ], [ // TT Service
                    g.t?.ttServiceValue !== undefined ? `${g.t.ttServiceValue.toFixed(2)} PED` : ''
                ], [ // Container
                    g.c.hidden.any ?
                        { img: 'img/tick.png', title: 'Show this container', dispatch: () => jotaiStore.set(showByContainerAtom, g.data.c), visible: g.c.hidden.container } :
                        { img: 'img/cross.png', title: 'Hide this container', dispatch: () => jotaiStore.set(hideByContainerAtom, g.data.c) },
                    g.data.c
                ]
            ]
        },
        getRowClass: (g: ItemOwned) => g.c.hidden.any ? 'hidden-item-row' : undefined,
        getRowForSort: (g: ItemOwned) => [g.data.n, Number(g.data.q), Number(g.data.v), g.t?.reserveAmount ?? 0, g.t?.ttServiceValue ?? 0, g.data.c],
        getPedValue: (g: ItemOwned) => Number(g.data.v)
    }
}

export {
    inventoryTabularDefinitions,
    inventoryTabularData,
}
