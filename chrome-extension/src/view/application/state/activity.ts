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
    | 'unknown'

type ActionSource = 'inventory' | 'chat' | 'screen'

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

function formatActionDescription(action: InferredAction): string {
    switch (action.type) {
        case 'sold_auction':
            return `💰 Sold ${action.amount} ${action.item} for ${action.value} PED`
        case 'bought_auction':
            return `🛒 Bought ${action.amount} ${action.item}${action.value ? ` for ${action.value.toFixed(2)} PED` : ''}`
        case 'listed_auction':
            return `🏷️ Listed ${action.amount} ${action.item}${action.value ? ` for ${action.value.toFixed(2)} PED fee` : ''}`
        case 'chip_out':
            return `🧠 Extracted ${action.item} from ${action.from}`
        case 'refine':
            return `🔨 Refined ${action.amount} ${action.item}`
        case 'craft':
            return `🔨 Crafted ${action.amount} ${action.item}`
        case 'convert_ammo':
            return `🔄 Converted ${action.amount} ${action.item}`
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
        case 'dismiss_pet':
            return `🐕 Dismissed ${action.amount} ${action.item}${action.value ? ` (${action.value.toFixed(2)} PED)` : ''}`
        case 'unknown':
        default:
            return `❓ Changes in ${action.item}${action.value ? ` for ${action.value.toFixed(2)} PED` : ''}`
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
}

export {
    ActionType,
    ActionSource,
    SessionType,
    InferredAction,
    StoredAction,
    SessionBoundary,
    ActivityState,
    formatActionDescription
}
