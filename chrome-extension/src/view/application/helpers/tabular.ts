import { multiIncludes } from "../../../common/string";
import { TabularDefinition, TabularDefinitions, TabularState, TabularStateData } from "../state/tabular";
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

const _applyFilterAndSort = (selector: string, data: TabularStateData): TabularStateData => {
    const filtered = data.items.all.filter(d => multiIncludes(data.filter, JSON.stringify(d)));
    const show = cloneAndSort(filtered, data.sortSecuence, _getTabularSortDefinition(selector));
    return {
        ...data,
        items: {
            ...data.items,
            show,
            stats: {
                count: show.length,
            }
        }
    }
}

const reduceSetTabularData = (state: TabularState, selector: string, data: any[]): TabularState => ({
    ...state,
    [selector]: data && _applyFilterAndSort(selector, {
        ...state[selector],
        items: {
            ...state[selector]?.items,
            all: data
        }
    })
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
const getTabularDefinition = (selector: string): TabularDefinition => _tabularDefinitions[selector]
const setTabularDefinitions = (tabularDefinitions: TabularDefinitions) => {
    Object.entries(tabularDefinitions).forEach(([selector, definition]) => {
        _tabularDefinitions[selector] = definition.getRowForSort ? {
            ...definition,
            getRow: (d, i) => definition.getRow(d, i).map((v, j) => {
                if (typeof v === 'string') {
                    const sv = definition.getRowForSort(d, i)[j];
                    if (typeof sv === 'number')
                        return { text: v, style: { justifyContent: 'end' } }
                }
                return v
            })
        } : definition;
    })
}

const _getTabularSortDefinition = <TItem extends any>(selector: string): Array<SortColumnDefinition<TItem>> => {
    const definition = _tabularDefinitions[selector]
    if (!definition) throw new Error(`Tabular definition for ${selector} not found`)
    return Array.from({ length: definition.columns.length }, (_, i) => ({
        selector: d => definition.getRowForSort?.(d, i)[i] ?? definition.getRow(d, i)[i],
        comparer: definition.columnComparer?.[i] ?? byTypeComparer
    }))
}

const _cleanForSaveData = (d: TabularStateData): TabularStateData => ({
    ...d,
    items: undefined,
})

const cleanForSave = (state: TabularState): TabularState =>
    Object.fromEntries(Object.entries(state).map(([selector, d]) => [selector, _cleanForSaveData(d)]))

export {
    initialState,
    cleanForSave,
    getTabularDefinition,
    setTabularDefinitions,
    reduceSetTabularState,
    reduceSetTabularExpanded,
    reduceSetTabularFilter,
    reduceSetTabularData,
    reduceSortTabularBy,
}
