import { mergeDeep } from "../../../common/merge"
import { refinedMaterialChanged, REFINED_BUY_MATERIAL, REFINED_MARKUP_CHANGED, REFINED_MATERIAL_CHANGED, REFINED_VALUE_CHANGED, setRefinedState, REFINED_ORDER_MATERIAL, REFINED_USE_MATERIAL, REFINED_REFINE_MATERIAL } from "../actions/refined"
import { AppAction } from "../slice/app"
import { cleanForSave, initialState } from "../helpers/refined"
import { getRefined } from "../selectors/refined"
import { ItemsMap } from "../state/items"
import { RefinedState } from "../state/refined"
import { getDefaultStore } from 'jotai'
import { itemsMapAtom } from '../atoms/items'

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    const result = await next(action)
    switch (action.type) {
        case AppAction.INITIALIZE: {
            const state: RefinedState = await api.storage.loadRefined()
            if (state)
                dispatch(setRefinedState(mergeDeep(initialState, state)))
            break
        }
        case REFINED_VALUE_CHANGED:
        case REFINED_MARKUP_CHANGED:
        case REFINED_MATERIAL_CHANGED:
        case REFINED_BUY_MATERIAL:
        case REFINED_ORDER_MATERIAL:
        case REFINED_USE_MATERIAL:
        case REFINED_REFINE_MATERIAL: {
            const state: RefinedState = getRefined(getState())
            await api.storage.saveRefined(cleanForSave(state))
            break
        }
    }
    return result
}

export default [
    requests
]
