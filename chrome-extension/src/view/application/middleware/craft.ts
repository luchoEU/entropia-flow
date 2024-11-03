import { ItemData } from '../../../common/state'
import { trace, traceData } from '../../../common/trace'
import { mergeDeep } from '../../../common/merge'
import { BudgetLineData, BudgetSheet, BudgetSheetGetInfo } from '../../services/api/sheets/sheetsBudget'
import { addBlueprintData, ADD_BLUEPRINT_DATA, BUDGET_MOVE, BUDGET_SELL, BUY_BUDGET_PAGE_MATERIAL, BUY_BUDGET_PAGE_MATERIAL_CLEAR, BUY_BUDGET_PAGE_MATERIAL_DONE, CHANGE_BUDGET_PAGE_BUY_COST, CHANGE_BUDGET_PAGE_BUY_FEE, clearBuyBudget, CLEAR_CRAFT_SESSION, doneBuyBudget, doneCraftingSession, DONE_CRAFT_SESSION, endBudgetPageLoading, END_BUDGET_PAGE_LOADING, END_CRAFT_SESSION, errorCraftingSession, ERROR_BUDGET_PAGE_LOADING, ERROR_CRAFT_SESSION, MOVE_ALL_BUDGET_PAGE_MATERIAL, readyCraftingSession, READY_CRAFT_SESSION, REMOVE_BLUEPRINT, saveCraftingSession, SAVE_CRAFT_SESSION, setBlueprintQuantity, setBudgetPageInfo, setBudgetPageLoadingError, setBudgetPageStage, setCraftingSessionStage, setCraftState, setNewCraftingSessionDiff, SET_STARED_BLUEPRINTS_EXPANDED, SET_BLUEPRINT_EXPANDED, SET_BLUEPRINT_QUANTITY, SET_BUDGET_PAGE_INFO, SET_BUDGET_PAGE_LOADING_STAGE, SET_CRAFT_SAVE_STAGE, SET_NEW_CRAFT_SESSION_DIFF, SORT_BLUEPRINTS_BY, START_BUDGET_PAGE_LOADING, START_CRAFT_SESSION, RELOAD_BLUEPRINT, removeBlueprint, SET_STARED_BLUEPRINTS_FILTER, SHOW_BLUEPRINT_MATERIAL_DATA, addBlueprintLoading, ADD_BLUEPRINT_LOADING, SET_BLUEPRINT_STARED, setBlueprintActivePage, SET_BLUEPRINT_ACTIVE_PAGE } from '../actions/craft'
import { SET_HISTORY_LIST } from '../actions/history'
import { SET_CURRENT_INVENTORY } from '../actions/inventory'
import { EXCLUDE, EXCLUDE_WARNINGS, ON_LAST } from '../actions/last'
import { refresh, setLast } from '../actions/messages'
import { PAGE_LOADED } from '../actions/ui'
import { bpNameFromItemName, budgetInfoFromBp, cleanForSave, initialState, itemName, itemNameFromString, itemStringFromName } from '../helpers/craft'
import { joinDuplicates, joinList } from '../helpers/inventory'
import { getCraft } from '../selectors/craft'
import { getHistory } from '../selectors/history'
import { getInventory } from '../selectors/inventory'
import { getLast } from '../selectors/last'
import { getSettings } from '../selectors/settings'
import { BlueprintMaterial, BlueprintSessionDiff, BlueprintWebMaterial, BluprintWebData, CraftState, STEP_REFRESH_ERROR, STEP_REFRESH_TO_END, STEP_REFRESH_TO_START } from '../state/craft'
import { HistoryState, ViewItemData } from '../state/history'
import { InventoryState } from '../state/inventory'
import { LastRequiredState } from '../state/last'
import { SettingsState } from '../state/settings'
import { Dispatch } from 'react'

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state: CraftState = await api.storage.loadCraft()
            if (state) {
                dispatch(setCraftState(mergeDeep(initialState, state)))
                Promise.all(state.blueprints.filter(bp => bp.info.loading).map(bp =>
                    fetchBlueprintData(bp.name, dispatch))
                )
            }
            break
        }
        case REMOVE_BLUEPRINT:
        case SORT_BLUEPRINTS_BY:
        case SET_BLUEPRINT_ACTIVE_PAGE:
        case SET_STARED_BLUEPRINTS_EXPANDED:
        case SET_STARED_BLUEPRINTS_FILTER:
        case ADD_BLUEPRINT_LOADING:
        case ADD_BLUEPRINT_DATA:
        case SET_BLUEPRINT_QUANTITY:
        case SET_BLUEPRINT_EXPANDED:
        case SET_BLUEPRINT_STARED:
        case SHOW_BLUEPRINT_MATERIAL_DATA:
        case START_BUDGET_PAGE_LOADING:
        case SET_BUDGET_PAGE_LOADING_STAGE:
        case SET_BUDGET_PAGE_INFO:
        case END_BUDGET_PAGE_LOADING:
        case ERROR_BUDGET_PAGE_LOADING:
        case BUY_BUDGET_PAGE_MATERIAL:
        case BUY_BUDGET_PAGE_MATERIAL_DONE:
        case BUY_BUDGET_PAGE_MATERIAL_CLEAR:
        case MOVE_ALL_BUDGET_PAGE_MATERIAL:
        case CHANGE_BUDGET_PAGE_BUY_COST:
        case CHANGE_BUDGET_PAGE_BUY_FEE:
        case START_CRAFT_SESSION:
        case END_CRAFT_SESSION:
        case ERROR_CRAFT_SESSION:
        case READY_CRAFT_SESSION:
        case SET_NEW_CRAFT_SESSION_DIFF:
        case SET_CRAFT_SAVE_STAGE:
        case DONE_CRAFT_SESSION:
        case CLEAR_CRAFT_SESSION: {
            const state: CraftState = getCraft(getState())
            await api.storage.saveCraft(cleanForSave(state))
            break
        }
    }
    if (action.type === ADD_BLUEPRINT_LOADING) {
        await fetchBlueprintData(action.payload.name, dispatch)
    }
    switch (action.type) {
        case SET_BLUEPRINT_STARED: {
            const state: CraftState = getCraft(getState())
            if (action.payload.stared && !state.blueprints.find(bp => bp.name == action.payload.name)) {
                dispatch(addBlueprintLoading(action.payload.name))
            }
            break
        }
        case SET_BLUEPRINT_ACTIVE_PAGE: {
            const state: CraftState = getCraft(getState())
            if (action.payload.name && !state.blueprints.find(bp => bp.name == action.payload.name)) {
                dispatch(addBlueprintLoading(action.payload.name))
            }
            break
        }
        case SHOW_BLUEPRINT_MATERIAL_DATA: {
            const inv: InventoryState = getInventory(getState())
            const state: CraftState = getCraft(getState())
            if (!state.blueprints.find(bp => bp.itemName == action.payload.materialName)) {
                const addBpName = bpNameFromItemName(inv, action.payload.materialName)
                if (addBpName) {
                    dispatch(addBlueprintLoading(addBpName))
                }
            }
            break
        }
        case ADD_BLUEPRINT_LOADING:
        case SET_CURRENT_INVENTORY: {
            let s: InventoryState = getInventory(getState())
            let items = joinDuplicates(joinList(s), [ "AUCTION" ])
            let dictionary: { [k: string]: number } = Object.fromEntries(items.map((x: ItemData) => [x.n, Number(x.q)]));
            dispatch(setBlueprintQuantity(dictionary))
            break
        }
        case ADD_BLUEPRINT_DATA:
        case SET_BLUEPRINT_EXPANDED:
        case START_BUDGET_PAGE_LOADING:
        case PAGE_LOADED: {
            if (action.type == SET_BLUEPRINT_EXPANDED && !action.payload.expanded)
                break // only load when expanding

            const state: CraftState = getCraft(getState())
            const settings: SettingsState = getSettings(getState())

            const load = async (bpName: string): Promise<void> => {
                try {
                    const bpInfo = state.blueprints.find(bp => bp.name == bpName)
                    const setStage = (stage: number) => dispatch(setBudgetPageStage(bpName, stage))
    
                    const sheet: BudgetSheet = await api.sheets.loadBudgetSheet(settings.sheet, setStage, budgetInfoFromBp(bpInfo), action.type === START_BUDGET_PAGE_LOADING)
                    if (sheet !== undefined) {
                        await sheet.save()
                        const info: BudgetSheetGetInfo = await sheet.getInfo()
                        dispatch(setBudgetPageInfo(bpName, info))
                    }
                } catch (e) {
                    dispatch(setBudgetPageLoadingError(bpName, e.message))
                    trace('exception loading budget sheet:')
                    traceData(e)
                } finally {
                    dispatch(endBudgetPageLoading(bpName))
                }    
            }

            switch (action.type) {
                case PAGE_LOADED: {
                    state.blueprints.filter(bp => bp.info.loading).forEach(bp => load(bp.name))
                    break
                }
                case ADD_BLUEPRINT_DATA:
                    load(action.payload.data.Name)
                    break
                default:
                    load(action.payload.name)
                    break
            }
            break
        }
        case RELOAD_BLUEPRINT: {
            const state: CraftState = getCraft(getState())
            dispatch(removeBlueprint(action.payload.name))
            dispatch(addBlueprintLoading(action.payload.name))
            break
        }
        case START_CRAFT_SESSION:
        case END_CRAFT_SESSION: {
            dispatch(refresh)
            break
        }
        case SET_HISTORY_LIST: {
            const state: CraftState = getCraft(getState())
            const history: HistoryState = getHistory(getState())
            if (history.list.length > 0) {
                if (history.list[0].class === 'error') {
                    dispatch(errorCraftingSession(state.activeSession, history.list[0].text))
                } else {
                    if (history.list[0].isLast)
                        dispatch(clearBuyBudget)
                    
                    if (state.activeSession !== undefined) {
                        const activeSessionBp = state.blueprints.find(bp => bp.name === state.activeSession)
                        switch (activeSessionBp.session.step) {
                            case STEP_REFRESH_TO_START:
                            case STEP_REFRESH_ERROR: {
                                if (history.list[0].isLast) {
                                    dispatch(readyCraftingSession(state.activeSession))
                                } else {
                                    dispatch(setLast)
                                }
                            }
                        }
                    }
                }
            }
            break
        }
        case ON_LAST:
        case EXCLUDE:
        case EXCLUDE_WARNINGS: {
            const state: CraftState = getCraft(getState())
            if (state.activeSession) {
                const activeSessionBp = state.blueprints.find(bp => bp.name === state.activeSession)
                const map: { [n: string]: { q: number, v: number } } = { }
                const { diff }: LastRequiredState  = getLast(getState())
                if (diff) {
                    diff.forEach((v: ViewItemData) => {
                        if (!v.e) {// not excluded
                            let name = v.n
                            if (name.endsWith(' (M)') || name.endsWith(' (F)'))
                                name = name.substring(0, name.length - 4)
                            if (map[name] === undefined)
                                map[name] = { q: 0, v: 0 }
                            map[name].q += Number(v.q)
                            map[name].v += Number(v.v)
                        }
                    })
                }
                const newDiff: BlueprintSessionDiff[] = activeSessionBp.info.materials.map((m: BlueprintMaterial) => {
                    const name = itemName(activeSessionBp, m)
                    return { n: name, q: map[name]?.q ?? 0, v: map[name]?.v ?? 0 }
                })
                dispatch(setNewCraftingSessionDiff(state.activeSession, newDiff))

                if (action.type === ON_LAST && activeSessionBp.session.step === STEP_REFRESH_TO_END) {
                    if (activeSessionBp.budget.hasPage && newDiff.some((v) => v.q !== 0))
                        dispatch(saveCraftingSession(state.activeSession))
                    //else
                    //    dispatch(doneCraftingSession(state.activeSession))
                }
            }
            break
        }
        case SAVE_CRAFT_SESSION: {
            try {
                const state: CraftState = getCraft(getState())
                const settings: SettingsState = getSettings(getState())
                const activeSessionBp = state.blueprints.find(bp => bp.name === state.activeSession)
                if (activeSessionBp.session.diffMaterials !== undefined) {
                    const setStage = (stage: number) => dispatch(setCraftingSessionStage(action.payload.name, stage))
                    const sheet: BudgetSheet = await api.sheets.loadBudgetSheet(settings.sheet, setStage, budgetInfoFromBp(activeSessionBp))
                    const d: BudgetLineData = {
                        reason: 'Craft',
                        materials: activeSessionBp.session.diffMaterials.map(m => ({
                            name: itemStringFromName(activeSessionBp, m.n),
                            quantity: m.q
                        }))
                    }
                    await sheet.addLine(d)
                    await sheet.save()
                }
                dispatch(doneCraftingSession(state.activeSession))
            } catch (e) {
                dispatch(setBudgetPageLoadingError(action.payload.name, e.message))
                trace('exception saving craft session:')
                traceData(e)
            } finally {
                dispatch(endBudgetPageLoading(action.payload.name))
            }
            break
        }
        case CLEAR_CRAFT_SESSION: {
            dispatch(setLast)
            break
        }
        case BUY_BUDGET_PAGE_MATERIAL: {
            const bpName = action.payload.name
            try {
                const state: CraftState = getCraft(getState())
                const settings: SettingsState = getSettings(getState())
                const activeSessionBp = state.blueprints.find(bp => bp.name === bpName)
                const materialName = action.payload.materialName

                const setStage = (stage: number) => dispatch(setCraftingSessionStage(bpName, stage))
                const sheet: BudgetSheet = await api.sheets.loadBudgetSheet(settings.sheet, setStage, budgetInfoFromBp(activeSessionBp))

                let quantity = action.payload.quantity
                let value = action.payload.value
                if (action.payload.text === BUDGET_MOVE) {
                    for (var bp of state.blueprints) {
                        if (bp.name !== bpName) {
                            const m = bp.info.materials.find(m => m.name === materialName)
                            if (m?.budgetCount && m.budgetCount > m.available) {
                                const q = Math.min(m.budgetCount - m.available, quantity)
                                const sheetFrom: BudgetSheet = await api.sheets.loadBudgetSheet(settings.sheet, setStage, budgetInfoFromBp(bp))
                                const v = q * m.value * m.markup
                                await sheetFrom.addBuyMaterial(materialName, -q, v, `Move to ${activeSessionBp.itemName}`)
                                await sheet.addBuyMaterial(materialName, q, -v, `Move from ${bp.itemName}`)

                                await sheetFrom.save()
                                const infoFrom: BudgetSheetGetInfo = await sheetFrom.getInfo()
                                dispatch(setBudgetPageInfo(bp.name, infoFrom))
            
                                value *= quantity - q
                                quantity -= q
                            }
                        }
                    }
                }

                if (action.payload.text !== BUDGET_SELL)
                    value = -value
                await sheet.addBuyMaterial(materialName, quantity, value, action.payload.text)

                await sheet.save()
                const info: BudgetSheetGetInfo = await sheet.getInfo()
                dispatch(setBudgetPageInfo(bpName, info))
                dispatch(doneBuyBudget(bpName, action.payload.materialName, action.payload.quantity))
            } catch (e) {
                dispatch(setBudgetPageLoadingError(bpName, e.message))
                trace('exception saving craft session:')
                traceData(e)
            } finally {
                dispatch(endBudgetPageLoading(bpName))
            }
            break
        }
    }
}

const fetchBlueprintData = async (name: string, dispatch: Dispatch<any>): Promise<void> => {
    const urlName = name.replace(/ /g, '%20')
    let url = `https://apps5.genexus.com/entropia-flow-helper-1/rest/BlueprintInfo?name=${urlName}` // use server to get from entropiawiki to avoid CORS error
    let data: BluprintWebData
    try {
        let response = await fetch(url)
        data = await response.json()
    } catch (e) {
        data = {
            Name: name,
            ItemValue: '',
            StatusCode: 1,
            Url: undefined,
            Text: e.toString(),
            Material: []
        }
    }
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
        const addResidue = (name: string, condition: (m: BlueprintWebMaterial) => boolean): void => {
            if (data.Material.some(condition)) {
                data.Material.push({
                    Name: name,
                    Quantity: 0,
                    Type: 'Residue',
                    Value: '0.01'
                })
            }
        }
        addResidue('Metal Residue', m => true)
        addResidue('Energy Matter Residue', m => m.Type === 'Refined Enmatter')
        addResidue('Tailoring Remnants', m => m.Name.includes('Leather'))
        data.Material.push({
            Name: 'Shrapnel',
            Quantity: 0,
            Type: 'Fragment',
            Value: '0.0001'
        })
    }
    dispatch(addBlueprintData(data))
}

export default [
    requests
]