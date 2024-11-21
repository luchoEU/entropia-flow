import { mergeDeep } from "../../../common/merge"
import { filterExact, filterOr } from "../../../common/string"
import { RawMaterialWebData, WebSources } from "../../../web/sources"
import { setByStoreCraftFilter } from "../actions/inventory"
import { LOAD_MATERIAL_RAW_MATERIALS, MATERIAL_BUY_AMOUNT_CHANGED, MATERIAL_BUY_MARKUP_CHANGED, MATERIAL_ORDER_MARKUP_CHANGED, MATERIAL_ORDER_VALUE_CHANGED, MATERIAL_REFINE_AMOUNT_CHANGED, MATERIAL_SET_WEB_DATA, MATERIAL_USE_AMOUNT_CHANGED, materialSetWebData, setMaterialsState } from "../actions/materials"
import { PAGE_LOADED } from "../actions/ui"
import { cleanForSave, initialState } from "../helpers/materials"
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
        case MATERIAL_BUY_MARKUP_CHANGED:
        case MATERIAL_ORDER_MARKUP_CHANGED:
        case MATERIAL_USE_AMOUNT_CHANGED:
        case MATERIAL_REFINE_AMOUNT_CHANGED:
        case MATERIAL_BUY_AMOUNT_CHANGED:
        case MATERIAL_ORDER_VALUE_CHANGED:
        case MATERIAL_SET_WEB_DATA: {
            const state: MaterialsState = getMaterials(getState())
            await api.storage.saveMaterials(cleanForSave(state))
            break
        }
    }

    switch (action.type) {
        case MATERIAL_SET_WEB_DATA: {
            const materialName: string = action.payload.material
            const rawMaterials: RawMaterialWebData[] = action.payload.data?.rawMaterials
            dispatch(setByStoreCraftFilter(filterExact(
                rawMaterials ?
                    filterOr([ materialName, ...rawMaterials.map(m => m.name) ]) :
                    materialName)))
            break;
        }
        case LOAD_MATERIAL_RAW_MATERIALS: {
            const material: string = action.payload.material
            let errors: string[] = [];
            for (const source of WebSources) {
                dispatch(materialSetWebData(action.payload.material, { loading: { source: source.name } }))
                const response = await source.loadRawMaterials(material)
                if (response.ok) {
                    errors = undefined
                    dispatch(materialSetWebData(action.payload.material, { rawMaterials: response.data }))
                    break
                } else {
                    errors.push(`Error loading from ${source.name}. ${response.errorText}.`)
                }
            }
            if (errors) {
                dispatch(materialSetWebData(action.payload.material, { errors: errors.map(message => ({ message })) }))
            }
            break
        }
    }
}

export default [
    requests
]
