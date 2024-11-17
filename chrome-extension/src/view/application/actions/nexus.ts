import { EntropiaNexusState } from "../state/nexus"

const SET_ENTROPIA_NEXUS_STATE = "[nexus] set entropia nexus state"
const LOAD_ENTROPIA_NEXUS_ACQUISITION = "[nexus] load entropia nexus acquisition"

const setEntropiaNexusState = (state: EntropiaNexusState) => ({
    type: SET_ENTROPIA_NEXUS_STATE,
    payload: {
        state
    }
})

const loadEntropiaNexusAcquisition = (item: string) => ({
    type: LOAD_ENTROPIA_NEXUS_ACQUISITION,
    payload: {
        item
    }
})

export {
    SET_ENTROPIA_NEXUS_STATE,
    LOAD_ENTROPIA_NEXUS_ACQUISITION,
    setEntropiaNexusState,
    loadEntropiaNexusAcquisition,
}
