import { BudgetSheetInfo } from '../../services/api/sheets/sheetsBudget';
import { STAGE_INITIALIZING } from '../../services/api/sheets/sheetsStages';
import { BlueprintData, BlueprintMaterial, BlueprintSession, BlueprintSessionDiff, BluprintWebData, CraftState, STEP_DONE, STEP_REFRESH_ERROR, STEP_INACTIVE, STEP_READY, STEP_REFRESH_TO_END, STEP_REFRESH_TO_START, STEP_SAVING } from '../state/craft';
import * as Sort from "./craftSort"

const initialState: CraftState = {
    sortType: Sort.SORT_NAME_ASCENDING,
    activeBlueprintsExpanded: true,
    blueprints: []
}

const setState = (state: CraftState, inState: CraftState) => inState

const addBlueprint = (state: CraftState, name: string): CraftState => ({
    ...state,
    blueprints: Sort.sortList(state.sortType, [
        ...state.blueprints,
        {
            name,
            itemName: name.split('Blueprint')[0].trim(),
            expanded: true,
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
    ])
})

const removeBlueprint = (state: CraftState, name: string): CraftState => ({
    ...state,
    blueprints: state.blueprints.filter(bp => bp.name !== name)
})

const sortBlueprintsByPart = (state: CraftState, part: number): CraftState => {
    const sortType = Sort.nextSortType(part, state.sortType)
    return {
        ...state,
        sortType,
        blueprints: Sort.cloneSortList(sortType, state.blueprints)
    }
}

const setActiveBlueprintsExpanded = (state: CraftState, expanded: boolean): CraftState => ({
    ...state,
    activeBlueprintsExpanded: expanded
})

const addBlueprintData = (state: CraftState, data: BluprintWebData): CraftState => ({
    ...state,
    blueprints: Sort.sortList(state.sortType, state.blueprints.map(bp => {
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
                        error: `Loading Error, Code ${data.StatusCode}`
                    }
                }
            }
        } else {
            return bp
        }
    }))
})

const itemNameFromString = (bp: BlueprintData, name: string): string =>
    name === 'Blueprint' ? bp.name : name === 'Item' ? bp.itemName : name

const itemName = (bp: BlueprintData, m: BlueprintMaterial): string =>
    itemNameFromString(bp, m.name)

const setBlueprintQuantity = (state: CraftState, dictionary: { [k: string]: number }): CraftState => {
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

            const itemMaterial = materials.find(m => m.name === 'Item')
            const isLimited = materials.find(m => m.name === 'Blueprint')
            const residueNeeded = itemMaterial.value - clickTTCost
            if (isLimited) {
                const residueMaterial = materials.find(m => m.type === 'Residue')
                residueMaterial.clicks = Math.floor((residueMaterial.value * residueMaterial.available) / residueNeeded)
            }

            const clicksAvailable = Math.min(...materials.map(m => m.clicks ?? Infinity))

            blueprints.push({
                ...bp,
                info: {
                    ...bp.info,
                    bpClicks: isLimited ? (isLimited.clicks == 0 ? undefined : isLimited.clicks) : Infinity,
                    materials,
                },
                inventory: {
                    clicksAvailable,
                    clickTTCost,
                    residueNeeded: isLimited ? residueNeeded : undefined
                }
            })
        }
    }

    Sort.sortList(state.sortType, blueprints)
    return {
        ...state,
        blueprints
    }
}

const setBlueprintExpanded = (state: CraftState, name: string, expanded: boolean): CraftState => ({
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

const changeBudget = (state: CraftState, name: string, data: object): CraftState => ({
    ...state,
    blueprints: Sort.sortList(state.sortType,
        state.blueprints.map(bp => bp.name === name ? { ...bp, budget: { ...bp.budget, ...data } } : bp))
})

const startBudgetLoading = (state: CraftState, name: string): CraftState => 
    changeBudget(state, name, { loading: true })

const setBudgetState = (state: CraftState, name: string, stage: number): CraftState =>
    changeBudget(state, name, { stage } )

const setBudgetInfo = (state: CraftState, name: string, info: BudgetSheetInfo): CraftState => {
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

    Sort.sortList(state.sortType, blueprints)
    return {
        ...state,
        blueprints
    }
}

const endBudgetLoading = (state: CraftState, name: string): CraftState =>
    changeBudget(state, name, { loading: false } )

const errorBudgetLoading = (state: CraftState, name: string, text: string): CraftState => 
    changeBudget(state, name, { error: text } )

const buyBudgetMaterial = (state: CraftState, name: string): CraftState => ({ 
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

const buyBudgetMaterialDone = (state: CraftState, name: string, materialName: string): CraftState => ({
    ...state,
    blueprints: state.blueprints.map(bp => bp.name === name ? {
        ...bp,
        info: {
            ...bp.info,
            materials: bp.info.materials.map(m => m.name === materialName ? {
                ...m, buyDone: true
            } : m)
        },
        budget: {
            ...bp.budget,
            loading: false
        }}
        : bp)
})

const buyBudgetMaterialClear = (state: CraftState): CraftState => ({
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

const changeBudgetMaterial = (state: CraftState, name: string, materialName: string, change: any): CraftState => ({
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

const changeBudgetBuyCost = (state: CraftState, name: string, materialName: string, cost: string): CraftState =>
    changeBudgetMaterial(state, name, materialName, { buyCost: cost })

const changeBudgetBuyFee = (state: CraftState, name: string, materialName: string, withFee: boolean): CraftState =>
    changeBudgetMaterial(state, name, materialName, { withFee })

const changeSession = (state: CraftState, name: string, newSession: (bp: BlueprintData) => BlueprintSession): CraftState => ({
    ...state,
    blueprints: Sort.sortList(state.sortType,
        state.blueprints.map(bp => bp.name === name ? { ...bp, session: newSession(bp) } : bp))
})

const startCraftSession = (state: CraftState, name: string): CraftState => ({
    ...state,
    ...changeSession(state, name, () => ({ step: STEP_REFRESH_TO_START })),
    activeSession: name
})

const errorCraftSession = (state: CraftState, name: string, errorText: string): CraftState => ({
    ...state,
    ...changeSession(state, name, () => ({ step: STEP_REFRESH_ERROR, errorText }))
})

const readyCraftSession = (state: CraftState, name: string): CraftState =>
    changeSession(state, name, () => ({ step: STEP_READY }))

const setCraftSessionDiff = (state: CraftState, name: string, diffMaterials: BlueprintSessionDiff[]): CraftState =>
    changeSession(state, name, (bp) => ({ ...bp.session, diffMaterials }))

const endCraftSession = (state: CraftState, name: string): CraftState =>
    changeSession(state, name, (bp) => ({ ...bp.session, step: STEP_REFRESH_TO_END }))

const saveCraftSession = (state: CraftState, name: string): CraftState =>
    changeSession(state, name, (bp) => ({ ...bp.session, step: STEP_SAVING, stage: STAGE_INITIALIZING }))

const setCraftSaveStage = (state: CraftState, name: string, stage: number): CraftState =>
    changeSession(state, name, (bp) => ({ ...bp.session, stage }))

const doneCraftSession = (state: CraftState, name: string): CraftState => ({
    ...state,
    ...changeSession(state, name, (bp) => ({ ...bp.session, step: STEP_DONE })),
    activeSession: undefined
})

const clearCraftSession = (state: CraftState, name: string): CraftState => ({
    ...state,
    ...changeSession(state, name, () => ({ step: STEP_INACTIVE })),
})

const cleanForSave = (state: CraftState): CraftState => {
    const cState = JSON.parse(JSON.stringify(state));
    delete cState.activeSession;
    cState.blueprints.forEach(bp => {
        bp.info.materials.forEach(m => {
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
    setState,
    itemName,
    itemNameFromString,
    addBlueprint,
    removeBlueprint,
    sortBlueprintsByPart,
    setActiveBlueprintsExpanded,
    addBlueprintData,
    setBlueprintQuantity,
    setBlueprintExpanded,
    startBudgetLoading,
    setBudgetState,
    setBudgetInfo,
    endBudgetLoading,
    buyBudgetMaterial,
    buyBudgetMaterialDone,
    buyBudgetMaterialClear,
    changeBudgetBuyCost,
    changeBudgetBuyFee,
    errorBudgetLoading,
    startCraftSession,
    endCraftSession,
    errorCraftSession,
    readyCraftSession,
    setCraftSessionDiff,
    saveCraftSession,
    setCraftSaveStage,
    doneCraftSession,
    clearCraftSession,
    cleanForSave,
}
