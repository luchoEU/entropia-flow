import { SET_HISTORY_LIST } from '../actions/history'
import { addActions, setLastProcessedKey } from '../actions/actions'
import { ActionsState, StoredAction } from '../state/actions'
import { HistoryState } from '../state/history'

const actionsMiddleware = () => ({ dispatch, getState }) => next => async (action: any) => {
    const prevActionsState: ActionsState = getState().actions
    const prevLastKey = prevActionsState.lastProcessedInventoryKey

    await next(action)

    if (action.type === SET_HISTORY_LIST) {
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
    }
}

export default [
    actionsMiddleware
]
