import { mergeDeep } from "../../../common/utils"
import { BudgetMaterial, BudgetSheet } from "../../services/api/sheets/sheetsBudget"
import { STAGE_INITIALIZING } from "../../services/api/sheets/sheetsStages"
import { MATERIAL_BUY_AMOUNT_CHANGED, MATERIAL_BUY_MARKUP_CHANGED, MATERIAL_ORDER_MARKUP_CHANGED, MATERIAL_ORDER_VALUE_CHANGED, MATERIAL_REFINE_AMOUNT_CHANGED, MATERIAL_USE_AMOUNT_CHANGED, REFRESH_MATERIAL_CRAFT_BUDGET, SET_MATERIAL_CRAFT_BUDGET_STAGE, SET_MATERIAL_CRAFT_EXPANDED, SET_MATERIAL_CRAFT_LIST_EXPANDED, setMaterialCraftBudgetStage, setMaterialsCraftMap, setMaterialsState } from "../actions/materials"
import { PAGE_LOADED } from "../actions/ui"
import { cleanForSave, initialState } from "../helpers/materials"
import { getMaterials } from "../selectors/materials"
import { getSettings } from "../selectors/settings"
import { MaterialsCraftMap, MaterialsState } from "../state/materials"
import { SettingsState } from "../state/settings"

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
        case SET_MATERIAL_CRAFT_LIST_EXPANDED:
        case SET_MATERIAL_CRAFT_EXPANDED:
        case SET_MATERIAL_CRAFT_BUDGET_STAGE: {
            const state: MaterialsState = getMaterials(getState())
            await api.storage.saveMaterials(cleanForSave(state))
            break
        }
        case REFRESH_MATERIAL_CRAFT_BUDGET: {            
            const settings: SettingsState = getSettings(getState())
            const map: MaterialsCraftMap = { }

            const setStage = (stage: number) => dispatch(setMaterialCraftBudgetStage(stage))
            const list: string[] = await api.sheets.getBudgetSheetList(settings.sheet, setStage)           
            for (const itemName of list) {
                const sheet: BudgetSheet = await api.sheets.loadBudgetSheet(settings.sheet, setStage, { itemName })
                const materials: BudgetMaterial[] = await sheet.getMaterials()

                for (const m of materials) {
                    if (m.quantity > 0 && m.name !== 'Blueprint' && m.name !== 'Item') {
                        if (map[m.name] === undefined) {
                            map[m.name] = {
                                expanded: false,
                                total: 0,
                                list: []
                            }
                        }
                        map[m.name].list.push({
                            itemName,
                            quantity: m.quantity
                        })
                        map[m.name].total += m.quantity
                    }
                }
                dispatch(setMaterialsCraftMap(map))
            }

            setStage(STAGE_INITIALIZING)
            break
        }
    }
}

export default [
    requests
]
