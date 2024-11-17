import { EntropiaNexusState } from "../state/nexus";

const initialState: EntropiaNexusState = {
    acquisition: { }
}

const reduceSetEntropiaNexusState = (state: EntropiaNexusState, newState: EntropiaNexusState): EntropiaNexusState => newState

const reduceLoadEntropiaNexusAcquisition = (state: EntropiaNexusState, item: string): EntropiaNexusState => ({
    ...state,
    acquisition: {
        ...state.acquisition,
        [item]: {
            loading: true
        }
    }
})

export {
    initialState,
    reduceSetEntropiaNexusState,
    reduceLoadEntropiaNexusAcquisition,
}
