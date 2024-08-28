import { mergeDeep } from "../../../common/utils"
import { BudgetSheet, BudgetSheetGetInfo } from "../../services/api/sheets/sheetsBudget"
import { STAGE_INITIALIZING } from "../../services/api/sheets/sheetsStages"
import { DISABLE_BUDGET_ITEM, ENABLE_BUDGET_ITEM, REFRESH_BUDGET, SET_BUDGET_DISABLED_EXPANDED, SET_BUDGET_LIST_EXPANDED, SET_BUDGET_MATERIAL_EXPANDED, SET_BUDGET_MATERIAL_LIST_EXPANDED, SET_BUDGET_STAGE, setBudgetFromSheet, setBudgetStage, setBudgetState } from "../actions/budget"
import { PAGE_LOADED } from "../actions/ui"
import { cleanForSave, initialState } from "../helpers/budget"
import { getBudget } from "../selectors/budget"
import { getSettings } from "../selectors/settings"
import { BudgetItem, BudgetMaterialsMap, BudgetState } from "../state/budget"
import { SettingsState } from "../state/settings"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state: BudgetState = await api.storage.loadBudget()
            if (state)
                dispatch(setBudgetState(mergeDeep(initialState, state)))
            break
        }
        case SET_BUDGET_MATERIAL_LIST_EXPANDED:
        case SET_BUDGET_MATERIAL_EXPANDED:
        case SET_BUDGET_LIST_EXPANDED:
        case SET_BUDGET_DISABLED_EXPANDED:
        case ENABLE_BUDGET_ITEM:
        case DISABLE_BUDGET_ITEM: {
            const state: BudgetState = getBudget(getState())
            await api.storage.saveBudget(cleanForSave(state))
            break
        }
        case REFRESH_BUDGET: {     
            const settings: SettingsState = getSettings(getState())
            const budget: BudgetState = getBudget(getState())
            const map: BudgetMaterialsMap = { }
            const items: BudgetItem[] = []

            const setStage = (stage: number) => dispatch(setBudgetStage(stage))
            const list: string[] = await api.sheets.getBudgetSheetList(settings.sheet, setStage)

            let loaded = 0
            dispatch(setBudgetFromSheet(map, items, 0))
            for (const itemName of list) {
                if (budget.disabled.names.indexOf(itemName) != -1) continue

                const sheet: BudgetSheet = await api.sheets.loadBudgetSheet(settings.sheet, setStage, { itemName })
                const info: BudgetSheetGetInfo = await sheet.getInfo()

                for (const name of Object.keys(info.materials)) {
                    var m = info.materials[name]
                    if (m.current > 0 && name !== 'Blueprint' && name !== 'Item') {
                        if (map[name] === undefined) {
                            map[name] = {
                                expanded: false,
                                total: 0,
                                list: []
                            }
                        }
                        map[name].list.push({
                            itemName,
                            quantity: m.current
                        })
                        map[name].total += m.current
                    }
                }

                items.push({
                    name: itemName,
                    totalMU: info.totalMU,
                    total: info.total,
                    peds: info.peds
                })

                dispatch(setBudgetFromSheet(map, items, ++loaded / list.length * 100))
            }

            setStage(STAGE_INITIALIZING)
            break
        }
    }
}

export default [
    requests
]
