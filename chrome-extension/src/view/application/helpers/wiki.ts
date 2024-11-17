import { EntropiaWikiState } from "../state/wiki";

const initialState: EntropiaWikiState = {
    material: { }
}

const reduceSetEntropiaWikiState = (state: EntropiaWikiState, newState: EntropiaWikiState): EntropiaWikiState => newState

const reduceLoadEntropiaWikiMaterial = (state: EntropiaWikiState, name: string): EntropiaWikiState => ({
    ...state,
    material: {
        ...state.material,
        [name]: {
            loading: true
        }
    }
})

export {
    initialState,
    reduceSetEntropiaWikiState,
    reduceLoadEntropiaWikiMaterial,
}
