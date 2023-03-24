import { MaterialsState } from '../state/materials'

const SET_MATERIALS_STATE = '[materials] set state'
const MATERIAL_MARKUP_CHANGED = '[materials] markup changed'

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

export {
    SET_MATERIALS_STATE,
    MATERIAL_MARKUP_CHANGED,
    setMaterialsState,
    materialMarkupChanged,
}
