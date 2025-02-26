import { multiIncludes } from '../../../common/filter';
import { BlueprintWebData, MaterialWebData } from '../../../web/state';
import { BudgetInfoData, BudgetSheetGetInfo } from '../../services/api/sheets/sheetsBudget';
import { STAGE_INITIALIZING } from '../../services/api/sheets/sheetsStages';
import { BlueprintData, BlueprintSession, BlueprintSessionDiff, CraftState, STEP_DONE, STEP_REFRESH_ERROR, STEP_INACTIVE, STEP_READY, STEP_REFRESH_TO_END, STEP_REFRESH_TO_START, STEP_SAVING, BlueprintStateWebData, BlueprintBudgetMaterials, BlueprintBudget, BlueprintBudgetMaterial, BlueprintMaterial } from '../state/craft';
import { InventoryState } from '../state/inventory';
import * as Sort from "./craftSort"

const initialState: CraftState = {
    blueprints: { },
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

const itemNameFromBpName = (bpName: string): string => bpName.split('Blueprint')[0].trim()
const bpNameFromItemName = (inv: InventoryState, itemName: string): string =>
    inv.blueprints.originalList.items.find(bp => itemNameFromBpName(bp.n) == itemName)?.n
const bpDataFromItemName = (state: CraftState, itemName: string): BlueprintData =>
    Object.values(state.blueprints).find(bp => bp.c?.itemName == itemName)

const BP_ITEM_NAME = 'Item'
const BP_BLUEPRINT_NAME = 'Blueprint'
const itemStringFromName = (bp: BlueprintData, name: string): string =>
    name === bp.name ? BP_BLUEPRINT_NAME : name === bp.c?.itemName ? BP_ITEM_NAME : name

const isLimited = (name: string): boolean => name.endsWith('(L)')

const budgetInfoFromBp = (bp: BlueprintData): BudgetInfoData => ({
    itemName: bp.c?.itemName,
    materials: bp.web?.blueprint.data?.value.materials.map(m => ({
        name: m.name,
        unitValue: m.value
    }))
})

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

const reduceAddBlueprint = (state: CraftState, name: string): CraftState => _applyFilter({
    ...state,
    blueprints: {
        ...state.blueprints,
        [name]: {
            name,
            budget: {
                loading: true,
                stage: STAGE_INITIALIZING,
                hasPage: false,
            },
            session: {
                step: STEP_INACTIVE
            },
            c: {
                itemName: itemNameFromBpName(name),
            }
        }
    }
})

const reduceRemoveBlueprint = (state: CraftState, name: string): CraftState => _applyFilter({
    ...state,
    blueprints: Object.keys(state.blueprints).reduce((result, key) => {
        if (key !== name) {
            result[key] = state.blueprints[key]
        }
        return result;
    }, {})
})

const _materialsFromWeb = (d: BlueprintWebData): BlueprintMaterial[] => {
    if (!d) return undefined;

    const materials: BlueprintMaterial[] = d.materials.map(m => ({ ...m }))
    if (isLimited(d.name)) {
        materials.unshift({
            name: d.name,
            type: 'Blueprint',
            quantity: 1,
            value: 0.01
        })
    }
    materials.unshift({
        ...d.item,
        type: 'Crafted item',
        quantity: 0
    })

    return materials
}

const reduceSetBlueprintPartialWebData = (state: CraftState, bpName: string, change: Partial<BlueprintStateWebData>): CraftState => {
    const web: BlueprintStateWebData = {
        ...state.blueprints[bpName].web,
        ...change
    }
    return {
        ...state,
        blueprints: {
            ...state.blueprints,
            [bpName]: {
                ...state.blueprints[bpName],
                web,
                c: {
                    itemName: state.blueprints[bpName].c.itemName,
                    materials: _materialsFromWeb(web?.blueprint.data?.value)
                }
            }
        }
    }
}

const reduceSetBlueprintQuantity = (state: CraftState, dictionary: { [k: string]: number }): CraftState => _applyFilter({
    ...state,
    blueprints: Object.fromEntries(Object.entries(state.blueprints).map(([n, bp]) => {
        if (!bp.c?.materials) return [n, bp];

        let clickTTCost = 0
        const materials: BlueprintMaterial[] = bp.c.materials.map(m => {
            const available = dictionary[m.name] ?? 0;
            clickTTCost += m.quantity * m.value;
            return {
                ...m,
                available,
                clicks: m.quantity === 0 ? undefined : Math.floor(available / m.quantity)
            }
        });

        const itemMaterial = materials.find(m => m.name == bp.c.itemName)
        const materialBp = materials[bp.name]
        const isBlueprintLimited = materialBp && isLimited(bp.name)
        const isItemLimited = isLimited(bp.c.itemName)
        let residueNeeded = 0
        if (itemMaterial) {
            residueNeeded = Math.max(0, itemMaterial.value - clickTTCost)
            if (residueNeeded > 0 && isItemLimited) {
                const residueMaterials = materials.filter(m => m.type === 'Residue')
                if (residueMaterials.length > 0) {
                    const residueValue = residueMaterials.reduce((result, m) => result + m.value * m.available, 0);
                    const residueClicks = Math.floor(residueValue / residueNeeded);
                    residueMaterials.forEach(m => m.clicks = residueClicks)
                }
            }
        }

        const clicksAvailable = Math.min(...materials.map(m => m.clicks ?? Infinity))
        bp = {
            ...bp,
            c: {
                ...bp.c,
                inventory: {
                    bpClicks: isBlueprintLimited ? (materialBp.clicks == 0 ? undefined : materialBp.clicks) : Infinity,
                    clicksAvailable,
                    limitClickItems: materials.filter(m => m.clicks === clicksAvailable).map(m => m.name),
                    clickTTCost,
                    residueNeeded: isItemLimited ? residueNeeded : undefined,
                },
                materials
            }
        }
        return [n, bp];
    }))
})

const reduceSetBlueprintMaterialTypeAndValue = (state: CraftState, list: MaterialWebData[]): CraftState => {
    if (list.length === 0)
        return state;

    const map = Object.fromEntries(list.map(m => [m.name, m]))
    return {
        ...state,
        blueprints: Object.fromEntries(Object.entries(state.blueprints).map(([n, bp]) => {
            if (!bp.c?.materials) return [n, bp];

            const materials: BlueprintMaterial[] = bp.c.materials.map(m => ({
                ...m,
                type: map[m.name]?.type ?? m.type,
                value: m.value === 0 ? map[m.name]?.value ?? 0 : m.value
            }));

            const addResidue = (name: string, condition: (m: BlueprintMaterial) => boolean): void => {
                if (materials.some(condition)) {
                    materials.push({
                        name,
                        type: 'Residue',
                        quantity: 0,
                        value: 0.01
                    })
                }
            }
            const metalResidueIndex = materials.findIndex(m => m.name === 'Metal Residue');
            if (metalResidueIndex !== -1) {
                materials.splice(metalResidueIndex);
            }
            addResidue('Metal Residue', m => true);
            addResidue('Energy Matter Residue', m => m.type === 'Refined Enmatter');
            addResidue('Robot Component Residue', m => m.type === 'Robot Component');
            addResidue('Animal Oil Residue', m => m.type === 'Animal Oils');
            addResidue('Tailoring Remnants', m => m.name.includes('Leather'));
            materials.push({
                name: 'Shrapnel',
                type: 'Fragment',
                quantity: 0,
                value: 0.0001
            });

            return [n, {
                ...bp,
                c: {
                    ...bp.c,
                    materials
                }
            }];
        }))
    };
}

const reduceSetBlueprintStared = (state: CraftState, name: string, stared: boolean): CraftState => _applyFilter({
    ...state,
    stared: {
        ...state.stared,
        list: stared ? (state.stared.list.includes(name) ? state.stared.list : [...state.stared.list, name]) : state.stared.list.filter(n => n !== name)
    },
})

const reduceShowBlueprintMaterialData = (state: CraftState, name: string, materialName: string): CraftState =>
    _changeBlueprint(state, name, bp => ({ ...bp, chain: materialName }))

const _applyFilter = (state: CraftState): CraftState => {
    let filter = state.stared.filter
    if (filter?.length === 0)
        filter = undefined
    return {
        ...state,
        stared: {
            ...state.stared,
            filter
        },
        c: {
            ...state.c,
            filteredStaredBlueprints: Sort.sortList(state.stared.sortType, (filter ? state.stared.list
                .filter(name => multiIncludes(filter, name)) : state.stared.list)
                .map(name => state.blueprints[name])
                .filter(bp => bp)) // remove undefined
        }
    }
}

const _changeBlueprint = (state: CraftState, name: string, f: (bp: BlueprintData) => BlueprintData): CraftState => _applyFilter({
    ...state,
    blueprints: {
        ...state.blueprints,
        [name]: f(state.blueprints[name])
    }
})

const _changeBudget = (state: CraftState, name: string, change: Partial<BlueprintBudget>): CraftState => 
    _changeBlueprint(state, name, bp => ({ ...bp, budget: { ...bp.budget, change }}))

const _changeBudgetMaterial = (state: CraftState, name: string, materialName: string, change: Partial<BlueprintBudgetMaterial>): CraftState =>
    _changeBlueprint(state, name, bp => ({
        ...bp,
        budget: {
            ...bp.budget,
            sheet: {
                ...bp.budget.sheet,
                materials: {
                    ...bp.budget.sheet.materials,
                    [materialName]: {
                        ...bp.budget.sheet.materials[materialName],
                        ...change
                    }
                }
            }
        }
    }))

const _changeSession = (state: CraftState, name: string, newSession: (bp: BlueprintData) => BlueprintSession): CraftState =>
    _changeBlueprint(state, name, bp => ({ ...bp, session: newSession(bp) }))

const reduceStartBudgetLoading = (state: CraftState, name: string): CraftState => 
    _changeBudget(state, name, { loading: true })

const reduceSetBudgetState = (state: CraftState, name: string, stage: number): CraftState =>
    _changeBudget(state, name, { stage } )

const reduceSetBudgetInfo = (state: CraftState, name: string, info: BudgetSheetGetInfo): CraftState => _changeBlueprint(state, name, bp => {
    if (!bp?.web?.blueprint?.data?.value) return bp

    let clickMUCost = 0
    const materials: BlueprintBudgetMaterials = { }
    for (const m of bp.web.blueprint.data.value.materials) {
        const materialInfo = info.materials[m.name]
        if (materialInfo) {
            materials[m.name] = {
                markup: materialInfo.markup,
                count: materialInfo.current
            }
            clickMUCost += m.quantity * m.value * materialInfo.markup
        }
    }

    const budget: BlueprintBudget = {
        ...bp.budget,
        hasPage: true,
        sheet: {
            clickMUCost,
            total: info.total,
            peds: info.peds,
            materials,
        }
    }
    return { ...bp, budget }
})

const reduceEndBudgetLoading = (state: CraftState, name: string): CraftState =>
    _changeBudget(state, name, { loading: false } )

const reduceErrorBudgetLoading = (state: CraftState, name: string, text: string): CraftState => 
    _changeBudget(state, name, { errorText: text } )

const reduceBuyBudgetMaterial = (state: CraftState, name: string): CraftState =>
    _changeBudget(state, name, { loading: true, stage: STAGE_INITIALIZING })

const reduceBuyBudgetMaterialDone = (state: CraftState, name: string, materialName: string, quantity: number): CraftState => _changeBlueprint(state, name, bp => {
    const m = bp.budget.sheet?.materials[materialName]
    const budget: BlueprintBudget = {
        ...bp.budget,
        loading: false,
        sheet: {
            ...bp.budget.sheet,
            materials: {
                ...bp.budget.sheet.materials,
                [materialName]: {
                    ...m,
                    count: m.count + quantity,
                    buyDone: true
                }
            }
        }
    }
    return { ...bp, budget }
})

const reduceBuyBudgetMaterialClear = (state: CraftState): CraftState => _applyFilter({
    ...state,
    blueprints: Object.fromEntries(Object.entries(state.blueprints).map(([n,bp]) => [n,{
        ...bp,
        budget: bp.budget && {
            ...bp.budget,
            materials: bp.budget.sheet ? Object.fromEntries(Object.entries(bp.budget.sheet.materials).map(([x,m]) => [x,{
                ...m,
                buyDone: undefined
            }])) : []
        }
    }]))
})

const reduceChangeBudgetBuyCost = (state: CraftState, name: string, materialName: string, cost: string): CraftState =>
    _changeBudgetMaterial(state, name, materialName, { buyCost: cost })

const reduceChangeBudgetBuyFee = (state: CraftState, name: string, materialName: string, withFee: boolean): CraftState =>
    _changeBudgetMaterial(state, name, materialName, { withFee })

const reduceStartCraftSession = (state: CraftState, name: string): CraftState => ({
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

const cleanWeb = (state: CraftState): CraftState => {
    const cState: CraftState = JSON.parse(JSON.stringify(state));
    Object.values(cState.blueprints).forEach((bp: BlueprintData) => {
        delete bp.web
        delete bp.chain // no bp recepie so chain is invalid
        delete bp.c.inventory // was it saved?
    })
    return cState;
}

const cleanForSave = (state: CraftState): CraftState => {
    const cState: CraftState = JSON.parse(JSON.stringify(state));
    delete cState.activeSession;
    delete cState.c;

    cState.stared.list = cState.stared.list.filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);
    Object.values(cState.blueprints).forEach((bp: BlueprintData) => {
        bp.budget = {
            ...bp.budget,
            loading: true,
            stage: STAGE_INITIALIZING
        }
        if (bp.budget.sheet) {
            Object.values(bp.budget.sheet.materials).forEach((m: BlueprintBudgetMaterial) => {
                delete m.buyDone
            })
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
    reduceRemoveBlueprint,
    reduceSortBlueprintsByPart,
    reduceSetBlueprintActivePage,
    reduceSetStaredBlueprintsExpanded,
    reduceSetStaredBlueprintsFilter,
    reduceAddBlueprint,
    reduceSetBlueprintPartialWebData,
    reduceSetBlueprintQuantity,
    reduceSetBlueprintMaterialTypeAndValue,
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
    cleanWeb,
    cleanForSave,
    bpNameFromItemName,
    bpDataFromItemName,
    itemStringFromName,
    budgetInfoFromBp,
    isLimited,
}
