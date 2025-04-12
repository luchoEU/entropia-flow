import { SET_TT_SERVICE_PARTIAL_WEB_DATA } from "../actions/ttService"
import { initialState, reduceSetTTServicePartialWebData } from "../helpers/ttService"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_TT_SERVICE_PARTIAL_WEB_DATA: return reduceSetTTServicePartialWebData(state, action.payload.change)
        default: return state
    }
}
