import { ItemData } from '../../../common/state'
import { trace, traceData } from '../../../common/trace'
import { BudgetSheet, BudgetSheetInfo } from '../../services/api/sheets/sheetsBudget'
import { addBlueprintData, ADD_BLUEPRINT, ADD_BLUEPRINT_DATA, doneCraftingSession, DONE_CRAFT_SESSION, endBudgetPageLoading, END_BUDGET_PAGE_LOADING, END_CRAFT_SESSION, errorCraftingSession, ERROR_BUDGET_PAGE_LOADING, ERROR_CRAFT_SESSION, readyCraftingSession, READY_CRAFT_SESSION, REMOVE_BLUEPRINT, saveCraftingSession, SAVE_CRAFT_SESSION, setBlueprintQuantity, setBudgetPageInfo, setBudgetPageLoadingError, setBudgetPageStage, setCraftingSessionStage, setCraftState, SET_BLUEPRINT_EXPANDED, SET_BLUEPRINT_QUANTITY, SET_BUDGET_PAGE_INFO, SET_BUDGET_PAGE_LOADING_STAGE, SET_CRAFT_SAVE_STAGE, START_BUDGET_PAGE_LOADING, START_CRAFT_SESSION } from '../actions/craft'
import { SET_HISTORY_LIST } from '../actions/history'
import { SET_CURRENT_INVENTORY } from '../actions/inventory'
import { refresh, setLast } from '../actions/messages'
import { PAGE_LOADED } from '../actions/ui'
import { initialState } from '../helpers/craft'
import { joinDuplicates, joinList } from '../helpers/inventory'
import { getCraft } from '../selectors/craft'
import { getHistory } from '../selectors/history'
import { getInventory } from '../selectors/inventory'
import { getSettings } from '../selectors/settings'
import { BluprintWebData, CraftState, STEP_INACTIVE, STEP_REFRESH_TO_END, STEP_REFRESH_TO_START } from '../state/craft'
import { HistoryState } from '../state/history'
import { InventoryState } from '../state/inventory'
import { SettingsState } from '../state/settings'

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state: CraftState = await api.storage.loadCraft()
            if (state)
                dispatch(setCraftState({ ...initialState, ...state }))
            break
        }
        case ADD_BLUEPRINT:
        case REMOVE_BLUEPRINT:
        case ADD_BLUEPRINT_DATA:
        case SET_BLUEPRINT_QUANTITY:
        case SET_BLUEPRINT_EXPANDED:
        case START_BUDGET_PAGE_LOADING:
        case SET_BUDGET_PAGE_LOADING_STAGE:
        case SET_BUDGET_PAGE_INFO:
        case END_BUDGET_PAGE_LOADING:
        case ERROR_BUDGET_PAGE_LOADING:
        case START_CRAFT_SESSION:
        case END_CRAFT_SESSION:
        case ERROR_CRAFT_SESSION:
        case READY_CRAFT_SESSION:
        case SET_CRAFT_SAVE_STAGE:
        case DONE_CRAFT_SESSION: {
            const state = getCraft(getState())
            await api.storage.saveCraft(state)
            break
        }
    }
    if (action.type === ADD_BLUEPRINT) {
            let name = action.payload.name.replaceAll(' ','%20')
            let url = `https://apps5.genexus.com/entropia-flow-helper/rest/BlueprintInfo?name=${name}`
            let response = await fetch(url)
            let data: BluprintWebData = await response.json()
            if (data.StatusCode === 0) {
                if (data.Name.endsWith('(L)')) {
                    data.Material.unshift({
                        Name: 'Blueprint',
                        Quantity: 1,
                        Type: 'Blueprint',
                        Value: '0.01'
                    })
                }
                data.Material.unshift({
                    Name: 'Item',
                    Quantity: 0,
                    Type: 'Crafted item',
                    Value: data.ItemValue
                })
                if (data.Material.some(m => m.Type === 'Refined Ore')) {
                    data.Material.push({
                        Name: 'Metal Residue',
                        Quantity: 0,
                        Type: 'Residue',
                        Value: '0.01'
                    })
                }
                if (data.Material.some(m => m.Type === 'Refined Enmatter')) {
                    data.Material.push({
                        Name: 'Energy Matter Residue',
                        Quantity: 0,
                        Type: 'Residue',
                        Value: '0.01'
                    })
                }
                data.Material.push({
                    Name: 'Shrapnel',
                    Quantity: 0,
                    Type: 'Fragment',
                    Value: '0.0001'
                })
            }
            dispatch(addBlueprintData(data))            
    }
    switch (action.type) {
        case ADD_BLUEPRINT:
        case SET_CURRENT_INVENTORY: {
            let s: InventoryState = getInventory(getState())
            let items = joinDuplicates(joinList(s))
            let dictionary: { [k: string]: number } = Object.fromEntries(items.map((x: ItemData) => [x.n, Number(x.q)]));
            dispatch(setBlueprintQuantity(dictionary))
            break
        }
        case START_BUDGET_PAGE_LOADING: {
            try {
                const state: CraftState = getCraft(getState())
                const settings: SettingsState = getSettings(getState())
                const bpInfo = state.blueprints.find(bp => bp.name == action.payload.name)

                const setStage = (stage: number) => dispatch(setBudgetPageStage(action.payload.name, stage))
                const sheet: BudgetSheet = await api.sheets.loadBudgetSheet(settings.sheet, bpInfo, setStage)
                await sheet.save()

                const info: BudgetSheetInfo = await sheet.getInfo()
                dispatch(setBudgetPageInfo(action.payload.name, info))
            } catch (e) {
                dispatch(setBudgetPageLoadingError(action.payload.name, e.message))
                trace('exception creating budget sheet:')
                traceData(e)
            } finally {
                dispatch(endBudgetPageLoading(action.payload.name))
            }
            break
        }
        case START_CRAFT_SESSION:
        case END_CRAFT_SESSION: {
            dispatch(refresh)
            break
        }
        case SET_HISTORY_LIST: {
            const craft: CraftState = getCraft(getState())
            const history: HistoryState = getHistory(getState())
            if (craft.activeSession !== undefined && history.list.length > 0) {
                switch (craft.activeSession.session.step) {
                    case STEP_REFRESH_TO_START: {
                        if (history.list[0].class === 'error') {
                            dispatch(errorCraftingSession(craft.activeSession.name, history.list[0].text))
                        } else if (history.list[0].isLast) {
                            dispatch(readyCraftingSession(craft.activeSession.name))
                        } else {
                            dispatch(setLast)
                        }
                        break
                    }
                    case STEP_REFRESH_TO_END: {
                        if (history.list[0].class !== 'error') {
                            dispatch(saveCraftingSession(craft.activeSession.name))
                        }
                        break
                    }
                }
            }
            break
        }
        case SAVE_CRAFT_SESSION: {
            const state: CraftState = getCraft(getState())
            const settings: SettingsState = getSettings(getState())
            const setStage = (stage: number) => dispatch(setCraftingSessionStage(action.payload.name, stage))
            const sheet: BudgetSheet = await api.sheets.loadBudgetSheet(settings.sheet, state.activeSession, setStage)
            await sheet.addCraftSession()
            await sheet.save()
            dispatch(doneCraftingSession(state.activeSession.name))
            break
        }
    }
}

export default [
    requests
]