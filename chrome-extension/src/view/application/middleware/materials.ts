import { mergeDeep } from "../../../common/merge"
import { CLEAR_WEB_ON_LOAD } from "../../../config"
import { loadFromWeb } from "../../../web/loader"
import { LOAD_ITEM_USAGE_DATA, LOAD_MATERIAL_DATA, LOAD_MATERIAL_RAW_MATERIALS, MATERIAL_BUY_AMOUNT_CHANGED, MATERIAL_BUY_MARKUP_CHANGED, MATERIAL_NOTES_VALUE_CHANGED, MATERIAL_ORDER_MARKUP_CHANGED, MATERIAL_ORDER_VALUE_CHANGED, MATERIAL_REFINE_AMOUNT_CHANGED, MATERIAL_USE_AMOUNT_CHANGED, SET_MATERIAL_PARTIAL_WEB_DATA, setMaterialPartialWebData, setMaterialsState } from "../actions/materials"
import { PAGE_LOADED } from "../actions/ui"
import { cleanForSaveCache, cleanForSaveMain, cleanWeb, initialState } from "../helpers/materials"
import { getMaterials } from "../selectors/materials"
import { MaterialsState } from "../state/materials"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            let state: MaterialsState = await api.storage.loadMaterials()
            if (state) {
                let stateCache: MaterialsState = await api.storage.loadMaterialsCache()
                if (stateCache) {
                    state = mergeDeep(state, stateCache)
                }
                if (CLEAR_WEB_ON_LOAD) {
                    state = cleanWeb(state)
                }
                dispatch(setMaterialsState(mergeDeep(initialState, state)))
            }
            break
        }
        case MATERIAL_BUY_MARKUP_CHANGED:
        case MATERIAL_ORDER_MARKUP_CHANGED:
        case MATERIAL_USE_AMOUNT_CHANGED:
        case MATERIAL_REFINE_AMOUNT_CHANGED:
        case MATERIAL_BUY_AMOUNT_CHANGED:
        case MATERIAL_ORDER_VALUE_CHANGED:
        case MATERIAL_NOTES_VALUE_CHANGED: {
            const state: MaterialsState = getMaterials(getState())
            await api.storage.saveMaterials(cleanForSaveMain(state))
            break
        }
        case SET_MATERIAL_PARTIAL_WEB_DATA: {
            const state: MaterialsState = getMaterials(getState())
            await api.storage.saveMaterialsCache(cleanForSaveCache(state))
            break
        }
    }

    switch (action.type) {
        case LOAD_MATERIAL_RAW_MATERIALS: {
            const materialName: string = action.payload.material
            for await (const r of loadFromWeb(s => s.loadRawMaterials(materialName))) {
                dispatch(setMaterialPartialWebData(materialName, { rawMaterials: r }))
            }
            break
        }
        case LOAD_MATERIAL_DATA: {
            const materialName: string = action.payload.material
            const materialUrl: string = action.payload.url
            for await (const r of loadFromWeb(s => s.loadMaterial(materialName, materialUrl))) {
                dispatch(setMaterialPartialWebData(materialName, { material: r }))
            }
            break
        }
        case LOAD_ITEM_USAGE_DATA: {
            const itemName: string = action.payload.item
            for await (const r of loadFromWeb(s => s.loadUsage(itemName))) {
                dispatch(setMaterialPartialWebData(itemName, { usage: r }))
            }
            break
        }
    }
}

export default [
    requests
]
