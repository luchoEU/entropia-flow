import { ItemsMap, ItemsState, ItemState, UNIT_PED_K, UNIT_PERCENTAGE, UNIT_PLUS } from "../state/items"

const REFINED_PED = 'PED'
const REFINED_ME = 'Mind Essence'
const REFINED_LME = 'Light Mind Essence'
const REFINED_NB = 'Nutrio Bar'
const REFINED_NX = 'Force Nexus'
const REFINED_SW = 'Vibrant Sweat'
const REFINED_DW = 'Diluted Sweat'
const REFINED_ST = 'Sweetstuff'
const REFINED_FT = 'Fruit'

const refinedMap = {
    [REFINED_NX]: 'nexus',
    [REFINED_ME]: 'me',
    [REFINED_LME]: 'lme',
    [REFINED_NB]: 'nb',
    [REFINED_DW]: 'diluted',
    [REFINED_ST]: 'sweetstuff',
}

const refinedInitialMap: ItemsMap = {
    [REFINED_ME]: {
        name: REFINED_ME,
        markup: {
            value: '120',
            unit: UNIT_PERCENTAGE,
        },
        refined: {
            buyAmount: '100000',
            orderMarkup: '101',
            orderValue: '1000',
            useAmount: '10000',
            refineAmount: '100000',
            kValue: 0.1,
        }
    },
    [REFINED_LME]: {
        name: REFINED_LME,
        markup: {
            value: '110',
            unit: UNIT_PERCENTAGE,
        },
        refined: {
            buyAmount: '100000',
            orderMarkup: '101',
            orderValue: '1000',
            useAmount: '10000',
            refineAmount: '100000',
            kValue: 0.1,
        }
    },
    [REFINED_NB]: {
        name: REFINED_NB,
        markup: {
            value: '150',
            unit: UNIT_PERCENTAGE,
        },
        refined: {
            buyAmount: '1000',
            orderMarkup: '101',
            orderValue: '1000',
            useAmount: '1000',
            refineAmount: '1000',
            kValue: 10,
        }
    },
    [REFINED_NX]: {
        name: REFINED_NX,
        markup: {
            value: '101',
            unit: UNIT_PERCENTAGE,
        },
        refined: {
            buyAmount: '10000',
            kValue: 10,
        }
    },
    [REFINED_SW]: {
        name: REFINED_SW,
        markup: {
            value: '1.6',
            unit: UNIT_PED_K,
        },
        refined: {
            buyAmount: '1000',
            kValue: 0.01,
        }
    },
    [REFINED_DW]: {
        name: REFINED_DW,
        markup: {
            value: '101',
            unit: UNIT_PERCENTAGE,
        },
        refined: {
            buyAmount: '10000',
            kValue: 10,
        }
    },
    [REFINED_ST]: {
        name: REFINED_ST,
        markup: {
            value: '110',
            unit: UNIT_PERCENTAGE,
        },
        refined: {
            buyAmount: '10000',
            kValue: 10,
        }
    },
    [REFINED_FT]: {
        name: REFINED_FT,
        markup: {
            value: '6',
            unit: UNIT_PED_K,
        },
        refined: {
            buyAmount: '1000',
            kValue: 0.01,
        }
    },
}

const initialState: ItemsState = {
    map: refinedInitialMap
}

const _itemChanged = (state: ItemsState, item: string, change: Partial<ItemState>): ItemsState => ({
    ...state,
    map: {
        ...state.map,
        [item]: {
            ...state.map[item],
            ...change
        }
    }
})

const _itemChangedMod = (state: ItemsState, item: string, change: (s?: ItemState) => Partial<ItemState>): ItemsState => ({
    ...state,
    map: {
        ...state.map,
        [item]: {
            ...state.map[item],
            ...change(state.map[item])
        }
    }
})


const reduceStartMaterialEditMode = (state: ItemsState, item: string): ItemsState => _itemChangedMod(
    { ...state, editModeMaterialName: item }, item, s => ({
        ...s,
        user: s.user ?? {
            name: item,
            type: s.web?.item.data?.value.type ?? '',
            value: s.web?.item.data?.value.value ?? 0,
            valueOnEdit: s.web?.item.data?.value.value.toString() ?? '0' }
    })
)

const reduceEndMaterialEditMode = (state: ItemsState): ItemsState => _itemChangedMod(
    { ...state, editModeMaterialName: undefined }, state.editModeMaterialName, s => {
        const web = s.web?.item.data?.value;
        let user = s.user;
        if (user && (!user.type || user.type.toString().trim() === '') && user.value === 0) {
            user = undefined; // cleared
        }
        if (user && web && user.type.toString().trim() === (web.type ?? '') && user.value === web.value) {
            user = undefined; // same as web
        }
        if (user) {
            user.suggestedTypes = undefined;
        }
        return { ...s, user }
    }
)

function _parseFloatOrZero(value: any): number {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
}

const reduceChangeMaterialType = (state: ItemsState, item: string, type: string): ItemsState =>
    _itemChangedMod(state, item, s => ({ user: { ...s?.user, type } }))

const reduceChangeMaterialValue = (state: ItemsState, item: string, value: string): ItemsState =>
    _itemChangedMod(state, item, s => ({ user: { ...s?.user, value: _parseFloatOrZero(value), valueOnEdit: value } }))

const reduceSetMaterialSuggestedTypes = (state: ItemsState, item: string, types: string[]): ItemsState => _itemChangedMod(
    state, item, s => ({
        user: { ...s?.user, suggestedTypes: types }
    }))

const cleanWeb = (state: ItemsState): ItemsState => {
    const cState: ItemsState = JSON.parse(JSON.stringify(state))
    Object.values(cState.map).forEach(v => {
        delete v.web
    })
    return cState
}

const getMarkupMultiplier = (m: ItemState): number => {
    const mu = parseFloat(m?.markup?.value);
    const unitMultiplier = (unit: string): number => {
        switch (unit) {
            case UNIT_PED_K: return 100
            case UNIT_PLUS: return 1
            case UNIT_PERCENTAGE: default: return 0.01
        }
    }
    return isNaN(mu) ? 1 : mu * unitMultiplier(m.markup.unit);
}

const getValueWithMarkup = (q: string, v: string, m: ItemState): number => {
    const nv = parseFloat(v);
    if (m?.markup?.unit !== UNIT_PED_K && isNaN(nv))
        return 0 // moved item, number in parenthesis (N)

    const mu = parseFloat(m?.markup?.value ?? '');
    if (isNaN(mu))
        return nv ?? 0

    const nq = parseInt(q);
    switch (m.markup.unit) {
        case UNIT_PED_K: return nq * mu / 1000
        case UNIT_PLUS: return nv + nq * mu
        case UNIT_PERCENTAGE: default: return nv * mu / 100
    }
}

const cleanForSaveMain = (state: ItemsState): ItemsState => {
    const cState: ItemsState = JSON.parse(JSON.stringify(state))
    Object.values(cState.map).forEach(v => {
        delete v.web
    })
    for (const k of Object.keys(cState.map)) {
        // delete empty objects
        if (Object.keys(cState.map[k]).length === 0)
            delete cState.map[k]
    }
    return cState
}

const cleanForSaveCache = (state: ItemsState): ItemsState => {
    const cState: ItemsState = JSON.parse(JSON.stringify(state))
    Object.values(cState.map).forEach(v => {
        if (v.web) {
            for (const k of Object.keys(v.web)) {
                if (v.web[k].loading)
                    delete v.web[k]
            }
        }
        for (const k of Object.keys(v)) {
            if (k !== 'web')
                delete v[k]
        }
    })
    return cState
}

export {
    initialState,
    refinedMap,
    refinedInitialMap,
    getMarkupMultiplier,
    getValueWithMarkup,
    reduceStartMaterialEditMode,
    reduceEndMaterialEditMode,
    reduceChangeMaterialType,
    reduceChangeMaterialValue,
    reduceSetMaterialSuggestedTypes,
    cleanWeb,
    cleanForSaveMain,
    cleanForSaveCache,
    REFINED_PED,
    REFINED_ME,
    REFINED_LME,
    REFINED_NB,
    REFINED_NX,
    REFINED_SW,
    REFINED_DW,
    REFINED_ST,
    REFINED_FT,
    UNIT_PERCENTAGE,
    UNIT_PED_K,
}
