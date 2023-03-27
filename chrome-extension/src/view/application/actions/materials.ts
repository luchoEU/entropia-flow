import { MaterialsState } from '../state/materials'

const SET_MATERIALS_STATE = '[material] set state'
const MATERIAL_MARKUP_CHANGED = '[material] markup changed'
const MATERIAL_BUY_AMOUNT_CHANGED = '[material] buy amount changed'

const setMaterialsState = (state: MaterialsState) => ({
    type: SET_MATERIALS_STATE,
    payload: {
        state
    }
})

const materialMarkupChanged = (material: string) => (value: string) => ({
    type: MATERIAL_MARKUP_CHANGED,
    payload: {
        material,
        value
    }
})

const materialBuyAmountChanged = (material: string, value: string) => ({
    type: MATERIAL_BUY_AMOUNT_CHANGED,
    payload: {
        material,
        value
    }
})

export {
    SET_MATERIALS_STATE,
    MATERIAL_MARKUP_CHANGED,
    MATERIAL_BUY_AMOUNT_CHANGED,
    setMaterialsState,
    materialMarkupChanged,
    materialBuyAmountChanged,
}
