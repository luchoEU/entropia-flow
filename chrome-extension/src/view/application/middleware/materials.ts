import { mergeDeep } from "../../../common/utils"
import { setMaterialsState } from "../actions/materials"
import { PAGE_LOADED } from "../actions/ui"
import { initialState } from "../helpers/materials"
import { MaterialsState } from "../state/materials"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state: MaterialsState = await api.storage.loadMaterials()
            if (state)
                dispatch(setMaterialsState(mergeDeep(state, initialState)))
            break
        }
    }
}

export default [
    requests
]
