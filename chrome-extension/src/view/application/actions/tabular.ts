import { SortColumnDefinition } from "../helpers/sort"
import { TabularState } from "../state/tabular"

const SET_TABULAR_STATE = '[tabular] set state'
const SET_TABULAR_EXPANDED = '[tabular] set expanded'
const SET_TABULAR_FILTER = '[tabular] set filter'
const SET_TABULAR_DATA = '[tabular] set data'
const SET_TABULAR_SORT_COLUMN_DEFINITION = '[tabular] set sort column definition'
const SORT_TABULAR_BY = '[tabular] sort by'

const setTabularState = (state: TabularState) => ({
    type: SET_TABULAR_STATE,
    payload: {
        state
    }
})

const setTabularExpanded = (selector: string) => (expanded: boolean) => ({
    type: SET_TABULAR_EXPANDED,
    payload: {
        selector,
        expanded
    }
})

const setTabularFilter = (selector: string) => (filter: string) => ({
    type: SET_TABULAR_FILTER,
    payload: {
        selector,
        filter
    }
})

const setTabularData = (selector: string, data: any[]) => ({
    type: SET_TABULAR_DATA,
    payload: {
        selector,
        data
    }
})

const setTabularSortColumnDefinition = (selector: string, sortColumnDefinition: Array<SortColumnDefinition<any>>) => ({
    type: SET_TABULAR_SORT_COLUMN_DEFINITION,
    payload: {
        selector,
        sortColumnDefinition
    }
})

const sortTabularBy = (selector: string) => (column: number) => ({
    type: SORT_TABULAR_BY,
    payload: {
        selector,
        column
    }
})

export {
    SET_TABULAR_STATE,
    SET_TABULAR_EXPANDED,
    SET_TABULAR_FILTER,
    SET_TABULAR_DATA,
    SET_TABULAR_SORT_COLUMN_DEFINITION,
    SORT_TABULAR_BY,
    setTabularState,
    setTabularExpanded,
    setTabularFilter,
    setTabularData,
    setTabularSortColumnDefinition,
    sortTabularBy,
}