import { TTServiceState, TTServiceStateWebData } from "../state/ttService"

const initialState: TTServiceState = { }

const reduceSetTTServicePartialWebData = (state: TTServiceState, change: Partial<TTServiceStateWebData>): TTServiceState => {
    return {
        ...state,
        web: {
            ...state.web,
            ...change
        }
    }
}

export {
    initialState,
    reduceSetTTServicePartialWebData,
}
