import { multiIncludes } from '../../../common/filter';
import { BlueprintWebData, ItemWebData } from '../../../web/state';
import { BudgetInfoData, BudgetSheetGetInfo } from '../../services/api/sheets/sheetsBudget';
import { STAGE_INITIALIZING } from '../../services/api/sheets/sheetsStages';
import { BlueprintData, BlueprintSession, BlueprintSessionDiff, CraftState, STEP_DONE, STEP_REFRESH_ERROR, STEP_INACTIVE, STEP_READY, STEP_REFRESH_TO_END, STEP_REFRESH_TO_START, STEP_SAVING, BlueprintStateWebData, BlueprintBudgetMaterials, BlueprintBudget, BlueprintBudgetMaterial, BlueprintMaterial, CraftingWebData, CraftOptions, CraftingUserData } from '../state/craft';
import { InventoryState } from '../state/inventory';
import * as Sort from "./craftSort"
import { getBlueprintList } from './inventory';

const initialState: CraftState = {
    blueprints: { },
    stared: {
        expanded: true,
        sortType: Sort.SORT_NAME_ASCENDING,
        filter: undefined,
        list: []
    },
    options: {
        custom: false,
        owned: false
    },
    c: {
        filteredStaredBlueprints: [],
        residues: {}
    }
}

const reduceSetState = (state: CraftState, inState: CraftState): CraftState => ({
    ...inState,
    blueprints: Object.fromEntries(Object.entries(inState.blueprints).map(([name, bp]) => [name, {
        ...bp,
        c: {
            itemName: itemNameFromBpName(bp.name),
            materials: _materialsFromUserAndWeb(bp.name, bp.user, bp.web?.blueprint.data?.value)
        }
    }]))
})

const itemNameFromBpName = (bpName: string): string => bpName.split('Blueprint')[0].trim()
const bpNameFromItemName = (inv: InventoryState, itemName: string): string =>
    getBlueprintList(inv).find(bp => itemNameFromBpName(bp.n) == itemName)?.n
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

function _addItemBlueprint(bpName: string, item: { name: string, value: number }, materials: BlueprintMaterial[]) {
    if (isLimited(bpName)) {
        materials.unshift({
            name: bpName,
            type: 'Blueprint',
            quantity: 1,
            value: 0.01
        })
    }
    materials.unshift({
        ...item,
        type: 'Crafted item',
        quantity: 0
    })
}

const _materialsFromUserAndWeb = (bpName: string, user?: CraftingUserData, web?: BlueprintWebData): BlueprintMaterial[] => {
    if (!user && !web) return undefined;

    const materials: BlueprintMaterial[] = user?.materials.map(m => {
        let quantity = parseInt(m.quantity)
        if (isNaN(quantity)) quantity = 0
        return {
            name: m.name,
            type: 'Material',
            quantity,
            value: 0
        }
    }) ?? web.materials.map(m => ({ ...m }))
    if (web) {
        _addItemBlueprint(web.name, web.item, materials)
    } else {
        _addItemBlueprint(bpName, { name: itemNameFromBpName(bpName), value: 0 }, materials)
    }
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
                    ...state.blueprints[bpName].c,
                    materials: _materialsFromUserAndWeb(bpName, state.blueprints[bpName].user, web?.blueprint.data?.value)
                }
            }
        }
    }
}

const reduceSetBlueprintList = (state: CraftState, list: string[]): CraftState => ({
    ...state,
    web: {
        ...state.web,
        simpleBlueprintList: list
    }
})

const _calcClicks = (state: CraftState): CraftState => ({
    ...state,
    blueprints: Object.fromEntries(Object.entries(state.blueprints).map(([n, bp]) => {
        if (!bp.c?.materials) return [n, bp];

        const materials = bp.c.materials;
        const itemMaterial: BlueprintMaterial = materials.find(m => m.name === bp.c.itemName)
        const materialBp: BlueprintMaterial = materials.find(m => m.name === bp.name)
        const isBlueprintLimited = materialBp && isLimited(bp.name)
        const isItemLimited = isLimited(bp.c.itemName)
        const clickTTCost = bp.c.materials.reduce((result, m) => result + m.quantity * m.value, 0)
        let residueNeeded = 0
        if (itemMaterial) {
            residueNeeded = Math.max(0, itemMaterial.value - clickTTCost)
            if (residueNeeded > 0 && isItemLimited) {
                const residueMaterials = materials.filter(m => m.type === 'Residue')
                if (residueMaterials.some(m => m.available !== undefined)) {
                    const residueValue = residueMaterials.reduce((result, m) => result + m.value * (m.available ?? 0), 0);
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
                clicks: {
                    bp: isBlueprintLimited ? (materialBp.clicks == 0 ? undefined : materialBp.clicks) : Infinity,
                    available: clicksAvailable,
                    limitingItems: materials.filter(m => m.clicks === clicksAvailable).map(m => itemStringFromName(bp, m.name)),
                    ttCost: clickTTCost,
                    residueNeeded: isItemLimited ? residueNeeded : undefined,
                }
            }
        }
        return [n, bp];
    }))
})

const reduceSetBlueprintQuantity = (state: CraftState, dictionary: { [k: string]: number }): CraftState => _applyFilter(_calcClicks({
    ...state,
    blueprints: Object.fromEntries(Object.entries(state.blueprints).map(([n, bp]) => {
        if (!bp.c?.materials) return [n, bp];

        const materials: BlueprintMaterial[] = bp.c.materials.map(m => {
            const available = dictionary[m.name] ?? 0;
            return {
                ...m,
                available,
                clicks: m.quantity === 0 ? undefined : Math.floor(available / m.quantity)
            }
        });

        bp = {
            ...bp,
            c: {
                ...bp.c,
                owned: dictionary[bp.name] !== undefined,
                materials
            }
        }
        return [n, bp];
    })),
    c: {
        ...state.c,
        residues: Object.keys(_residueMap).reduce((result, name) => ({ ...result, [name]: dictionary[name] }), {})
    }
}))

const _residueMap: { [k: string]: (m: BlueprintMaterial) => boolean } = {
    'Metal Residue': () => true,
    'Energy Matter Residue': (m: BlueprintMaterial) => m.type === 'Refined Enmatter',
    'Robot Component Residue': (m: BlueprintMaterial) => m.type === 'Robot Component',
    'Animal Oil Residue': (m: BlueprintMaterial) => m.type === 'Animal Oils',
    'Tailoring Remnants': (m: BlueprintMaterial) => m.name.includes('Leather')
}
const reduceSetBlueprintMaterialTypeAndValue = (state: CraftState, list: ItemWebData[]): CraftState => {
    if (list.length === 0)
        return state;

    const map = Object.fromEntries(list.map(m => [m.name, m]))
    const s = {
        ...state,
        blueprints: Object.fromEntries(Object.entries(state.blueprints).map(([n, bp]) => {
            if (!bp.c?.materials) return [n, bp];

            const materials: BlueprintMaterial[] = bp.c.materials.map(m => {
                let type = map[m.name]?.type;
                return {
                    ...m,
                    type: !type || type.toString().trim() === '' ? 'Material' : type,
                    value: map[m.name]?.value ?? m.value
                }
            });

            const metalResidueIndex = materials.findIndex(m => m.name === 'Metal Residue');
            if (metalResidueIndex !== -1) {
                materials.splice(metalResidueIndex)
            }
            Object.entries(_residueMap).forEach(([name, condition]) => {
                if (materials.some(condition)) {
                    materials.push({ name, type: 'Residue', quantity: 0, value: 0.01, available: state.c.residues[name] })
                }
            })
            materials.push({ name: 'Shrapnel', type: 'Fragment', quantity: 0, value: 0.0001 });

            return [n, {
                ...bp,
                c: {
                    ...bp.c,
                    materials
                }
            }];
        }))
    }
    const s1 = _calcClicks(s)
    return s1
}

const reduceSetBlueprintSuggestedMaterials = (state: CraftState, name: string, list: string[]): CraftState => _changeBlueprint(state, name, bp => ({
    ...bp,
    c: {
        ...bp.c,
        suggestedMaterials: { index: bp.c?.suggestedMaterials?.index ?? -1, list }
    }
}))

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

const _changeBlueprint = (state: CraftState, name: string | undefined, f: (bp: BlueprintData) => BlueprintData): CraftState => name ?_applyFilter({
    ...state,
    blueprints: {
        ...state.blueprints,
        [name]: f(state.blueprints[name])
    }
}) : state

const _changeBudget = (state: CraftState, name: string, change: Partial<BlueprintBudget>): CraftState => 
    _changeBlueprint(state, name, bp => ({ ...bp, budget: { ...bp.budget, ...change }}))

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

const _changeSession = (state: CraftState, name: string | undefined, newSession: (bp: BlueprintData) => BlueprintSession): CraftState =>
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

const reduceDoneCraftSession = (state: CraftState, name: string | undefined): CraftState => ({
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

const reduceSetCraftOptions = (state: CraftState, change: Partial<CraftOptions>): CraftState => ({
    ...state,
    options: {
        ...state.options,
        ...change
    }
})

const reduceStartBlueprintEditMode = (state: CraftState, name: string): CraftState => {
    const bp = state.blueprints[name]
    const web = bp.web?.blueprint?.data?.value
    return _changeBlueprint({ ...state, editModeBlueprintName: name }, name, bp => ({
        ...bp,
        user: bp.user ?? { materials: web?.materials.map(m => ({ name: m.name, quantity: m.quantity.toString() })) ?? [] }
    }))
}

const reduceEndBlueprintEditMode = (state: CraftState): CraftState => {
    const name = state.editModeBlueprintName
    if (!name) return state
    const bp = state.blueprints[name]
    const web = bp.web?.blueprint?.data?.value
    return _changeBlueprint({ ...state, editModeBlueprintName: undefined }, name, bp => {
        let user = bp.user?.materials.length === 0 ? undefined : bp.user
        if (user && web &&
            user.materials.length !== web.materials.length &&
            user.materials.every((item, index) => 
                item.name === web.materials[index].name && parseInt(item.quantity) === web.materials[index].quantity
            )
        ) {
            user = undefined // same as web
        }

        return {
            ...bp,
            user,
            c: {
                ...bp.c,
                materials: _materialsFromUserAndWeb(name, user, web),
                suggestedMaterials: undefined
            }
        }
    })
}

const reduceAddBlueprintMaterial = (state: CraftState, name: string): CraftState => _changeBlueprint(state, name, bp => ({
    ...bp,
    user: {
        materials: [ ...bp.user?.materials ?? [], { name: '', quantity: '0' } ]
    }
}))

const reduceRemoveBlueprintMaterial = (state: CraftState, name: string, materialIndex: number): CraftState => _changeBlueprint(state, name, bp => ({
    ...bp,
    user: {
        materials: bp.user?.materials.filter((_, i) => i !== materialIndex)
    }
}))

const reduceChangeBlueprintMaterialQuantity = (state: CraftState, name: string, materialIndex: number, quantity: string): CraftState => _changeBlueprint(state, name, bp => ({
    ...bp,
    user: {
        materials: bp.user?.materials.map((m, i) => i === materialIndex ? { ...m, quantity } : m)
    }
}))

const reduceChangeBlueprintMaterialName = (state: CraftState, name: string, materialIndex: number, materialName: string): CraftState => _changeBlueprint(state, name, bp => ({
    ...bp,
    user: {
        materials: bp.user?.materials.map((m, i) => i === materialIndex ? { ...m, name: materialName } : m)
    },
    c: {
        ...bp.c,
        suggestedMaterials: { index: materialIndex, list: bp.c?.suggestedMaterials?.list ?? [] }
    }
}))

const reduceMoveBlueprintMaterial = (state: CraftState, name: string, materialIndex: number, newIndex: number): CraftState => _changeBlueprint(state, name, bp => {
    const materials = bp.user?.materials ?? []
    const material = materials.splice(materialIndex, 1)[0]
    materials.splice(newIndex, 0, material)
    return { ...bp, user: { materials } }
})

const cleanWeb = (state: CraftState): CraftState => {
    const cState: CraftState = JSON.parse(JSON.stringify(state));
    Object.values(cState.blueprints).forEach((bp: BlueprintData) => {
        delete bp.web
        delete bp.chain // no bp recepie so chain is invalid
        delete bp.c // was it saved?
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
        delete bp.c
    })
    return cState;
}

export {
    initialState,
    reduceSetState,
    reduceRemoveBlueprint,
    reduceSortBlueprintsByPart,
    reduceSetStaredBlueprintsFilter,
    reduceAddBlueprint,
    reduceSetBlueprintPartialWebData,
    reduceSetBlueprintList,
    reduceSetBlueprintQuantity,
    reduceSetBlueprintMaterialTypeAndValue,
    reduceSetBlueprintSuggestedMaterials,
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
    reduceSetCraftOptions,
    reduceStartBlueprintEditMode,
    reduceEndBlueprintEditMode,
    reduceAddBlueprintMaterial,
    reduceMoveBlueprintMaterial,
    reduceRemoveBlueprintMaterial,
    reduceChangeBlueprintMaterialQuantity,
    reduceChangeBlueprintMaterialName,
    cleanWeb,
    cleanForSave,
    bpNameFromItemName,
    bpDataFromItemName,
    itemStringFromName,
    budgetInfoFromBp,
    isLimited,
}
