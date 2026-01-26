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

interface InferredAction {
    type: ActionType
    item: string
    amount?: number
    value?: number
    from?: string
    to?: string
    relatedItems: ViewItemData[]
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

function formatActionDescription(action: InferredAction): string {
    const info = actionTypeInfo[action.type]
    switch (action.type) {
        case 'bought_auction':
            return `${info.icon} ${info.name} ${action.amount} ${action.item}`
        case 'listed_auction':
            return `${info.icon} ${info.name} ${action.amount} ${action.item}`
        case 'chip_out':
            return `${info.icon} ${info.name} ${action.item} from ${action.from}`
        case 'refine':
            return `${info.icon} ${info.name} ${action.amount} ${action.item}`
        case 'craft':
            return `${info.icon} ${info.name} ${action.amount} ${action.item}`
        case 'convert_ammo':
            return `${info.icon} ${info.name} ${action.amount} ${action.item}`
        case 'moved':
            return `${info.icon} ${info.name} ${action.item} from ${action.from} to ${action.to}`
        case 'ped_deposited':
            return `${info.icon} ${info.name}`
        case 'ped_withdrawn':
            return `${info.icon} ${info.name}`
        case 'decay':
            return `${info.icon} ${info.name} ${action.item}`
        case 'gained':
            return `${info.icon} ${info.name} ${action.amount} ${action.item}`
        case 'lost':
            return `${info.icon} ${info.name} ${action.amount} ${action.item}`
        case 'dismiss_pet':
            return `${info.icon} ${info.name} ${action.amount} ${action.item}`
        case 'loot':
            return `${info.icon} ${info.name} ${action.item}`
        case 'reverse_fail':
            return `${info.icon} ${info.name}`
        case 'unknown':
        default:
            return `${info.icon} ${info.name} ${action.item}`
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
    list: StoredAction[]
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
    InferredAction,
    StoredAction,
    SessionBoundary,
    ActivityState,
    formatActionDescription,
    actionTypeInfo
}
