import { MarkupUnit, ItemsMap, ItemsState, ItemState, ItemStateCalcData, ItemStateWebData, UNIT_PED_K, UNIT_PERCENTAGE, UNIT_PLUS, ItemStateRefinedData, ItemStateMarkupData } from "../state/items"

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

const reduceSetState = (state: ItemsState, inState: ItemsState): ItemsState => inState

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

const reduceItemBuyMarkupChanged = (state: ItemsState, item: string, buyMarkup: string): ItemsState =>
    _itemChangedMod(state, item, (s: ItemState): Partial<ItemState> => {
        let calc = s?.calc
        if (calc) {
            const mu = buyMarkup ? Number(buyMarkup) / 100 : 1;
            const n = parseFloat(calc.total)
            if (!isNaN(n))
                calc = { ...calc, totalMU: (n * mu).toFixed(2) }
        }
        return { markup: { ...s?.markup, value: buyMarkup, modified: new Date().toString() }, calc }
    })

const _refined = (change: Partial<ItemStateRefinedData>) => (s?: ItemState): Partial<ItemState> => ({ refined: { ...s?.refined, ...change } })
const _markup = (change: Partial<ItemStateMarkupData>) => (s?: ItemState): Partial<ItemState> => ({ markup: { ...s?.markup, ...change } })

const reduceItemOrderMarkupChanged = (state: ItemsState, item: string, orderMarkup: string): ItemsState =>
    _itemChangedMod(state, item, _refined({ orderMarkup }))

const reduceItemUseAmountChanged = (state: ItemsState, item: string, useAmount: string): ItemsState =>
    _itemChangedMod(state, item, _refined({ useAmount }))

const reduceItemRefineAmountChanged = (state: ItemsState, item: string, refineAmount: string): ItemsState =>
    _itemChangedMod(state, item, _refined({ refineAmount }))

const reduceItemBuyAmountChanged = (state: ItemsState, item: string, buyAmount: string): ItemsState =>
    _itemChangedMod(state, item, _refined({ buyAmount }))

const reduceSetItemMarkupUnit = (state: ItemsState, item: string, markupUnit: MarkupUnit): ItemsState =>
    _itemChangedMod(state, item, _markup({ unit: markupUnit }))

const reduceItemOrderValueChanged = (state: ItemsState, item: string, orderValue: string): ItemsState =>
    _itemChangedMod(state, item, _refined({ orderValue }))

const reduceItemNotesValueChanged = (state: ItemsState, item: string, notes: string): ItemsState =>
    _itemChanged(state, item, { notes })

const reduceItemReserveValueChanged = (state: ItemsState, item: string, reserveAmount: string): ItemsState =>
    _itemChanged(state, item, { reserveAmount })

const reduceSetItemPartialWebData = (state: ItemsState, item: string, change: Partial<ItemStateWebData>): ItemsState =>
    _itemChangedMod(state, item, s => ({ web: { ...s?.web, ...change } }))

const _itemChangedCalc = (state: ItemsState, item: string, str: string, partial: Partial<ItemStateCalcData>, getCalc: (n: number, v: number, mu: number) => ItemStateCalcData): ItemsState => {
    const n = parseFloat(str)
    const m = state.map[item]
    if (!m?.web?.item?.data && isNaN(n))
        return _itemChangedMod(state, item, s => ({ calc: { ...s?.calc, ...partial } }))

    const v = m.web.item.data.value.value
    const mu = getMarkupMultiplier(m);
    return _itemChangedMod(state, item, s => ({ calc: getCalc(n, v, mu) })) // parameters are (input Number, Value, Markup)
}

const reduceSetItemCalculatorQuantity = (state: ItemsState, item: string, quantity: string): ItemsState =>
    _itemChangedCalc(state, item, quantity, { quantity }, (n, v, mu) => ({ quantity, total: (v * n).toFixed(2), totalMU: (v * n * mu).toFixed(2) }))

const reduceSetItemCalculatorTotal = (state: ItemsState, item: string, total: string): ItemsState =>
    _itemChangedCalc(state, item, total, { total }, (n, v, mu) => ({ quantity: (n / v).toFixed(0), total, totalMU: (n * mu).toFixed(2) }))

const reduceSetItemCalculatorTotalMU = (state: ItemsState, item: string, totalMU: string): ItemsState =>
    _itemChangedCalc(state, item, totalMU, { totalMU }, (n, v, mu) => ({ quantity: (n / v / mu).toFixed(0), total: (n / mu).toFixed(2), totalMU }))

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
    if (isNaN(nv))
        return 0 // moved item, number in parenthesis (N)

    const mu = parseFloat(m?.markup.value);
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
    reduceSetState,
    reduceItemBuyMarkupChanged,
    reduceItemOrderMarkupChanged,
    reduceItemUseAmountChanged,
    reduceItemRefineAmountChanged,
    reduceItemBuyAmountChanged,
    reduceItemOrderValueChanged,
    reduceItemNotesValueChanged,
    reduceItemReserveValueChanged,
    reduceSetItemPartialWebData,
    reduceSetItemCalculatorQuantity,
    reduceSetItemCalculatorTotal,
    reduceSetItemCalculatorTotalMU,
    reduceSetItemMarkupUnit,
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
