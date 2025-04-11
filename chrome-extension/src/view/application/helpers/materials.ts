import { MarkupUnit, MaterialsMap, MaterialsState, MaterialState, MaterialStateCalcData, MaterialStateWebData, UNIT_PED_K, UNIT_PERCENTAGE, UNIT_PLUS } from "../state/materials"

const MATERIAL_PED = 'PED'
const MATERIAL_ME = 'Mind Essence'
const MATERIAL_LME = 'Light Mind Essence'
const MATERIAL_NB = 'Nutrio Bar'
const MATERIAL_NX = 'Force Nexus'
const MATERIAL_SW = 'Vibrant Sweat'
const MATERIAL_DW = 'Diluted Sweat'
const MATERIAL_ST = 'Sweetstuff'
const MATERIAL_FT = 'Fruit'

const materialMap = {
    [MATERIAL_NX]: 'nexus',
    [MATERIAL_ME]: 'me',
    [MATERIAL_LME]: 'lme',
    [MATERIAL_NB]: 'nb',
    [MATERIAL_DW]: 'diluted',
    [MATERIAL_ST]: 'sweetstuff',
}

const refinedInitialMap: MaterialsMap = {
    [MATERIAL_ME]: {
        buyMarkup: '120',
        buyAmount: '100000',
        orderMarkup: '101',
        orderValue: '1000',
        markupUnit: UNIT_PERCENTAGE,
        useAmount: '10000',
        refineAmount: '100000',
        c: {
            name: MATERIAL_ME,
            kValue: 0.1,
        }
    },
    [MATERIAL_LME]: {
        buyMarkup: '110',
        buyAmount: '100000',
        orderMarkup: '101',
        orderValue: '1000',
        markupUnit: UNIT_PERCENTAGE,
        useAmount: '10000',
        refineAmount: '100000',
        c: {
            name: MATERIAL_LME,
            kValue: 0.1,
        }
    },
    [MATERIAL_NB]: {
        buyMarkup: '150',
        buyAmount: '1000',
        orderMarkup: '101',
        orderValue: '1000',
        markupUnit: UNIT_PERCENTAGE,
        useAmount: '1000',
        refineAmount: '1000',
        c: {
            name: MATERIAL_NB,
            kValue: 10,
        }
    },
    [MATERIAL_NX]: {
        buyMarkup: '101',
        buyAmount: '10000',
        markupUnit: UNIT_PERCENTAGE,
        c: {
            name: MATERIAL_NX,
            kValue: 10,
        }
    },
    [MATERIAL_SW]: {
        buyMarkup: '1.35',
        buyAmount: '1000',
        markupUnit: UNIT_PED_K,
        c: {
            name: MATERIAL_SW,
            kValue: 0.01,
        }
    },
    [MATERIAL_DW]: {
        buyMarkup: '101',
        buyAmount: '10000',
        markupUnit: UNIT_PERCENTAGE,
        c: {
            name: MATERIAL_DW,
            kValue: 10,
        }
    },
    [MATERIAL_ST]: {
        buyMarkup: '110',
        buyAmount: '10000',
        markupUnit: UNIT_PERCENTAGE,
        c: {
            name: MATERIAL_ST,
            kValue: 10,
        }
    },
    [MATERIAL_FT]: {
        buyMarkup: '2.8',
        buyAmount: '1000',
        markupUnit: UNIT_PED_K,
        c: {
            name: MATERIAL_FT,
            kValue: 0.01,
        }
    },
}

const initialState: MaterialsState = {
    map: refinedInitialMap
}

const reduceSetState = (state: MaterialsState, inState: MaterialsState): MaterialsState => inState

const _materialChanged = (state: MaterialsState, material: string, change: Partial<MaterialState>): MaterialsState => ({
    ...state,
    map: {
        ...state.map,
        [material]: {
            ...state.map[material],
            ...change
        }
    }
})

const _materialChangedMod = (state: MaterialsState, material: string, change: (s?: MaterialState) => Partial<MaterialState>): MaterialsState => ({
    ...state,
    map: {
        ...state.map,
        [material]: {
            ...state.map[material],
            ...change(state.map[material])
        }
    }
})

const reduceMaterialBuyMarkupChanged = (state: MaterialsState, material: string, buyMarkup: string): MaterialsState =>
    _materialChangedMod(state, material, s => {
        let calc = s?.calc
        if (calc) {
            const mu = buyMarkup ? Number(buyMarkup) / 100 : 1;
            const n = parseFloat(calc.total)
            if (!isNaN(n))
                calc = { ...calc, totalMU: (n * mu).toFixed(2) }
        }
        return { buyMarkup, buyMarkupModified: new Date().toString(), calc }
    })

const reduceMaterialOrderMarkupChanged = (state: MaterialsState, material: string, orderMarkup: string): MaterialsState =>
    _materialChanged(state, material, { orderMarkup })

const reduceMaterialUseAmountChanged = (state: MaterialsState, material: string, useAmount: string): MaterialsState =>
    _materialChanged(state, material, { useAmount })

const reduceMaterialRefineAmountChanged = (state: MaterialsState, material: string, refineAmount: string): MaterialsState =>
    _materialChanged(state, material, { refineAmount })

const reduceMaterialBuyAmountChanged = (state: MaterialsState, material: string, buyAmount: string): MaterialsState =>
    _materialChanged(state, material, { buyAmount })

const reduceSetMaterialMarkupUnit = (state: MaterialsState, material: string, markupUnit: MarkupUnit): MaterialsState =>
    _materialChanged(state, material, { markupUnit })

const reduceMaterialOrderValueChanged = (state: MaterialsState, material: string, orderValue: string): MaterialsState =>
    _materialChanged(state, material, { orderValue })

const reduceMaterialNotesValueChanged = (state: MaterialsState, material: string, notes: string): MaterialsState =>
    _materialChanged(state, material, { notes })

const reduceSetMaterialPartialWebData = (state: MaterialsState, material: string, change: Partial<MaterialStateWebData>): MaterialsState =>
    _materialChangedMod(state, material, s => ({ web: { ...s?.web, ...change } }))

const _materialChangedCalc = (state: MaterialsState, material: string, str: string, partial: Partial<MaterialStateCalcData>, getCalc: (n: number, v: number, mu: number) => MaterialStateCalcData): MaterialsState => {
    const n = parseFloat(str)
    const m = state.map[material]
    if (!m?.web?.material?.data && isNaN(n))
        return _materialChangedMod(state, material, s => ({ calc: { ...s?.calc, ...partial } }))

    const v = m.web.material.data.value.value
    const mu = getMarkupMultiplier(m);
    return _materialChangedMod(state, material, s => ({ calc: getCalc(n, v, mu) })) // parameters are (input Number, Value, Markup)
}

const reduceSetMaterialCalculatorQuantity = (state: MaterialsState, material: string, quantity: string): MaterialsState =>
    _materialChangedCalc(state, material, quantity, { quantity }, (n, v, mu) => ({ quantity, total: (v * n).toFixed(2), totalMU: (v * n * mu).toFixed(2) }))

const reduceSetMaterialCalculatorTotal = (state: MaterialsState, material: string, total: string): MaterialsState =>
    _materialChangedCalc(state, material, total, { total }, (n, v, mu) => ({ quantity: (n / v).toFixed(0), total, totalMU: (n * mu).toFixed(2) }))

const reduceSetMaterialCalculatorTotalMU = (state: MaterialsState, material: string, totalMU: string): MaterialsState =>
    _materialChangedCalc(state, material, totalMU, { totalMU }, (n, v, mu) => ({ quantity: (n / v / mu).toFixed(0), total: (n / mu).toFixed(2), totalMU }))

const cleanWeb = (state: MaterialsState): MaterialsState => {
    const cState: MaterialsState = JSON.parse(JSON.stringify(state))
    Object.values(cState.map).forEach(v => {
        delete v.web
    })
    return cState
}

const getMarkupMultiplier = (m: MaterialState): number => {
    const mu = parseFloat(m?.buyMarkup);
    const unitMultiplier = (unit: string): number => {
        switch (unit) {
            case UNIT_PED_K: return 100
            case UNIT_PLUS: return 1
            case UNIT_PERCENTAGE: default: return 0.01
        }
    }
    return isNaN(mu) ? 1 : mu * unitMultiplier(m.markupUnit);
}

const getValueWithMarkup = (q: string, v: string, m: MaterialState): number => {
    const nv = parseFloat(v);
    if (isNaN(nv))
        return 0 // moved item, number in parenthesis (N)

    const mu = parseFloat(m?.buyMarkup);
    if (isNaN(mu))
        return nv ?? 0

    const nq = parseInt(q);
    switch (m.markupUnit) {
        case UNIT_PED_K: return nq * mu / 1000
        case UNIT_PLUS: return nv + nq * mu
        case UNIT_PERCENTAGE: default: return nv * mu / 100
    }
}

const cleanForSaveMain = (state: MaterialsState): MaterialsState => {
    const cState: MaterialsState = JSON.parse(JSON.stringify(state))
    Object.values(cState.map).forEach(v => {
        delete v.web
        delete v.c
    })
    for (const k of Object.keys(cState.map)) {
        // delete empty objects
        if (Object.keys(cState.map[k]).length === 0)
            delete cState.map[k]
    }
    return cState
}

const cleanForSaveCache = (state: MaterialsState): MaterialsState => {
    const cState: MaterialsState = JSON.parse(JSON.stringify(state))
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
    materialMap,
    refinedInitialMap,
    getMarkupMultiplier,
    getValueWithMarkup,
    reduceSetState,
    reduceMaterialBuyMarkupChanged,
    reduceMaterialOrderMarkupChanged,
    reduceMaterialUseAmountChanged,
    reduceMaterialRefineAmountChanged,
    reduceMaterialBuyAmountChanged,
    reduceMaterialOrderValueChanged,
    reduceMaterialNotesValueChanged,
    reduceSetMaterialPartialWebData,
    reduceSetMaterialCalculatorQuantity,
    reduceSetMaterialCalculatorTotal,
    reduceSetMaterialCalculatorTotalMU,
    reduceSetMaterialMarkupUnit,
    cleanWeb,
    cleanForSaveMain,
    cleanForSaveCache,
    MATERIAL_PED,
    MATERIAL_ME,
    MATERIAL_LME,
    MATERIAL_NB,
    MATERIAL_NX,
    MATERIAL_SW,
    MATERIAL_DW,
    MATERIAL_ST,
    MATERIAL_FT,
    UNIT_PERCENTAGE,
    UNIT_PED_K,
}
