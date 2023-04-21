import { ActivesItem } from "../state/actives"

const START_LOADING = '[act] start loading'
const SET_LOADING_STAGE = '[act] set loading stage'
const END_LOADING = '[act] end loading'
const ERROR_LOADING = '[act] error loading'
const ADD_ACTIVE = '[act] add sale'
const SET_ACTIVES = '[act] set actives'
const REMOVE_ACTIVE = '[act] remove active'

const startLoading = (loadingText: string) => ({
    type: START_LOADING,
    payload: {
        loadingText
    }
})

const setLoadingStage = (stage: number) => ({
    type: SET_LOADING_STAGE,
    payload: {
        stage
    }
})

const endLoading = {
    type: END_LOADING
}

const setLoadingError = (text: string) => ({
    type: ERROR_LOADING,
    payload: {
        text
    }
})

const addActive = (row: number, title: string, material: string, quantity: string, opening: string, openingFee: string, buyout: string, buyoutFee: string) => ({
    type: ADD_ACTIVE,
    payload: {
        row,
        title,
        material,
        quantity,
        opening,
        openingFee,
        buyout,
        buyoutFee,
    }
})

const setActives = (list: Array<ActivesItem>) => ({
    type: SET_ACTIVES,
    payload: {
        list
    }
})

const removeActive = (row: number, date: number) => ({
    type: REMOVE_ACTIVE,
    payload: {
        date
    }
})

export {
    START_LOADING,
    SET_LOADING_STAGE,
    END_LOADING,
    ERROR_LOADING,
    ADD_ACTIVE,
    SET_ACTIVES,
    REMOVE_ACTIVE,
    startLoading,
    setLoadingStage,
    endLoading,
    setLoadingError,
    addActive,
    setActives,
    removeActive
}