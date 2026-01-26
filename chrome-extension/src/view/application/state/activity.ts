import { ViewItemData } from './history'

type ActionType =
    | 'sold_auction'
    | 'bought_auction'
    | 'listed_auction'
    | 'ped_deposited'
    | 'ped_withdrawn'
    | 'moved'
    | 'chip_out'
    | 'refine'
    | 'craft'
    | 'convert_ammo'
    | 'decay'
    | 'gained'
    | 'lost'
    | 'dismiss_pet'
    | 'loot'
    | 'unknown'
    | 'reverse_fail'

type ActionSource = 'inventory' | 'chat' | 'screen' | 'client'

type SessionType = 'unknown' | 'hunt' | 'mine' | 'craft'

interface StoredInventoryItem {
    id: number
    name: string
    quantity: number
    value: number
    container: string
    timestamp: number
}

interface InferredAction {
    type: ActionType
    relatedItems: number[]
}

const actionTypeInfo: Record<ActionType, { icon: string, name: string }> = {
    'sold_auction': { icon: '💰', name: 'Sold' },
    'bought_auction': { icon: '🛒', name: 'Bought' },
    'listed_auction': { icon: '🏷️', name: 'Listed' },
    'ped_deposited': { icon: '💵', name: 'Deposited' },
    'ped_withdrawn': { icon: '💸', name: 'Withdrew' },
    'moved': { icon: '📦', name: 'Moved' },
    'chip_out': { icon: '🧠', name: 'Extracted' },
    'refine': { icon: '🔨', name: 'Refined' },
    'craft': { icon: '🔨', name: 'Crafted' },
    'convert_ammo': { icon: '🔄', name: 'Converted' },
    'decay': { icon: '🔧', name: 'Used' },
    'gained': { icon: '📥', name: 'Gained' },
    'lost': { icon: '📤', name: 'Lost' },
    'dismiss_pet': { icon: '🐕', name: 'Dismissed' },
    'loot': { icon: '🎁', name: 'Looted' },
    'unknown': { icon: '❓', name: 'Changes in' },
    'reverse_fail': { icon: '‼', name: 'Reverse inference failed' },
}

function formatActionDescription(action: InferredAction, getInventoryItem: (id: number) => StoredInventoryItem | undefined): string {
    const info = actionTypeInfo[action.type]

    // Helper to get main item info (assumes first related item is the main one)
    const getMainItem = () => {
        if (action.relatedItems.length > 0) {
            const item = getInventoryItem(action.relatedItems[0])
            return item ? { name: item.name, quantity: item.quantity } : { name: 'unknown', quantity: 0 }
        }
        return { name: 'unknown', quantity: 0 }
    }

    const mainItem = getMainItem()

    switch (action.type) {
        case 'bought_auction':
        case 'listed_auction':
            return `${info.icon} ${info.name} ${mainItem.quantity} ${mainItem.name}`
        case 'chip_out':
            return `${info.icon} ${info.name} ${mainItem.name}`
        case 'refine':
        case 'craft':
        case 'convert_ammo':
        case 'gained':
        case 'lost':
        case 'dismiss_pet':
            return `${info.icon} ${info.name} ${mainItem.quantity} ${mainItem.name}`
        case 'moved':
            return `${info.icon} ${info.name} ${mainItem.name}`
        case 'ped_deposited':
        case 'ped_withdrawn':
            return `${info.icon} ${info.name}`
        case 'decay':
        case 'loot':
            return `${info.icon} ${info.name} ${mainItem.name}`
        case 'reverse_fail':
            return `${info.icon} ${info.name}`
        case 'unknown':
        default:
            return `${info.icon} ${info.name} ${mainItem.name}`
    }
}

interface StoredAction extends InferredAction {
    id: string
    timestamp: number
    sources: ActionSource[]
    budgetName?: string
}

interface SessionBoundary {
    id: string
    name: string
    type: SessionType
    startTime: number
    inventory?: {
        total: number
        items: number
    }
}

interface ActivityState {
    list: StoredInventoryItem[]
    actions: StoredAction[]
    lastProcessedInventoryKey?: number
    lastProcessedLogSerial?: number
    sessions: SessionBoundary[]
    expandedSessions: string[]
    expandedActionRows: string[]
    showActions: boolean
    // Per-session blacklist: sessionId -> item names excluded for this session
    sessionBlacklist: Record<string, string[]>
    // Per-session action blacklist: sessionId -> action ids excluded for this session
    sessionActionBlacklist: Record<string, string[]>
    // Permanent blacklist per session type: sessionType -> item names
    permanentItemBlacklist: Record<SessionType, string[]>
    // Permanent action blacklist per session type: sessionType -> action type strings
    permanentActionBlacklist: Record<SessionType, string[]>
    // Last deleted session for undo
    lastDeletedSession: { session: SessionBoundary, actions: StoredAction[] } | null
}

export {
    ActionType,
    ActionSource,
    SessionType,
    StoredInventoryItem,
    InferredAction,
    StoredAction,
    SessionBoundary,
    ActivityState,
    formatActionDescription,
    actionTypeInfo
}
