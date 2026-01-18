import { SET_HISTORY_LIST } from '../actions/history'
import { addActions, setLastProcessedKey, ADD_ACTIONS, CLEAR_ACTIONS, SET_LAST_PROCESSED_KEY, CREATE_NEW_SESSION, UPDATE_SESSION_NAME, UPDATE_SESSION_TYPE, UPDATE_EXPANDED_SESSIONS, UPDATE_EXPANDED_ACTION_ROWS, setActionsState } from '../actions/actions'
import { ActionsState, StoredAction } from '../state/actions'
import { HistoryState } from '../state/history'
import { AppAction } from '../slice/app'

const actionsMiddleware = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    const prevActionsState: ActionsState = getState().actions
    const prevLastKey = prevActionsState.lastProcessedInventoryKey

    await next(action)

    switch (action.type) {
        case AppAction.INITIALIZE: {
            const actionsState = await api.storage.loadActions()
            if (actionsState)
                dispatch(setActionsState(actionsState))
            break
        }
        case ADD_ACTIONS:
        case CLEAR_ACTIONS:
        case SET_LAST_PROCESSED_KEY:
        case CREATE_NEW_SESSION:
        case UPDATE_SESSION_NAME:
        case UPDATE_SESSION_TYPE:
        case UPDATE_EXPANDED_SESSIONS:
        case UPDATE_EXPANDED_ACTION_ROWS: {
            const actionsState = getState().actions
            await api.storage.saveActions(actionsState)
            break
        }
        case SET_HISTORY_LIST: {
            const history: HistoryState = getState().history

            // Find new inventory items that haven't been processed yet
            const newActions: StoredAction[] = []

            for (const item of history.list) {
                // Skip if already processed
                if (prevLastKey !== undefined && item.key <= prevLastKey) {
                    continue
                }

                // Skip if no actions inferred
                if (!item.actions || item.actions.length === 0) {
                    continue
                }

                // Convert InferredAction to StoredAction
                for (const inferredAction of item.actions) {
                    const storedAction: StoredAction = {
                        ...inferredAction,
                        id: `${item.key}-${inferredAction.type}-${inferredAction.item}`,
                        timestamp: item.key, // The inventory key is the timestamp
                        sources: ['inventory']
                    }
                    newActions.push(storedAction)
                }
            }

            if (newActions.length > 0) {
                dispatch(addActions(newActions))
            }

            // Update lastProcessedInventoryKey
            if (history.list.length > 0) {
                const latestKey = Math.max(...history.list.map(i => i.key))
                if (prevLastKey === undefined || latestKey > prevLastKey) {
                    dispatch(setLastProcessedKey(latestKey))
                }
            }
            break
        }
    }
}

export default [
    actionsMiddleware
]
