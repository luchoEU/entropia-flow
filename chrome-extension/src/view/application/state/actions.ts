import { ViewItemData } from './history'

type ActionType =
    | 'sold_auction'
    | 'bought_auction'
    | 'ped_deposited'
    | 'ped_withdrawn'
    | 'moved'
    | 'chip_out'
    | 'decay'
    | 'gained'
    | 'lost'
    | 'unknown'

type ActionSource = 'inventory' | 'chat' | 'screen'

interface InferredAction {
    type: ActionType
    item: string
    amount?: number
    value?: number
    from?: string
    to?: string
    relatedItems: ViewItemData[]
}

function formatActionDescription(action: InferredAction): string {
    switch (action.type) {
        case 'sold_auction':
            return `💰 Sold ${action.amount} ${action.item} for ${action.value} PED`
        case 'bought_auction':
            return `🛒 Bought ${action.amount} ${action.item} for ${action.value} PED`
        case 'chip_out':
            return `🧠 Extracted ${action.item} from ${action.from}`
        case 'moved':
            return `📦 Moved ${action.item} from ${action.from} to ${action.to}`
        case 'ped_deposited':
            return `💵 Deposited ${action.value} PED`
        case 'ped_withdrawn':
            return `💸 Withdrew ${action.value} PED`
        case 'decay':
            return `🔧 Used ${action.item} (${action.value} PED decay)`
        case 'gained':
            return `📥 Gained ${action.amount} ${action.item}`
        case 'lost':
            return `📤 Lost ${action.amount} ${action.item}`
        case 'unknown':
        default:
            return `❓ Changed ${action.item}`
    }
}

interface StoredAction extends InferredAction {
    id: string
    timestamp: number
    sources: ActionSource[]
}

interface ActionsState {
    list: StoredAction[]
    lastProcessedInventoryKey?: number
}

export {
    ActionType,
    ActionSource,
    InferredAction,
    StoredAction,
    ActionsState,
    formatActionDescription
}
