import { DILUTED_CHANGED, LME_MARKUP_CHANGED, LME_SELL, LME_SELL_DONE, LME_VALUE_CHANGED, ME_MARKUP_CHANGED, ME_SELL, ME_SELL_DONE, ME_VALUE_CHANGED, NEXUS_CHANGED, SET_CALCULATOR_STATE, SWEAT_CHANGED, } from "../actions/calculator"
import { dilutedChanged, lmeMarkupChanged, lmeSellChange, lmeValueChanged, meMarkupChanged, meSellChange, meValueChanged, nexusChanged, setState, sweatChanged } from "../helpers/calculator"
import { initialState } from "../helpers/calculator"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_CALCULATOR_STATE: return setState(state, action.payload.state)
        case SWEAT_CHANGED: return sweatChanged(state, action.payload.price)
        case NEXUS_CHANGED: return nexusChanged(state, action.payload.price)
        case DILUTED_CHANGED: return dilutedChanged(state, action.payload.price)
        case ME_MARKUP_CHANGED: return meMarkupChanged(state, action.payload.markup)
        case ME_VALUE_CHANGED: return meValueChanged(state, action.payload.value)
        case LME_MARKUP_CHANGED: return lmeMarkupChanged(state, action.payload.markup)
        case LME_VALUE_CHANGED: return lmeValueChanged(state, action.payload.value)
        case ME_SELL: return meSellChange(state, true)
        case LME_SELL: return lmeSellChange(state, true)
        case ME_SELL_DONE: return meSellChange(state, false)
        case LME_SELL_DONE: return lmeSellChange(state, false)
        default: return state
    }
}
