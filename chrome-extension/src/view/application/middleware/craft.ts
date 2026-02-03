import { getDefaultStore } from 'jotai'
import { Component, traceError } from '../../../common/trace'
import { mergeDeep } from '../../../common/merge'
import { BudgetLineData, BudgetSheet, BudgetSheetGetInfo } from '../../services/api/sheets/sheetsBudget'
import { BUDGET_MOVE, BUDGET_SELL, BUY_BUDGET_PAGE_MATERIAL, BUY_BUDGET_PAGE_MATERIAL_CLEAR, BUY_BUDGET_PAGE_MATERIAL_DONE, CHANGE_BUDGET_PAGE_BUY_COST, CHANGE_BUDGET_PAGE_BUY_FEE, clearBuyBudget, CLEAR_CRAFT_SESSION, doneBuyBudget, doneCraftingSession, DONE_CRAFT_SESSION, endBudgetPageLoading, END_BUDGET_PAGE_LOADING, END_CRAFT_SESSION, errorCraftingSession, ERROR_BUDGET_PAGE_LOADING, ERROR_CRAFT_SESSION, MOVE_ALL_BUDGET_PAGE_MATERIAL, readyCraftingSession, READY_CRAFT_SESSION, REMOVE_BLUEPRINT, SAVE_CRAFT_SESSION, setBlueprintQuantity, setBudgetPageInfo, setBudgetPageLoadingError, setBudgetPageStage, setCraftingSessionStage, setCraftState, SET_BUDGET_PAGE_INFO, SET_BUDGET_PAGE_LOADING_STAGE, SET_CRAFT_SAVE_STAGE, SORT_BLUEPRINTS_BY, START_BUDGET_PAGE_LOADING, START_CRAFT_SESSION, RELOAD_BLUEPRINT, removeBlueprint, SET_STARED_BLUEPRINTS_FILTER, SHOW_BLUEPRINT_MATERIAL_DATA, SET_BLUEPRINT_STARED, SET_CRAFT_ACTIVE_PLANET, SET_BLUEPRINT_PARTIAL_WEB_DATA, setBlueprintPartialWebData, ADD_BLUEPRINT, addBlueprint, setBlueprintMaterialTypeAndValue, SET_CRAFT_STATE, SET_CRAFT_OPTIONS, ADD_BLUEPRINT_MATERIAL, REMOVE_BLUEPRINT_MATERIAL, CHANGE_BLUEPRINT_MATERIAL_QUANTITY, CHANGE_BLUEPRINT_MATERIAL_NAME, MOVE_BLUEPRINT_MATERIAL, START_BLUEPRINT_EDIT_MODE, END_BLUEPRINT_EDIT_MODE, setBlueprintSuggestedMaterials, SET_BLUEPRINT_LIST } from '../actions/craft'
import { refresh } from '../actions/messages'
import { AppAction } from '../slice/app'
import { bpDataFromItemName, budgetInfoFromBp, cleanForSave, cleanWeb, initialState, isLimited, itemNameFromBpName, itemStringFromName } from '../helpers/craft'
import { getCraft } from '../selectors/craft'
import { getInventory } from '../selectors/inventory'
import { rawInventoryItemsAtom } from '../atoms/inventory'
import { BlueprintData, CraftState } from '../state/craft'
import { InventoryState } from '../state/inventory'
import { SettingsState } from '../state/settings'
import { ItemsMap } from '../state/items'
import { getItemsMap } from '../selectors/items'
import { CHANGE_MATERIAL_TYPE, CHANGE_MATERIAL_VALUE, loadItemData, loadItemRawMaterials, SET_ITEM_PARTIAL_WEB_DATA, SET_ITEMS_STATE } from '../actions/items'
import { loadFromWebMultiple, WebLoadResponse } from '../../../web/loader'
import { Dispatch } from 'react'
import { BlueprintWebData, BlueprintWebMaterial, ItemWebData } from '../../../web/state'
import { CLEAR_WEB_ON_LOAD } from '../../../config'
import { setTabularDefinitions } from '../helpers/tabular'
import { craftTabularData, craftTabularDefinitions } from '../tabular/craft'
import { setTabularData } from '../actions/tabular'
import { ItemData } from '../../../common/state'
import { IWebSource } from '../../../web/sources'
import { createNewSessionAtom } from '../atoms/activity'
import { LOAD_INVENTORY_STATE, SET_CURRENT_INVENTORY } from '../actions/inventory'
import {
    blueprintsAtom,
    staredAtom,
    craftOptionsAtom,
    activeSessionAtom,
    activePlanetAtom,
    editModeBlueprintNameAtom,
    craftWebDataAtom
} from '../atoms/craft'
import { settingsAtom } from '../atoms/settings'

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    let editModeBlueprintName: string | undefined;
    if (action.type === END_BLUEPRINT_EDIT_MODE) {
        const state: CraftState = getCraft(getState());
        editModeBlueprintName = state.editModeBlueprintName;
    }

    const result = await next(action)
    switch (action.type) {
        case AppAction.INITIALIZE: {
            setTabularDefinitions(craftTabularDefinitions)
            let state: CraftState = await api.storage.loadCraft();
            if (state) {
                if (CLEAR_WEB_ON_LOAD) {
                    state = cleanWeb(state);
                }
                dispatch(setCraftState(mergeDeep(initialState, state)));

                const tasks = Object.values(state.blueprints)
                    .filter(bp => bp.web?.blueprint.loading)
                    .map(bp => loadBlueprintLoop(bp.name, dispatch));
                await Promise.race([Promise.all(tasks), new Promise(resolve => setTimeout(resolve, 1000))])
            }
            break
        }
        case REMOVE_BLUEPRINT:
        case SORT_BLUEPRINTS_BY:
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
        case SET_CRAFT_SAVE_STAGE:
        case DONE_CRAFT_SESSION:
        case CLEAR_CRAFT_SESSION:
        case SET_CRAFT_ACTIVE_PLANET:
        case SET_CRAFT_OPTIONS:
        case START_BLUEPRINT_EDIT_MODE:
        case END_BLUEPRINT_EDIT_MODE:
        case ADD_BLUEPRINT_MATERIAL:
        case MOVE_BLUEPRINT_MATERIAL:
        case REMOVE_BLUEPRINT_MATERIAL:
        case CHANGE_BLUEPRINT_MATERIAL_QUANTITY:
        case CHANGE_BLUEPRINT_MATERIAL_NAME: {
            const state: CraftState = getCraft(getState())
            await api.storage.saveCraft(cleanForSave(state))
            break
        }
    }
    if (action.type === ADD_BLUEPRINT) {
        await loadBlueprintLoop(action.payload.name, dispatch)
    }
    switch (action.type) {
        case SET_BLUEPRINT_STARED: {
            const state: CraftState = getCraft(getState())
            if (action.payload.stared && !state.blueprints[action.payload.name]) {
                dispatch(addBlueprint(action.payload.name))
            }
            break
        }
        case SHOW_BLUEPRINT_MATERIAL_DATA: {
            const state: CraftState = getCraft(getState())
            let bp: BlueprintData | undefined = state.blueprints[action.payload.name]
            let materialName = action.payload.materialName

            while (materialName && materialName !== bp?.c?.itemName) {
                bp = bpDataFromItemName(state, materialName)
                if (bp) {
                    materialName = bp.chain
                    if (!bp.web?.blueprint) {
                        await loadBlueprintLoop(bp.name, dispatch)
                    }
                } else {
                    // Get blueprint name from raw inventory using Jotai
                    const rawItems = getDefaultStore().get(rawInventoryItemsAtom)
                    const blueprintItems = rawItems
                        .map(item => item.data)
                        .filter(item => item.n.includes("Blueprint"))
                    const addBpName = blueprintItems
                        .find(bp => itemNameFromBpName(bp.n) === materialName)?.n

                    if (addBpName) {
                        dispatch(addBlueprint(addBpName))
                        materialName = undefined
                    }
                    break
                }
            }
            
            if (materialName) {
                const mat: ItemsMap = getItemsMap(getState())
                const raw = mat[materialName]?.web?.rawMaterials
                if (!raw) {
                    dispatch(loadItemRawMaterials(materialName))
                }
            }
            break
        }
        case ADD_BLUEPRINT:
        case END_BLUEPRINT_EDIT_MODE:
        case SET_CRAFT_ACTIVE_PLANET:
        case SET_CURRENT_INVENTORY: {
            const s: CraftState = getCraft(getState())
            // Get inventory from Jotai instead of Redux
            const rawItems = getDefaultStore().get(rawInventoryItemsAtom)
            let itemMap: { [k: string]: number } = {}
            rawItems.forEach(owned => {
                const i = owned.data
                let q: number
                if (i.c !== 'Carried' && i.c !== s.activePlanet) {
                    q = 0 // send zero so it can check if the blueprint is owned
                } else if (i.q.startsWith('[')) {
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
        case AppAction.INITIALIZE: {
            const state: CraftState = getCraft(getState())
            const settings: SettingsState = getDefaultStore().get(settingsAtom)
            const mat: ItemsMap = getItemsMap(getState())

            const loadBudget = async (bpName: string): Promise<void> => {
                try {
                    const bpInfo = state.blueprints[bpName]
                    const setStage = (stage: number) => dispatch(setBudgetPageStage(bpName, stage))
                    
                    // TODO: error 429 (Too Many Requests)
                    const sheet: BudgetSheet = await api.sheets.loadBudgetSheet(settings, setStage, budgetInfoFromBp(bpInfo, mat), action.type === START_BUDGET_PAGE_LOADING)
                    if (sheet !== undefined) {
                        await sheet.save()
                        const info: BudgetSheetGetInfo = await sheet.getInfo()
                        dispatch(setBudgetPageInfo(bpName, info))
                    }
                } catch (e) {
                    dispatch(setBudgetPageLoadingError(bpName, (e as Error).message))
                    traceError(Component.CraftMiddleware, 'exception loading budget sheet:', e)
                } finally {
                    dispatch(endBudgetPageLoading(bpName))
                }
            }

            switch (action.type) {
                case AppAction.INITIALIZE: {
                    Object.values(state.blueprints)
                        .filter(bp => bp.budget?.loading)
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
            break
        }
    }

    switch (action.type) {
        case SET_BLUEPRINT_PARTIAL_WEB_DATA:
        case END_BLUEPRINT_EDIT_MODE: {
            let materials: { name: string, m?: BlueprintWebMaterial }[] | undefined;
            if (action.type === SET_BLUEPRINT_PARTIAL_WEB_DATA) {
                const bp: WebLoadResponse<BlueprintWebData> = action.payload.change.blueprint
                const bpValue = bp?.data?.value
                if (bpValue) {
                    materials = bpValue.materials.concat(bpValue.item).map(m => ({ name: m.name, m }))
                }
            }
            else if (action.type === END_BLUEPRINT_EDIT_MODE) {
                const state: CraftState = getCraft(getState());
                if (editModeBlueprintName) {
                    const bp = state.blueprints[editModeBlueprintName];
                    if (bp?.user) {
                        materials = bp.user.materials.map(m => ({ name: m.name })).concat({ name: bp.c.itemName });
                    }
                }
            }

            if (materials) {
                // Get inventory from Jotai instead of Redux
                const rawItems = getDefaultStore().get(rawInventoryItemsAtom)
                const inv: ItemData[] = rawItems.map(item => item.data)
                const mat: ItemsMap = getItemsMap(getState())
                const list: ItemWebData[] = []
                materials.forEach(({ name, m }: { name: string, m?: BlueprintWebMaterial }) => {
                    let item: ItemWebData | undefined
                    const material = mat[name]?.web?.item;
                    if (!material) {
                        // load missing materials
                        dispatch(loadItemData(name, m));
                    } else if (mat[name]?.user) {
                        item = mat[name]?.user
                    } else if (material.data?.value) {
                        item = material.data.value;
                    }
                    if (!item) {
                        const invItem = inv.find(i => i.n === name)
                        if (invItem) {
                            item = {
                                name: invItem.n,
                                type: undefined,
                                value: Number(invItem.v) / Number(invItem.q)
                            }
                        }
                    }
                    if (item) {
                        list.push(item)
                    }
                })
                dispatch(setBlueprintMaterialTypeAndValue(list));
            }

            break;
        }
        case SET_ITEMS_STATE:
        case SET_CURRENT_INVENTORY: {
            // Get inventory from Jotai instead of Redux
            const rawItems = getDefaultStore().get(rawInventoryItemsAtom)
            const inv: ItemData[] = rawItems.map(item => item.data)
            const mat: ItemsMap = getItemsMap(getState());
            const matList = Object.values(mat)
                .map(m => m.user ?? m.web?.item?.data?.value)
                .filter(t => t);
            const invList: ItemWebData[] = inv.filter(i => !matList.some(m => m.name === i.n)).map(i => ({
                name: i.n,
                type: undefined,
                value: Number(i.v) / Number(i.q)
            }))
            dispatch(setBlueprintMaterialTypeAndValue([...matList, ...invList]));
            break;
        }
        case CHANGE_BLUEPRINT_MATERIAL_NAME: {
            const bpName = action.payload.name
            const materialName = action.payload.materialName
            const mat: ItemsMap = getItemsMap(getState());
            // Get inventory from Jotai instead of Redux
            const rawItems = getDefaultStore().get(rawInventoryItemsAtom)
            const ownedItems = new Set([ ...Object.keys(mat), ...rawItems.map(i => i.data.n) ])
            const suggestedMaterials = Array.from(ownedItems)
                .filter(m => m.length > materialName.length && m.startsWith(materialName))
                .sort()
                .slice(0, 10)
            dispatch(setBlueprintSuggestedMaterials(bpName, suggestedMaterials))
            break;
        }
        case SET_ITEM_PARTIAL_WEB_DATA: {
            const change: WebLoadResponse<ItemWebData> = action.payload.change.item
            if (change?.data)
                dispatch(setBlueprintMaterialTypeAndValue([change.data.value]));
            break;
        }
        case CHANGE_MATERIAL_TYPE:
        case CHANGE_MATERIAL_VALUE: {
            const mat: ItemsMap = getItemsMap(getState());
            dispatch(setBlueprintMaterialTypeAndValue([mat[action.payload.item].user]));
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
        // Note: This logic now triggers via ActivityBridge Jotai atom changes
        // We no longer need to handle these Redux actions here
        case SAVE_CRAFT_SESSION: {
            try {
                const state: CraftState = getCraft(getState())
                const settings: SettingsState = getDefaultStore().get(settingsAtom)
                const mat: ItemsMap = getItemsMap(getState())

                const activeSessionBp = state.blueprints[state.activeSession ?? '']
                if (activeSessionBp.session?.diffMaterials !== undefined) {
                    const setStage = (stage: number) => dispatch(setCraftingSessionStage(action.payload.name, stage))
                    const sheet: BudgetSheet = await api.sheets.loadBudgetSheet(settings, setStage, budgetInfoFromBp(activeSessionBp, mat))
                    const d: BudgetLineData = {
                        date: Date.now(),
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
                traceError(Component.CraftMiddleware, 'exception saving craft session:', e)
            } finally {
                dispatch(endBudgetPageLoading(action.payload.name))
            }
            break
        }
        case CLEAR_CRAFT_SESSION: {
            getDefaultStore().set(createNewSessionAtom)
            break
        }
        case BUY_BUDGET_PAGE_MATERIAL: {
            const bpName = action.payload.name
            try {
                const state: CraftState = getCraft(getState())
                const settings: SettingsState = getDefaultStore().get(settingsAtom)
                const mat: ItemsMap = getItemsMap(getState())
                const activeSessionBp = state.blueprints[bpName]
                const materialName = action.payload.materialName

                const setStage = (stage: number) => dispatch(setCraftingSessionStage(bpName, stage))
                const sheet: BudgetSheet = await api.sheets.loadBudgetSheet(settings, setStage, budgetInfoFromBp(activeSessionBp, mat))

                let quantity = action.payload.quantity
                let value = action.payload.value
                if (action.payload.text === BUDGET_MOVE) {
                    for (var bp of Object.values(state.blueprints)) {
                        if (bp.name !== bpName) {
                            const m = bp.c!.materials![materialName]
                            const budgetM = bp.budget!.sheet!.materials[materialName]
                            if (budgetM?.count && budgetM.count > m.available!) {
                                const q = Math.min(budgetM.count - m.available!, quantity)
                                const sheetFrom: BudgetSheet = await api.sheets.loadBudgetSheet(settings, setStage, budgetInfoFromBp(bp, mat))
                                const v = q * m.value * budgetM.markup
                                await sheetFrom.addBuyMaterial(materialName, -q, v, `Move to ${activeSessionBp.c!.itemName}`)
                                await sheet.addBuyMaterial(materialName, q, -v, `Move from ${bp.c!.itemName}`)

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
                traceError(Component.CraftMiddleware, 'exception saving craft session:', e)
            } finally {
                dispatch(endBudgetPageLoading(bpName))
            }
            break
        }
    }

    switch (action.type) {
        case SET_CRAFT_STATE:
        case LOAD_INVENTORY_STATE:
        case SET_CURRENT_INVENTORY:
        case SET_BLUEPRINT_LIST:
        case SET_CRAFT_OPTIONS:
        case END_BLUEPRINT_EDIT_MODE:
            const state: CraftState = getCraft(getState())
            const inventory: InventoryState = getInventory(getState())
            dispatch(setTabularData(craftTabularData(state, inventory)))
            break
    }

    // Sync Redux craft state to Jotai atoms for gradual migration
    syncCraftStateToJotai(getState)

    return result
}

/**
 * Sync Redux craft state to Jotai atoms during migration
 * This allows Jotai components to read the current Redux state
 */
function syncCraftStateToJotai(getState: () => any) {
    const craftState: CraftState = getCraft(getState())
    const store = getDefaultStore()

    // Only sync if we have state (avoid syncing during initialization)
    if (craftState && craftState.blueprints) {
        store.set(blueprintsAtom, craftState.blueprints)
        store.set(staredAtom, craftState.stared)
        store.set(craftOptionsAtom, craftState.options)
        store.set(activeSessionAtom, craftState.activeSession)
        store.set(activePlanetAtom, craftState.activePlanet)
        store.set(editModeBlueprintNameAtom, craftState.editModeBlueprintName)
        store.set(craftWebDataAtom, craftState.web)
    }
}

async function loadBlueprintLoop(bpName: string, dispatch: Dispatch<any>) {
    if (!bpName) return; // TODO, why is it not defined?

    // 'T1 Weapon Economy Enhancer Blueprint (L)' to 'Weapon Economy Enhancer 1 Blueprint (L)'
    const renamedBpName = bpName.replace(/^T(\d+)\s+(.*?)\s+Blueprint(\s+\(L\))?$/, "$2 $1 Blueprint$3");
    let names: string[] = renamedBpName !== bpName ? [bpName, renamedBpName] : [bpName]

    for await (const r of loadFromWebMultiple(names, (s: IWebSource, n: string) => s.loadBlueprint(n))) {
        if (renamedBpName !== bpName && r.data?.value.name === renamedBpName) {
            r.data.value.name = bpName
            r.data.value.item.name = itemNameFromBpName(bpName)
        }
        dispatch(setBlueprintPartialWebData(bpName, { blueprint: r }))
    }
}

export default [
    requests
]
export { loadBlueprintLoop}
