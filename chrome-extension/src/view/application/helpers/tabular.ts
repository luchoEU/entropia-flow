import { multiIncludes } from "../../../common/string";
import { TabularState, TabularStateData } from "../state/tabular";
import { cloneAndSort, nextSortSecuence, SortColumnDefinition } from "./sort";

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
    [selector]: _applyFilterAndSort({
        ...state[selector],
        filter
    })
})

const _applyFilterAndSort = (data: TabularStateData): TabularStateData => {
    const filtered = data.items.all.filter(d => multiIncludes(data.filter, JSON.stringify(d)));
    const show = cloneAndSort(filtered, data.sortSecuence, data.definition?.sort);
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
    [selector]: _applyFilterAndSort({
        ...state[selector],
        items: {
            ...state[selector]?.items,
            all: data
        }
    })
})

const reduceSetTabularSortColumnDefinition = (state: TabularState, selector: string, sortColumnDefinition: Array<SortColumnDefinition<any>>): TabularState => ({
    ...state,
    [selector]: {
        ...state[selector],
        items: {
            ...state[selector].items,
            show: cloneAndSort(state[selector].items.show, state[selector].sortSecuence, sortColumnDefinition)
        },
        definition: {
            sort: sortColumnDefinition
        }
    }
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
                show: cloneAndSort(state[selector].items.show, sortSecuence, state[selector].definition.sort)
            }
        }
    }
}

const _cleanForSaveData = (d: TabularStateData): TabularStateData => ({
    ...d,
    items: undefined,
    definition: undefined
})

const cleanForSave = (state: TabularState): TabularState =>
    Object.fromEntries(Object.entries(state).map(([selector, d]) => [selector, _cleanForSaveData(d)]))

export {
    initialState,
    cleanForSave,
    reduceSetTabularState,
    reduceSetTabularExpanded,
    reduceSetTabularFilter,
    reduceSetTabularData,
    reduceSetTabularSortColumnDefinition,
    reduceSortTabularBy,
}
