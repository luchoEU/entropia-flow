import { multiIncludes } from '../../../common/string';
import { BudgetInfoData, BudgetSheetGetInfo } from '../../services/api/sheets/sheetsBudget';
import { STAGE_INITIALIZING } from '../../services/api/sheets/sheetsStages';
import { BP_BLUEPRINT_NAME, BP_ITEM_NAME } from '../middleware/craft';
import { BlueprintData, BlueprintMaterial, BlueprintSession, BlueprintSessionDiff, BlueprintWebData, CraftState, STEP_DONE, STEP_REFRESH_ERROR, STEP_INACTIVE, STEP_READY, STEP_REFRESH_TO_END, STEP_REFRESH_TO_START, STEP_SAVING } from '../state/craft';
import { InventoryState } from '../state/inventory';
import * as Sort from "./craftSort"

const initialState: CraftState = {
    blueprints: [],
    stared: {
        expanded: true,
        sortType: Sort.SORT_NAME_ASCENDING,
        filter: undefined,
        list: []
    },
    c: {
        filteredStaredBlueprints: []
    }
}

const reduceSetState = (state: CraftState, inState: CraftState) => inState

const itemNameFromBpName = (bpName: string) => bpName.split('Blueprint')[0].trim()
const bpNameFromItemName = (inv: InventoryState, itemName: string) =>
    inv.blueprints.originalList.items.find(bp => itemNameFromBpName(bp.n) == itemName)?.n

const reduceSortBlueprintsByPart = (state: CraftState, part: number): CraftState => {
    const sortType = Sort.nextSortType(part, state.stared.sortType)
    return _applyFilter({
        ...state,
        stared: {
            ...state.stared,
            sortType
        }
    })
}

const reduceSetBlueprintActivePage = (state: CraftState, name: string): CraftState => ({
    ...state,
    activePage: name
})

const reduceSetStaredBlueprintsExpanded = (state: CraftState, expanded: boolean): CraftState => ({
    ...state,
    stared: {
        ...state.stared,
        expanded
    }
})

const reduceSetStaredBlueprintsFilter = (state: CraftState, filter: string): CraftState => _applyFilter({
    ...state,
    stared: {
        ...state.stared,
        filter
    }
})

const reduceAddBlueprintLoading = (state: CraftState, name: string): CraftState => _applyFilter({
    ...state,
    blueprints: [
        ...state.blueprints,
        {
            name,
            itemName: itemNameFromBpName(name),
            info: {
                loading: true,
                url: undefined,
                bpClicks: undefined,
                materials: [],
            },
            budget: {
                loading: true,
                stage: STAGE_INITIALIZING,
                hasPage: false,
            },
            session: {
                step: STEP_INACTIVE
            }
        }
    ]
})

const reduceRemoveBlueprint = (state: CraftState, name: string): CraftState => _applyFilter({
    ...state,
    blueprints: state.blueprints.filter(bp => bp.name !== name)
})

const reduceAddBlueprintData = (state: CraftState, data: BlueprintWebData): CraftState => _applyFilter({
    ...state,
    blueprints: state.blueprints.map(bp => {
        if (bp.name === data.Name) {
            if (data.StatusCode === 0) {
               return {
                    ...bp,
                    info: {
                        ...bp.info,
                        loading: false,
                        url: data.Url,
                        materials: data.Material.map(m => ({
                            name: m.Name,
                            quantity: Number(m.Quantity),
                            type: m.Type,
                            value: Number(m.Value),
                        }))
                    }
                }
            } else {
                return {
                    ...bp,
                    info: {
                        ...bp.info,
                        loading: false,
                        url: data.Url,
                        errorText: `Loading Error, Code ${data.StatusCode}: ${data.Text}`
                    }
                }
            }
        } else {
            return bp
        }
    })
})

const itemNameFromString = (bp: BlueprintData, name: string): string =>
    name === BP_BLUEPRINT_NAME ? bp.name : name === BP_ITEM_NAME ? bp.itemName : name

const itemStringFromName = (bp: BlueprintData, name: string): string =>
    name === bp.name ? BP_BLUEPRINT_NAME : name === bp.itemName ? BP_ITEM_NAME : name

const itemName = (bp: BlueprintData, m: BlueprintMaterial): string =>
    itemNameFromString(bp, m.name)

const budgetInfoFromBp = (bp: BlueprintData): BudgetInfoData => ({
    itemName: bp.itemName,
    materials: bp.info.materials.map(m => ({
        name: m.name,
        unitValue: m.value
    }))
})

const reduceSetBlueprintQuantity = (state: CraftState, dictionary: { [k: string]: number }): CraftState => {
    let blueprints: BlueprintData[] = []
    for (let bp of state.blueprints) {
        if (bp.info.loading) {
            blueprints.push(bp)
        } else {
            let clickTTCost = 0
            const materials: BlueprintMaterial[] = []
            for (const m of bp.info.materials) {
                const name = itemName(bp, m)
                const available = dictionary[name] ?? 0
                materials.push({
                    ...m,
                    available,
                    clicks: m.quantity === 0 ? undefined : Math.floor(available / m.quantity)
                })
                clickTTCost += m.quantity * m.value
            }

            const itemMaterial = materials.find(m => m.name === BP_ITEM_NAME)
            const isLimited = materials.find(m => m.name === BP_BLUEPRINT_NAME)
            let residueNeeded = 0
            if (itemMaterial) {
                residueNeeded = Math.max(0, itemMaterial.value - clickTTCost)
                if (residueNeeded > 0 && isLimited) {
                    const residueMaterial = materials.find(m => m.type === 'Residue')
                    residueMaterial.clicks = Math.floor((residueMaterial.value * residueMaterial.available) / residueNeeded)
                }
            }

            const clicksAvailable = Math.min(...materials.map(m => m.clicks ?? Infinity))
            const limitClickItems = materials.filter(m => m.clicks === clicksAvailable).map(m => m.name)

            blueprints.push({
                ...bp,
                info: {
                    ...bp.info,
                    bpClicks: isLimited ? (isLimited.clicks == 0 ? undefined : isLimited.clicks) : Infinity,
                    materials,
                },
                inventory: {
                    clicksAvailable,
                    limitClickItems,
                    clickTTCost,
                    residueNeeded: isLimited ? residueNeeded : undefined
                }
            })
        }
    }

    return _applyFilter({
        ...state,
        blueprints
    })
}

const reduceSetBlueprintExpanded = (state: CraftState, name: string, expanded: boolean): CraftState => _applyFilter({
    ...state,
    blueprints: state.blueprints.map(
        bp => bp.name === name ?
        {
            ...bp,
            budget: {
                ...bp.budget,
                ...(expanded ? { // reload budget
                    loading: true,
                    stage: STAGE_INITIALIZING,
                    hasPage: false,
                } : {})
            },
            expanded
        }
        : bp)
})

const reduceSetBlueprintStared = (state: CraftState, name: string, stared: boolean): CraftState => _applyFilter({
    ...state,
    stared: {
        ...state.stared,
        list: stared ? (state.stared.list.includes(name) ? state.stared.list : [...state.stared.list, name]) : state.stared.list.filter(n => n !== name)
    },
    blueprints: state.blueprints.map(bp => bp.name === name ? { ...bp, expanded: stared } : bp)
})

const reduceShowBlueprintMaterialData = (state: CraftState, name: string, materialName: string): CraftState => _applyFilter({
    ...state,
    blueprints: state.blueprints.map(bp =>
        bp.name === name ? { ...bp, chain: materialName } :
        (bp.itemName == materialName ? { ...bp, chain: undefined } : bp))
})

const _applyFilter = (state: CraftState): CraftState => {
    if (state.stared.filter?.length === 0)
        state.stared.filter = undefined
    const filter = state.stared.filter
    state.c.filteredStaredBlueprints = Sort.sortList(state.stared.sortType, (filter ? state.stared.list
        .filter(name => multiIncludes(filter, name)) : state.stared.list)
        .map(name => state.blueprints.find(bp => bp.name === name)))
    return state
}

const _changeBudget = (state: CraftState, name: string, data: object): CraftState => _applyFilter({
    ...state,
    blueprints: state.blueprints.map(bp => bp.name === name ? { ...bp, budget: { ...bp.budget, ...data } } : bp)
})

const reduceStartBudgetLoading = (state: CraftState, name: string): CraftState => 
    _changeBudget(state, name, { loading: true })

const reduceSetBudgetState = (state: CraftState, name: string, stage: number): CraftState =>
    _changeBudget(state, name, { stage } )

const reduceSetBudgetInfo = (state: CraftState, name: string, info: BudgetSheetGetInfo): CraftState => {
    let blueprints: BlueprintData[] = []
    for (let bp of state.blueprints) {
        if (bp.name !== name) {
            blueprints.push(bp)
            continue
        }

        let clickMUCost = 0
        const materials: BlueprintMaterial[] = []
        for (const m of bp.info.materials) {
            const materialInfo = info.materials[m.name]
            if (materialInfo === undefined) {
                materials.push(m)
            } else {
                materials.push({
                    ...m,
                    markup: materialInfo.markup,
                    budgetCount: materialInfo.current
                })
                clickMUCost += m.quantity * m.value * materialInfo.markup
            }
        }

        blueprints.push({
            ...bp,
            info: {
                ...bp.info,
                materials,
            },
            budget: {
                ...bp.budget,
                hasPage: true,
                clickMUCost,
                total: info.total,
                peds: info.peds
            }
        })
    }

    return _applyFilter({
        ...state,
        blueprints
    })
}

const reduceEndBudgetLoading = (state: CraftState, name: string): CraftState =>
    _changeBudget(state, name, { loading: false } )

const reduceErrorBudgetLoading = (state: CraftState, name: string, text: string): CraftState => 
    _changeBudget(state, name, { error: text } )

const reduceBuyBudgetMaterial = (state: CraftState, name: string): CraftState => _applyFilter({ 
    ...state,
    blueprints: state.blueprints.map(bp => bp.name === name ? {
        ...bp,
        budget: {
            ...bp.budget,
            loading: true,
            stage: STAGE_INITIALIZING
        }}
        : bp)
})

const reduceBuyBudgetMaterialDone = (state: CraftState, name: string, materialName: string, quantity: number): CraftState => _applyFilter({
    ...state,
    blueprints: state.blueprints.map(bp => bp.name === name ? {
        ...bp,
        info: {
            ...bp.info,
            materials: bp.info.materials.map(m => m.name === materialName ? {
                ...m,
                budgetCount: m.budgetCount + quantity,
                buyDone: true
            } : m)
        },
        budget: {
            ...bp.budget,
            loading: false
        }}
        : bp)
})

const reduceBuyBudgetMaterialClear = (state: CraftState): CraftState => _applyFilter({
    ...state,
    blueprints: state.blueprints.map(bp => ({
        ...bp,
        info: {
            ...bp.info,
            materials: bp.info.materials.map(m => ({
                ...m,
                buyDone: undefined
            }))
        }
    }))
})

const _changeBudgetMaterial = (state: CraftState, name: string, materialName: string, change: any): CraftState => _applyFilter({
    ...state,
    blueprints: state.blueprints.map(bp => bp.name === name ? {
        ...bp,
        info: {
            ...bp.info,
            materials: bp.info.materials.map(m => m.name === materialName ? {
                ...m, ...change
            } : m)
        }}
        : bp)
})

const reduceChangeBudgetBuyCost = (state: CraftState, name: string, materialName: string, cost: string): CraftState =>
    _changeBudgetMaterial(state, name, materialName, { buyCost: cost })

const reduceChangeBudgetBuyFee = (state: CraftState, name: string, materialName: string, withFee: boolean): CraftState =>
    _changeBudgetMaterial(state, name, materialName, { withFee })

const _changeSession = (state: CraftState, name: string, newSession: (bp: BlueprintData) => BlueprintSession): CraftState => _applyFilter({
    ...state,
    blueprints: state.blueprints.map(bp => bp.name === name ? { ...bp, session: newSession(bp) } : bp)
})

const reduceStartCraftSession = (state: CraftState, name: string): CraftState => ({
    ...state,
    ..._changeSession(state, name, () => ({ step: STEP_REFRESH_TO_START })),
    activeSession: name
})

const reduceErrorCraftSession = (state: CraftState, name: string, errorText: string): CraftState => ({
    ...state,
    ..._changeSession(state, name, () => ({ step: STEP_REFRESH_ERROR, errorText }))
})

const reduceReadyCraftSession = (state: CraftState, name: string): CraftState =>
    _changeSession(state, name, () => ({ step: STEP_READY }))

const reduceSetCraftSessionDiff = (state: CraftState, name: string, diffMaterials: BlueprintSessionDiff[]): CraftState =>
    _changeSession(state, name, (bp) => ({ ...bp.session, diffMaterials }))

const reduceEndCraftSession = (state: CraftState, name: string): CraftState =>
    _changeSession(state, name, (bp) => ({ ...bp.session, step: STEP_REFRESH_TO_END }))

const reduceSaveCraftSession = (state: CraftState, name: string): CraftState =>
    _changeSession(state, name, (bp) => ({ ...bp.session, step: STEP_SAVING, stage: STAGE_INITIALIZING }))

const reduceSetCraftSaveStage = (state: CraftState, name: string, stage: number): CraftState =>
    _changeSession(state, name, (bp) => ({ ...bp.session, stage }))

const reduceDoneCraftSession = (state: CraftState, name: string): CraftState => ({
    ...state,
    ..._changeSession(state, name, (bp) => ({ ...bp.session, step: STEP_DONE })),
    activeSession: undefined
})

const reduceClearCraftSession = (state: CraftState, name: string): CraftState => ({
    ...state,
    ..._changeSession(state, name, () => ({ step: STEP_INACTIVE })),
    activeSession: undefined,
    c: undefined
})

const reduceSetCraftActivePlanet = (state: CraftState, name: string): CraftState => ({
    ...state,
    activePlanet: name
})

const cleanForSave = (state: CraftState): CraftState => {
    const cState = JSON.parse(JSON.stringify(state));
    delete cState.activeSession;
    delete cState.c;

    // remove duplicates
    const blueprintsByName = {};
    cState.blueprints = cState.blueprints.reduce((list: BlueprintData[], bp: BlueprintData) => {
        if (!blueprintsByName[bp.name]) {
            blueprintsByName[bp.name] = true;
            list.push(bp);
        }
        return list
    }, []);
    cState.stared.list = cState.stared.list.filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);

    cState.blueprints.forEach((bp: BlueprintData) => {
        bp.info.materials.forEach((m: BlueprintMaterial) => {
            delete m.buyDone
        })
        bp.budget = {
            ...bp.budget,
            loading: true,
            stage: STAGE_INITIALIZING
        }
        if (bp.session.step !== STEP_INACTIVE) {
            bp.session.step = STEP_DONE
        }
    })
    return cState;
}

export {
    initialState,
    reduceSetState,
    itemName,
    itemNameFromString,
    itemStringFromName,
    budgetInfoFromBp,
    reduceRemoveBlueprint,
    reduceSortBlueprintsByPart,
    reduceSetBlueprintActivePage,
    reduceSetStaredBlueprintsExpanded,
    reduceSetStaredBlueprintsFilter,
    reduceAddBlueprintLoading,
    reduceAddBlueprintData,
    reduceSetBlueprintQuantity,
    reduceSetBlueprintExpanded,
    reduceSetBlueprintStared,
    reduceShowBlueprintMaterialData,
    reduceStartBudgetLoading,
    reduceSetBudgetState,
    reduceSetBudgetInfo,
    reduceEndBudgetLoading,
    reduceBuyBudgetMaterial,
    reduceBuyBudgetMaterialDone,
    reduceBuyBudgetMaterialClear,
    reduceChangeBudgetBuyCost,
    reduceChangeBudgetBuyFee,
    reduceErrorBudgetLoading,
    reduceStartCraftSession,
    reduceEndCraftSession,
    reduceErrorCraftSession,
    reduceReadyCraftSession,
    reduceSetCraftSessionDiff,
    reduceSaveCraftSession,
    reduceSetCraftSaveStage,
    reduceDoneCraftSession,
    reduceSetCraftActivePlanet,
    reduceClearCraftSession,
    cleanForSave,
    bpNameFromItemName,
}
