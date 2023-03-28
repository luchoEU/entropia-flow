import { STAGE_INITIALIZING } from "../../services/api/sheets/sheetsStages"
import { ActivesItem, ActivesState } from "../state/actives"

const initialState: ActivesState = {
    list: []
}

const startLoading = (state: ActivesState, loadingText: string): ActivesState => ({
    ...state,
    loading: {
        loadingText,
        stage: STAGE_INITIALIZING
    }
})

const setLoadingStage = (state: ActivesState, stage: number): ActivesState => ({
    ...state,
    loading: {
        ...state.loading,
        stage
    }
})

const endLoading = (state: ActivesState): ActivesState => ({
    ...state,
    loading: undefined
})

const setLoadingError = (state: ActivesState, text: string): ActivesState => ({
    ...state,
    loading: {
        ...state.loading,
        errorText: text
    }
})

const addActive = (state: ActivesState, row: number, type: string, quantity: string, opening: string, buyout: string, buyoutFee: string): ActivesState => ({
    ...state,
    list: [
        ...state.list,
        {
            row,
            date: (new Date()).getTime(),
            type,
            quantity,
            opening,
            buyout,
            buyoutFee,
        }
    ]
})

const setActives = (state: ActivesState, list: Array<ActivesItem>): ActivesState => ({
    ...state,
    list
})

const removeActive = (state: ActivesState, date: number) => ({
    ...state,
    list: state.list.filter(a => a.date !== date)
})

export {
    initialState,
    startLoading,
    setLoadingStage,
    endLoading,
    setLoadingError,
    addActive,
    setActives,
    removeActive,
}