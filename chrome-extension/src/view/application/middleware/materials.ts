import { mergeDeep } from "../../../common/utils"
import { MATERIAL_MARKUP_CHANGED, setMaterialsState } from "../actions/materials"
import { PAGE_LOADED } from "../actions/ui"
import { initialState } from "../helpers/materials"
import { getMaterials } from "../selectors/materials"
import { MaterialsState } from "../state/materials"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state: MaterialsState = await api.storage.loadMaterials()
            if (state)
                dispatch(setMaterialsState(mergeDeep(initialState, state)))
            break
        }
        case MATERIAL_MARKUP_CHANGED: {
            const state: MaterialsState = getMaterials(getState())
            await api.storage.saveMaterials(state)
            break
        }
    }
}

export default [
    requests
]
