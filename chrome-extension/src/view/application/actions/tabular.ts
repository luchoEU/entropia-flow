import { TabularRawData, TabularState } from "../state/tabular"

const SET_TABULAR_STATE = '[tabular] set state'
const SET_TABULAR_FILTER = '[tabular] set filter'
const SET_TABULAR_DATA = '[tabular] set data'
const SORT_TABULAR_BY = '[tabular] sort by'

const setTabularState = (state: TabularState) => ({
    type: SET_TABULAR_STATE,
    payload: {
        state
    }
})

const setTabularFilter = (selector: string) => (filter: string) => ({
    type: SET_TABULAR_FILTER,
    payload: {
        selector,
        filter
    }
})

const setTabularData = (data: TabularRawData) => ({
    type: SET_TABULAR_DATA,
    payload: {
        data
    }
})

const sortTabularBy = (selector: string, column: number) => ({
    type: SORT_TABULAR_BY,
    payload: {
        selector,
        column
    }
})

export {
    SET_TABULAR_STATE,
    SET_TABULAR_FILTER,
    SET_TABULAR_DATA,
    SORT_TABULAR_BY,
    setTabularState,
    setTabularFilter,
    setTabularData,
    sortTabularBy,
}
