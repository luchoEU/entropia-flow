import { LOAD_ENTROPIA_WIKI_MATERIAL, SET_ENTROPIA_WIKI_STATE } from "../actions/wiki"
import { initialState, reduceLoadEntropiaWikiMaterial, reduceSetEntropiaWikiState } from "../helpers/wiki"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_ENTROPIA_WIKI_STATE: return reduceSetEntropiaWikiState(state, action.payload.state)
        case LOAD_ENTROPIA_WIKI_MATERIAL: return reduceLoadEntropiaWikiMaterial(state, action.payload.name)
        default: return state
    }
}
