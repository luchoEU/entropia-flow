import { BudgetSheetInfo } from '../../services/api/sheets/sheetsBudget';
import { STAGE_INITIALIZING } from '../../services/api/sheets/sheetsStages';
import { BlueprintData, BlueprintMaterial, BlueprintSession, BluprintWebData, CraftState, STEP_ERROR, STEP_INACTIVE, STEP_READY, STEP_REFRESH_TO_END, STEP_REFRESH_TO_START, STEP_SAVING } from '../state/craft';

const initialState: CraftState = {
    blueprints: []
}

const setState = (state: CraftState, inState: CraftState) => inState

const addBlueprint = (state: CraftState, name: string): CraftState => ({
    blueprints: [
        ...state.blueprints,
        {
            name,
            itemName: name.split('Blueprint')[0].trim(),
            expanded: true,
            info: {
                loading: true,
                url: undefined,
                materials: [],
            },
            budget: {
                loading: false,
                stage: STAGE_INITIALIZING
            },
            session: {
                step: STEP_INACTIVE
            }
        }
    ]
})

const removeBlueprint = (state: CraftState, name: string): CraftState => ({
    blueprints: state.blueprints.filter(bp => bp.name !== name)
})

const addBlueprintData = (state: CraftState, data: BluprintWebData): CraftState => ({
    blueprints: state.blueprints.map(bp => {
        if (bp.name === data.Name) {
            if (data.StatusCode === 0) {
               return {
                    ...bp,
                    info: {
                        loading: false,
                        url: data.Url,
                        materials: data.Material.map(m => ({
                            name: m.Name,
                            quantity: m.Quantity,
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
    })
})

const setBlueprintQuantity = (state: CraftState, dictionary: { [k: string]: number }): CraftState => {
    let blueprints: BlueprintData[] = []    
    for (let bp of state.blueprints) {
        if (bp.info.loading) {
            blueprints.push(bp)
        } else {
            let clickTTCost = 0
            const materials: BlueprintMaterial[] = []
            for (const m of bp.info.materials) {
                const name = m.name === 'Blueprint' ? bp.name : m.name === 'Item' ? bp.itemName : m.name
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

    return { blueprints }
}

const setBlueprintExpanded = (state: CraftState, name: string, expanded: boolean): CraftState => ({
    blueprints: state.blueprints.map(bp => bp.name === name ? { ...bp, expanded } : bp)
})

const changeBudget = (state: CraftState, name: string, data: object): CraftState => ({
    blueprints: state.blueprints.map(bp => bp.name === name ? { ...bp, budget: { ...bp.budget, ...data } } : bp)
})

const startBudgetLoading = (state: CraftState, name: string): CraftState => 
    changeBudget(state, name, { loading: true } )

const setBudgetState = (state: CraftState, name: string, stage: number): CraftState =>
    changeBudget(state, name, { stage } )

const setBudgetInfo = (state: CraftState, name: string, info: BudgetSheetInfo): CraftState => {
    let blueprints: BlueprintData[] = []    
    for (let bp of state.blueprints) {
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
                clickMUCost += m.quantity * m.value * m.markup
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
                clickMUCost,
                total: info.total,
                peds: info.peds
            }
        })
    }

    return { blueprints }
}

const endBudgetLoading = (state: CraftState, name: string): CraftState =>
    changeBudget(state, name, { loading: false } )

const errorBudgetLoading = (state: CraftState, name: string, text: string): CraftState => 
    changeBudget(state, name, { error: text } )

const changeSession = (state: CraftState, name: string, newSession: (bp: BlueprintData) => BlueprintSession): CraftState => ({
    blueprints: state.blueprints.map(bp => bp.name === name ? { ...bp, session: newSession(bp) } : bp)
})

const startCraftSession = (state: CraftState, name: string): CraftState => ({
    ...changeSession(state, name, () => ({ step: STEP_REFRESH_TO_START })),
    activeSession: state.blueprints.find(bp => bp.name === name)
})

const errorCraftSession = (state: CraftState, name: string, errorText: string): CraftState => ({
    ...changeSession(state, name, () => ({ step: STEP_ERROR, errorText })),
    activeSession: undefined
})

const readyCraftSession = (state: CraftState, name: string): CraftState =>
    changeSession(state, name, (bp) => ({ step: STEP_READY, startMaterials: bp.info.materials.map(m => ({ n: m.name, q: m.quantity })) }))

const endCraftSession = (state: CraftState, name: string): CraftState =>
    changeSession(state, name, (bp) => ({ ...bp.session, step: STEP_REFRESH_TO_END }))

const saveCraftSession = (state: CraftState, name: string): CraftState =>
    changeSession(state, name, (bp) => ({ ...bp.session, step: STEP_SAVING, stage: STAGE_INITIALIZING }))

const setCraftSaveStage = (state: CraftState, name: string, stage: number): CraftState =>
    changeSession(state, name, (bp) => ({ ...bp.session, stage }))

const doneCraftSession = (state: CraftState, name: string): CraftState => ({
    ...changeSession(state, name, () => ({ step: STEP_INACTIVE })),
    activeSession: undefined
})

export {
    initialState,
    setState,
    addBlueprint,
    removeBlueprint,
    addBlueprintData,
    setBlueprintQuantity,
    setBlueprintExpanded,
    startBudgetLoading,
    setBudgetState,
    setBudgetInfo,
    endBudgetLoading,
    errorBudgetLoading,
    startCraftSession,
    endCraftSession,
    errorCraftSession,
    readyCraftSession,
    saveCraftSession,
    setCraftSaveStage,
    doneCraftSession,
}
