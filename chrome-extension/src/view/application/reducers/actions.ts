import { ActionsState, StoredAction } from "../state/actions"
import { ADD_ACTIONS, CLEAR_ACTIONS, SET_LAST_PROCESSED_KEY } from "../actions/actions"

const initialState: ActionsState = {
    list: [],
    lastProcessedInventoryKey: undefined
}

interface AddActionsAction {
    type: typeof ADD_ACTIONS
    payload: { actions: StoredAction[] }
}

interface ClearActionsAction {
    type: typeof CLEAR_ACTIONS
}

interface SetLastProcessedKeyAction {
    type: typeof SET_LAST_PROCESSED_KEY
    payload: { key: number }
}

type ActionsAction = AddActionsAction | ClearActionsAction | SetLastProcessedKeyAction

export default (state = initialState, action: ActionsAction): ActionsState => {
    switch (action.type) {
        case ADD_ACTIONS:
            return {
                ...state,
                list: [...action.payload.actions, ...state.list]
            }
        case CLEAR_ACTIONS:
            return {
                ...state,
                list: [],
                lastProcessedInventoryKey: undefined
            }
        case SET_LAST_PROCESSED_KEY:
            return {
                ...state,
                lastProcessedInventoryKey: action.payload.key
            }
        default:
            return state
    }
}

export { initialState }
