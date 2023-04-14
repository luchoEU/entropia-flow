import { mergeDeep } from "../../../common/utils"
import { BudgetSheet } from "../../services/api/sheets/sheetsBudget"
import { MATERIAL_BUY_MARKUP_CHANGED, SET_MATERIALS_STATE } from "../actions/materials"
import { refinedMaterialChanged, REFINED_BUY_MATERIAL, REFINED_MARKUP_CHANGED, REFINED_MATERIAL_CHANGED, REFINED_SELL, REFINED_VALUE_CHANGED, setRefinedState, SET_REFINED_EXPANDED, REFINED_ORDER_MATERIAL, REFINED_USE_MATERIAL, REFINED_REFINE_MATERIAL } from "../actions/refined"
import { PAGE_LOADED } from "../actions/ui"
import { cleanForSave, initialState } from "../helpers/refined"
import { getMaterialsMap } from "../selectors/materials"
import { getRefined } from "../selectors/refined"
import { getSettings } from "../selectors/settings"
import { MaterialsMap } from "../state/materials"
import { RefinedState } from "../state/refined"
import { SettingsState } from "../state/settings"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state: RefinedState = await api.storage.loadRefine()
            if (state)
                dispatch(setRefinedState(mergeDeep(initialState, state)))
            break
        }
        case SET_REFINED_EXPANDED:
        case REFINED_VALUE_CHANGED:
        case REFINED_MARKUP_CHANGED:
        case REFINED_MATERIAL_CHANGED:
        case REFINED_SELL:
        case REFINED_BUY_MATERIAL:
        case REFINED_ORDER_MATERIAL:
        case REFINED_USE_MATERIAL:
        case REFINED_REFINE_MATERIAL: {
            const state: RefinedState = getRefined(getState())
            await api.storage.saveRefine(cleanForSave(state))
            break
        }
        case SET_MATERIALS_STATE:
        case MATERIAL_BUY_MARKUP_CHANGED: {
            const m: MaterialsMap = getMaterialsMap(getState())
            dispatch(refinedMaterialChanged(m))
            break
        }
    }
    switch (action.type) {
        case REFINED_SELL: {
            const settings: SettingsState = getSettings(getState())
            //const setStage = (stage: number) => dispatch(setBudgetPageStage(bpName, stage))
            //const sheet: BudgetSheet = await api.sheets.loadBudgetSheet(settings.sheet, setStage, budgetInfoFromBp(bpInfo), action.type === START_BUDGET_PAGE_LOADING)
            break
        }
    }
}

export default [
    requests
]
