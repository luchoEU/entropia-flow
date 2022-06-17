import { ACTIVES_ITEM, ACTIVES_STATE, STAGE_INITIALIZING } from "../state/actives"

const initialState: ACTIVES_STATE = {
    list: []
}

const startLoading = (state: ACTIVES_STATE, loadingText: string): ACTIVES_STATE => ({
    ...state,
    loading: {
        loadingText,
        stage: STAGE_INITIALIZING
    }
})

const setLoadingStage = (state: ACTIVES_STATE, stage: number): ACTIVES_STATE => ({
    ...state,
    loading: {
        ...state.loading,
        stage
    }
})

const endLoading = (state: ACTIVES_STATE): ACTIVES_STATE => ({
    ...state,
    loading: undefined
})

const setLoadingError = (state: ACTIVES_STATE, text: string): ACTIVES_STATE => ({
    ...state,
    loading: {
        ...state.loading,
        errorText: text
    }
})

const addActive = (state: ACTIVES_STATE, row: number, operation: number, type: string, quantity: string, opening: string, buyout: string, buyoutFee: string): ACTIVES_STATE => ({
    ...state,
    list: [
        ...state.list,
        {
            row,
            date: (new Date()).getTime(),
            operation,
            type,
            quantity,
            opening,
            buyout,
            buyoutFee,
            pending: false
        }
    ]
})

const setActives = (state: ACTIVES_STATE, list: Array<ACTIVES_ITEM>): ACTIVES_STATE => ({
    ...state,
    list
})

const removeActive = (state: ACTIVES_STATE, date: number) => ({
    ...state,
    list: state.list.filter(a => a.date !== date)
})

const soldActive = (state: ACTIVES_STATE, date: number) => ({
    ...state,
    list: state.list.map(a => a.date === date ? { ...a, pending: true } : a)
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
    soldActive
}