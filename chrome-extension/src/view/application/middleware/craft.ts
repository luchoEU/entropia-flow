import { trace, traceData } from '../../../common/trace'
import { mergeDeep } from '../../../common/merge'
import { BudgetLineData, BudgetSheet, BudgetSheetGetInfo } from '../../services/api/sheets/sheetsBudget'
import { BUDGET_MOVE, BUDGET_SELL, BUY_BUDGET_PAGE_MATERIAL, BUY_BUDGET_PAGE_MATERIAL_CLEAR, BUY_BUDGET_PAGE_MATERIAL_DONE, CHANGE_BUDGET_PAGE_BUY_COST, CHANGE_BUDGET_PAGE_BUY_FEE, clearBuyBudget, CLEAR_CRAFT_SESSION, doneBuyBudget, doneCraftingSession, DONE_CRAFT_SESSION, endBudgetPageLoading, END_BUDGET_PAGE_LOADING, END_CRAFT_SESSION, errorCraftingSession, ERROR_BUDGET_PAGE_LOADING, ERROR_CRAFT_SESSION, MOVE_ALL_BUDGET_PAGE_MATERIAL, readyCraftingSession, READY_CRAFT_SESSION, REMOVE_BLUEPRINT, saveCraftingSession, SAVE_CRAFT_SESSION, setBlueprintQuantity, setBudgetPageInfo, setBudgetPageLoadingError, setBudgetPageStage, setCraftingSessionStage, setCraftState, setNewCraftingSessionDiff, SET_STARED_BLUEPRINTS_EXPANDED, SET_BLUEPRINT_QUANTITY, SET_BUDGET_PAGE_INFO, SET_BUDGET_PAGE_LOADING_STAGE, SET_CRAFT_SAVE_STAGE, SET_NEW_CRAFT_SESSION_DIFF, SORT_BLUEPRINTS_BY, START_BUDGET_PAGE_LOADING, START_CRAFT_SESSION, RELOAD_BLUEPRINT, removeBlueprint, SET_STARED_BLUEPRINTS_FILTER, SHOW_BLUEPRINT_MATERIAL_DATA, SET_BLUEPRINT_STARED, SET_BLUEPRINT_ACTIVE_PAGE, SET_CRAFT_ACTIVE_PLANET, SET_BLUEPRINT_PARTIAL_WEB_DATA, setBlueprintPartialWebData, ADD_BLUEPRINT, addBlueprint, setBlueprintMaterialTypeAndValue, SET_BLUEPRINT_MATERIAL_TYPE_AND_VALUE } from '../actions/craft'
import { SET_HISTORY_LIST } from '../actions/history'
import { SET_CURRENT_INVENTORY, setByStoreCraftFilter } from '../actions/inventory'
import { EXCLUDE, EXCLUDE_WARNINGS, ON_LAST } from '../actions/last'
import { refresh, setLast } from '../actions/messages'
import { PAGE_LOADED } from '../actions/ui'
import { bpDataFromItemName, bpNameFromItemName, budgetInfoFromBp, cleanForSave, cleanWeb, initialState, isLimited, itemStringFromName } from '../helpers/craft'
import { getCraft } from '../selectors/craft'
import { getHistory } from '../selectors/history'
import { getInventory } from '../selectors/inventory'
import { getLast } from '../selectors/last'
import { getSettings } from '../selectors/settings'
import { BlueprintSessionDiff, CraftState, STEP_REFRESH_ERROR, STEP_REFRESH_TO_END, STEP_REFRESH_TO_START } from '../state/craft'
import { HistoryState, ViewItemData } from '../state/history'
import { InventoryState } from '../state/inventory'
import { LastRequiredState } from '../state/last'
import { SettingsState } from '../state/settings'
import { MaterialsMap } from '../state/materials'
import { getMaterialsMap } from '../selectors/materials'
import { loadMaterialData, loadMaterialRawMaterials, SET_MATERIAL_PARTIAL_WEB_DATA, SET_MATERIALS_STATE } from '../actions/materials'
import { filterExact, filterOr } from '../../../common/filter'
import { loadFromWeb, WebLoadResponse } from '../../../web/loader'
import { Dispatch } from 'react'
import { BlueprintWebData, BlueprintWebMaterial, MaterialWebData } from '../../../web/state'
import { CLEAR_WEB_ON_LOAD } from '../../../config'

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            let state: CraftState = await api.storage.loadCraft()
            if (state) {
                if (CLEAR_WEB_ON_LOAD) {
                    state = cleanWeb(state)
                }
                dispatch(setCraftState(mergeDeep(initialState, state)))
                await Promise.all(Object.values(state.blueprints)
                    .filter(bp => !bp.web?.blueprint || bp.web.blueprint.loading)
                    .map(bp => loadBlueprint(bp.name, dispatch))
                )
            }
            break
        }
        case REMOVE_BLUEPRINT:
        case SORT_BLUEPRINTS_BY:
        case SET_BLUEPRINT_ACTIVE_PAGE:
        case SET_STARED_BLUEPRINTS_EXPANDED:
        case SET_STARED_BLUEPRINTS_FILTER:
        case ADD_BLUEPRINT:
        case SET_BLUEPRINT_PARTIAL_WEB_DATA:
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
        case CLEAR_CRAFT_SESSION:
        case SET_CRAFT_ACTIVE_PLANET: {
            const state: CraftState = getCraft(getState())
            await api.storage.saveCraft(cleanForSave(state))
            break
        }
    }
    if (action.type === ADD_BLUEPRINT) {
        await loadBlueprint(action.payload.name, dispatch)
    }
    switch (action.type) {
        case SET_BLUEPRINT_STARED: {
            const state: CraftState = getCraft(getState())
            if (action.payload.stared && !state.blueprints[action.payload.name]) {
                dispatch(addBlueprint(action.payload.name))
            }
            break
        }
        case SET_BLUEPRINT_ACTIVE_PAGE: {
            const state: CraftState = getCraft(getState())
            if (action.payload.name && !state.blueprints[action.payload.name]) {
                dispatch(addBlueprint(action.payload.name))
            }
            break
        }
        case SHOW_BLUEPRINT_MATERIAL_DATA: {
            const inv: InventoryState = getInventory(getState())
            const state: CraftState = getCraft(getState())
            let bp = state.blueprints[action.payload.name]
            let materialName = action.payload.materialName

            while (materialName && materialName !== bp.c.itemName) {
                bp = bpDataFromItemName(state, materialName)
                if (bp) {
                    materialName = bp.chain
                    if (!bp.web?.blueprint) {
                        await loadBlueprint(bp.name, dispatch)
                    }
                } else {
                    const addBpName = bpNameFromItemName(inv, materialName)
                    if (addBpName) {
                        dispatch(addBlueprint(addBpName))
                        materialName = undefined
                    }
                    break
                }
            }
            
            if (materialName) {
                const mat: MaterialsMap = getMaterialsMap(getState())
                const raw = mat[materialName]?.web?.rawMaterials
                if (!raw) {
                    dispatch(loadMaterialRawMaterials(materialName))
                }
                dispatch(setByStoreCraftFilter(filterExact(
                    raw?.data ?
                        filterOr([ materialName, ...raw.data.value.map(m => m.name) ]) :
                        materialName)))
            }
            break
        }
        case ADD_BLUEPRINT:
        case SET_CRAFT_ACTIVE_PLANET:
        case SET_CURRENT_INVENTORY: {
            const s: CraftState = getCraft(getState())
            const inv: InventoryState = getInventory(getState())
            const planetItems = inv.byStore.flat.original.filter(i => i.c === 'Carried' || i.c == s.activePlanet)
            let itemMap: { [k: string]: number } = {}
            planetItems.forEach(i => {
                let q: number
                if (i.q.startsWith('[')) {
                    q = 1 // container
                } else {
                    q = Number(i.q)
                }
                if (i.n in itemMap) {
                    itemMap[i.n] += q
                } else {
                    itemMap[i.n] = q
                }
            })
            dispatch(setBlueprintQuantity(itemMap))
            break
        }
        case SET_BLUEPRINT_PARTIAL_WEB_DATA:
        case START_BUDGET_PAGE_LOADING:
        case PAGE_LOADED: {
            const state: CraftState = getCraft(getState())
            const settings: SettingsState = getSettings(getState())

            const loadBudget = async (bpName: string): Promise<void> => {
                try {
                    const bpInfo = state.blueprints[bpName]
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
                    Object.values(state.blueprints)
                        .filter(bp => bp.budget.loading)
                        .forEach(bp => loadBudget(bp.name))
                    break
                }
                case ADD_BLUEPRINT:
                    loadBudget(action.payload.data.Name)
                    break
                default:
                    loadBudget(action.payload.name)
                    break
            }

            if (action.type === SET_BLUEPRINT_PARTIAL_WEB_DATA) {
                const bp: WebLoadResponse<BlueprintWebData> = action.payload.change.blueprint
                const bpValue = bp?.data?.value
                if (bpValue) {
                    const mat: MaterialsMap = getMaterialsMap(getState())
                    const list: MaterialWebData[] = []
                    bpValue.materials.forEach(m => {
                        const material = mat[m.name]?.web?.material;
                        if (!material) {
                            // load missing materials types
                            dispatch(loadMaterialData(m.name, m.url));
                        } else if (material.data?.value) {
                            list.push(material.data.value);
                        }
                    })
                    dispatch(setBlueprintMaterialTypeAndValue(list));
                }
            }

            break;
        }
        case SET_MATERIALS_STATE: {
            const mat: MaterialsMap = getMaterialsMap(getState());
            const list: MaterialWebData[] = Object.values(mat)
                .map(m => m.web?.material?.data?.value)
                .filter(t => t);
            dispatch(setBlueprintMaterialTypeAndValue(list));
            break;
        }
        case SET_MATERIAL_PARTIAL_WEB_DATA: {
            const change: WebLoadResponse<MaterialWebData> = action.payload.change.material
            if (change?.data)
                dispatch(setBlueprintMaterialTypeAndValue([change.data.value]));
            break;
        }
        case RELOAD_BLUEPRINT: {
            const state: CraftState = getCraft(getState())
            dispatch(removeBlueprint(action.payload.name))
            dispatch(addBlueprint(action.payload.name))
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
                        const activeSessionBp = state.blueprints[state.activeSession]
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
                const activeSessionBp = state.blueprints[state.activeSession]
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
                const newDiff: BlueprintSessionDiff[] = Object.values(activeSessionBp.web.blueprint.data.value.materials).map((m: BlueprintWebMaterial) => {
                    return { n: m.name, q: map[m.name]?.q ?? 0, v: map[m.name]?.v ?? 0 }
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
                const activeSessionBp = state.blueprints[state.activeSession]
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
                const activeSessionBp = state.blueprints[bpName]
                const materialName = action.payload.materialName

                const setStage = (stage: number) => dispatch(setCraftingSessionStage(bpName, stage))
                const sheet: BudgetSheet = await api.sheets.loadBudgetSheet(settings.sheet, setStage, budgetInfoFromBp(activeSessionBp))

                let quantity = action.payload.quantity
                let value = action.payload.value
                if (action.payload.text === BUDGET_MOVE) {
                    for (var bp of Object.values(state.blueprints)) {
                        if (bp.name !== bpName) {
                            const m = bp.c.materials[materialName]
                            const budgetM = bp.budget.sheet.materials[materialName]
                            if (budgetM?.count && budgetM.count > m.available) {
                                const q = Math.min(budgetM.count - m.available, quantity)
                                const sheetFrom: BudgetSheet = await api.sheets.loadBudgetSheet(settings.sheet, setStage, budgetInfoFromBp(bp))
                                const v = q * m.value * budgetM.markup
                                await sheetFrom.addBuyMaterial(materialName, -q, v, `Move to ${activeSessionBp.c.itemName}`)
                                await sheet.addBuyMaterial(materialName, q, -v, `Move from ${bp.c.itemName}`)

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

async function loadBlueprint(bpName: string, dispatch: Dispatch<any>) {
    if (!bpName) return; // TODO, why is it not defined?
    for await (const r of loadFromWeb(s => s.loadBlueprint(bpName))) {
        
        dispatch(setBlueprintPartialWebData(bpName, { blueprint: r }))
    }
}

export default [
    requests
]
