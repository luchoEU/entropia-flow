import { multiIncludes } from "../../../common/filter";
import { TabularDefinition, TabularDefinitions, TabularRawData, TabularState, TabularStateData } from "../state/tabular";
import { byTypeComparer, cloneAndSort, nextSortSecuence, SortColumnDefinition } from "./sort";

const initialState: TabularState = { }

const reduceSetTabularState = (state: TabularState, inState: TabularState): TabularState => inState

const reduceSetTabularExpanded = (state: TabularState, selector: string, expanded: boolean): TabularState => ({
    ...state,
    [selector]: {
        ...state[selector],
        expanded
    }
})

const reduceSetTabularFilter = (state: TabularState, selector: string, filter: string): TabularState => ({
    ...state,
    [selector]: _applyFilterAndSort(selector, {
        ...state[selector],
        filter
    })
})

const itemMatchesFilter = (d: any, selector: string, filter: string) =>
    _tabularDefinitions[selector].getRowForFilter(d, undefined).some((t: any) => t && typeof t === 'string' && multiIncludes(filter, t))

const _applyFilterAndSort = (selector: string, data: TabularStateData): TabularStateData => {
    const sortDefinition = _getTabularSortDefinition(selector);
    const filtered = data.items.all.filter(d => itemMatchesFilter(d, selector, data.filter));
    const show = cloneAndSort<any>(filtered, data.sortSecuence, sortDefinition);
    const pedSelector: (d: any) => number = _getTabularPedSelector(selector);  
    const sumPed = pedSelector && show.reduce((partialSum, item) => partialSum + pedSelector(item), 0);

    return {
        ...data,
        items: {
            ...data.items,
            show,
            stats: {
                count: show.length,
                ped: sumPed?.toFixed(2),
            }
        }
    }
}

const reduceSetTabularData = (state: TabularState, data: TabularRawData): TabularState => ({
    ...state,
    ...Object.fromEntries(Object.entries(data).map(([selector, raw]) => [selector,
        raw && _applyFilterAndSort(selector, {
            ...state[selector],
            data: raw.data,
            items: {
                ...state[selector]?.items,
                all: raw.items
            }
        })]))
})

const reduceSortTabularBy = (state: TabularState, selector: string, column: number): TabularState => {
    const sortSecuence = nextSortSecuence(state[selector].sortSecuence, column)
    return {
        ...state,
        [selector]: {
            ...state[selector],
            sortSecuence,
            items: {
                ...state[selector].items,
                show: cloneAndSort(state[selector].items.show, sortSecuence, _getTabularSortDefinition(selector))
            }
        }
    }
}

const _tabularDefinitions: TabularDefinitions = { }
const getTabularDefinition = (selector: string, data: any): TabularDefinition => {
    const d = _tabularDefinitions[selector]
    if (!d?.columnVisible)
        return d

    const isVisible = d.columnVisible(data)
    return {
        ...d,
        columnVisible: undefined,
        columns: d.columns.filter((_, i) => isVisible[i]),
        getRow: (item: any, index?: number) => d.getRow(item, index).filter((_, i) => isVisible[i]),
        getRowForSort: (item: any, index?: number) => d.getRowForSort(item, index).filter((_, i) => isVisible[i]),
        getRowForFilter: (item: any, index?: number) => d.getRowForFilter(item, index).filter((_, i) => isVisible[i])
    }
}

const setTabularDefinitions = (tabularDefinitions: TabularDefinitions) => {
    Object.entries(tabularDefinitions).forEach(([selector, definition]) => {
        _tabularDefinitions[selector] = definition.getRowForSort ? {
            ...definition,
            getRow: (d, rowIndex) => definition.getRow(d, rowIndex).map((v, colIndex) => {
                if (typeof v === 'string') {
                    const sv = definition.getRowForSort(d, rowIndex)[colIndex];
                    if (typeof sv === 'number')
                        return { text: v, style: { justifyContent: 'end' } }
                }
                return v
            }),
            getRowForSort: (d, rowIndex) => {
                const base = definition.getRow(d, rowIndex);
                const forSort = definition.getRowForSort(d, rowIndex);
                return base.map((v, colIndex) => forSort[colIndex] ?? v)
            }
        } : {
            ...definition,
            getRowForSort: definition.getRow
        }
        _tabularDefinitions[selector].getRowForFilter = definition.getRowForFilter ?
            (d, rowIndex) => {
                const base = _tabularDefinitions[selector].getRowForSort(d, rowIndex);
                const forFilter = definition.getRowForFilter(d, rowIndex);
                return base.map((v, colIndex) => forFilter[colIndex] ?? v)
            } : _tabularDefinitions[selector].getRowForSort;
    })
}

const _getTabularSortDefinition = <TItem extends any>(selector: string): Array<SortColumnDefinition<TItem>> => {
    const definition = _tabularDefinitions[selector]
    if (!definition) throw new Error(`Tabular definition for ${selector} not found`)
    return Array.from({ length: definition.columns.length }, (_, colIndex) => ({
        selector: d => definition.getRowForSort(d, undefined)[colIndex],
        comparer: definition.columnComparer?.[colIndex] ?? byTypeComparer
    }))
}

const _getTabularPedSelector = (selector: string): (d: any) => number =>
    _tabularDefinitions[selector]?.getPedValue

const _cleanForSaveData = (d: TabularStateData): TabularStateData => ({
    ...d,
    items: undefined,
})

const cleanForSave = (state: TabularState): TabularState =>
    Object.fromEntries(Object.entries(state).map(([selector, d]) => [selector, _cleanForSaveData(d)]))

export {
    initialState,
    cleanForSave,
    itemMatchesFilter,
    getTabularDefinition,
    setTabularDefinitions,
    reduceSetTabularState,
    reduceSetTabularExpanded,
    reduceSetTabularFilter,
    reduceSetTabularData,
    reduceSortTabularBy,
}
