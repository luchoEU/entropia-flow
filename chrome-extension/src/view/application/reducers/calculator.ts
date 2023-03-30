import { DILUTED_CHANGED, FRUIT_CHANGED, LME_MARKUP_CHANGED, LME_VALUE_CHANGED, ME_MARKUP_CHANGED, ME_VALUE_CHANGED, NB_MARKUP_CHANGED, NB_VALUE_CHANGED, NEXUS_CHANGED, SET_CALCULATOR_STATE, SWEAT_CHANGED, SWEETSTUFF_CHANGED, } from "../actions/calculator"
import { dilutedChanged, fruitChanged, lmeMarkupChanged, lmeValueChanged, meMarkupChanged, meValueChanged, nbMarkupChanged, nbValueChanged, nexusChanged, setState, sweatChanged, sweetstuffChanged } from "../helpers/calculator"
import { initialState } from "../helpers/calculator"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_CALCULATOR_STATE: return setState(state, action.payload.state)
        case SWEAT_CHANGED: return sweatChanged(state, action.payload.price)
        case FRUIT_CHANGED: return fruitChanged(state, action.payload.price)
        case NEXUS_CHANGED: return nexusChanged(state, action.payload.price)
        case DILUTED_CHANGED: return dilutedChanged(state, action.payload.price)
        case SWEETSTUFF_CHANGED: return sweetstuffChanged(state, action.payload.price)
        case ME_MARKUP_CHANGED: return meMarkupChanged(state, action.payload.markup)
        case ME_VALUE_CHANGED: return meValueChanged(state, action.payload.value)
        case LME_MARKUP_CHANGED: return lmeMarkupChanged(state, action.payload.markup)
        case LME_VALUE_CHANGED: return lmeValueChanged(state, action.payload.value)
        case NB_MARKUP_CHANGED: return nbMarkupChanged(state, action.payload.markup)
        case NB_VALUE_CHANGED: return nbValueChanged(state, action.payload.value)
        default: return state
    }
}
