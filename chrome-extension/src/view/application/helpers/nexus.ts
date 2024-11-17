import { EntropiaNexusState } from "../state/nexus";

const initialState: EntropiaNexusState = {
    acquisition: { }
}

const reduceSetEntropiaNexusState = (state: EntropiaNexusState, newState: EntropiaNexusState): EntropiaNexusState => newState

export {
    initialState,
    reduceSetEntropiaNexusState,
}
