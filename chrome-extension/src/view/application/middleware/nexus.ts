import { LOAD_ENTROPIA_NEXUS_ACQUISITION, setEntropiaNexusState } from "../actions/nexus"
import { getEntropiaNexus } from "../selectors/nexus"
import { EntropiaNexusState } from "../state/nexus"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case LOAD_ENTROPIA_NEXUS_ACQUISITION: {
            if (action.type === LOAD_ENTROPIA_NEXUS_ACQUISITION) {
                const item = action.payload.item
                const apiUrl = `https://api.entropianexus.com/acquisition/${encodeURIComponent(item)}`

                let data: any = {
                    loading: false
                }
                try {
                    const response = await fetch(apiUrl);
                    data.code = response.status
                    if (response.ok) {
                        data.result = await response.json();
                    }
                } catch (error) {
                    data.code = -1
                    console.error("Error during API call:", error);
                }

                const state: EntropiaNexusState = { ...getEntropiaNexus(getState()) }
                state.acquisition[item] = data
                dispatch(setEntropiaNexusState(state))
            }
            break
        }
    }
}

export default [
    requests
]
