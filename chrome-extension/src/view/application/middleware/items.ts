import { mergeDeep } from "../../../common/merge"
import { CLEAR_WEB_ON_LOAD } from "../../../config"
import { loadFromWeb } from "../../../web/loader"
import { BlueprintWebMaterial } from "../../../web/state"
import { LOAD_ITEM_USAGE_DATA, LOAD_ITEM_DATA, LOAD_ITEM_RAW_MATERIALS, ITEM_BUY_AMOUNT_CHANGED, ITEM_BUY_MARKUP_CHANGED, ITEM_NOTES_VALUE_CHANGED, ITEM_ORDER_MARKUP_CHANGED, ITEM_ORDER_VALUE_CHANGED, ITEM_REFINE_AMOUNT_CHANGED, ITEM_RESERVE_VALUE_CHANGED, ITEM_USE_AMOUNT_CHANGED, SET_ITEM_CALCULATOR_QUANTITY, SET_ITEM_CALCULATOR_TOTAL, SET_ITEM_CALCULATOR_TOTAL_MU, SET_ITEM_MARKUP_UNIT, SET_ITEM_PARTIAL_WEB_DATA, setItemPartialWebData, setItemsState, START_MATERIAL_EDIT_MODE, END_MATERIAL_EDIT_MODE, CHANGE_MATERIAL_VALUE, CHANGE_MATERIAL_TYPE, setMaterialSuggestedTypes } from "../actions/items"
import { AppAction } from "../slice/app"
import { cleanForSaveCache, cleanForSaveMain, cleanWeb, initialState } from "../helpers/items"
import { getItems, getItemsMap } from "../selectors/items"
import { ItemsState } from "../state/items"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    await next(action)
    switch (action.type) {
        case AppAction.INITIALIZE: {
            let state: ItemsState = await api.storage.loadItems()
            if (state) {
                let stateCache: ItemsState = await api.storage.loadItemsCache()
                if (stateCache) {
                    state = mergeDeep(state, stateCache)
                }
                if (CLEAR_WEB_ON_LOAD) {
                    state = cleanWeb(state)
                }
                dispatch(setItemsState(mergeDeep(initialState, state)))
            }
            break
        }
        case ITEM_BUY_MARKUP_CHANGED:
        case ITEM_ORDER_MARKUP_CHANGED:
        case ITEM_USE_AMOUNT_CHANGED:
        case ITEM_REFINE_AMOUNT_CHANGED:
        case ITEM_BUY_AMOUNT_CHANGED:
        case ITEM_ORDER_VALUE_CHANGED:
        case ITEM_NOTES_VALUE_CHANGED:
        case ITEM_RESERVE_VALUE_CHANGED:
        case SET_ITEM_MARKUP_UNIT:
        case SET_ITEM_CALCULATOR_QUANTITY:
        case SET_ITEM_CALCULATOR_TOTAL:
        case SET_ITEM_CALCULATOR_TOTAL_MU:
        case START_MATERIAL_EDIT_MODE:
        case END_MATERIAL_EDIT_MODE:
        case CHANGE_MATERIAL_TYPE:
        case CHANGE_MATERIAL_VALUE: {
            const state: ItemsState = getItems(getState())
            await api.storage.saveItems(cleanForSaveMain(state))
            break
        }
        case SET_ITEM_PARTIAL_WEB_DATA: {
            const state: ItemsState = getItems(getState())
            await api.storage.saveItemsCache(cleanForSaveCache(state))
            break
        }
    }

    switch (action.type) {
        case CHANGE_MATERIAL_TYPE: {
            const itemName: string = action.payload.item
            const type: string = action.payload.type
            const map = getItemsMap(getState())
            const list = Array.from(new Set(Object.values(map).map(m => m.web?.item?.data?.value.type.toString()).filter(t => t)))
                .filter(t => t.startsWith(type)).sort()
            dispatch(setMaterialSuggestedTypes(itemName, list))
            break
        }
        case LOAD_ITEM_RAW_MATERIALS: {
            const itemName: string = action.payload.item
            for await (const r of loadFromWeb(s => s.loadRawMaterials(itemName))) {
                dispatch(setItemPartialWebData(itemName, { rawMaterials: r }))
            }
            break
        }
        case LOAD_ITEM_DATA: {
            const itemName: string = action.payload.item
            const bpMaterial: BlueprintWebMaterial = action.payload.bpMaterial
            for await (const r of loadFromWeb(s => s.loadItem(itemName, bpMaterial))) {
                dispatch(setItemPartialWebData(itemName, { item: r }))
            }
            break
        }
        case LOAD_ITEM_USAGE_DATA: {
            const itemName: string = action.payload.item
            for await (const r of loadFromWeb(s => s.loadUsage(itemName))) {
                dispatch(setItemPartialWebData(itemName, { usage: r }))
            }
            break
        }
    }
}

export default [
    requests
]
