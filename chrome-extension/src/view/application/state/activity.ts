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

// Specific item reference types for each action
type SoldAuctionItems = {
    item: number
    payment: number
}

type BoughtAuctionItems = {
    item: number
    payment?: number
}

type ListedAuctionItems = {
    item: number
    fee: number
}

type ChipOutItems = {
    consumed: number
    skillChip: number
    inserterDecay?: number
}

type RefineItems = {
    consumed: number[]
    produced: number
}

type CraftItems = {
    consumed: number[]
    produced: number[]
}

type ConvertAmmoItems = {
    consumed: number
    produced: number
}

type MovedItems = {
    items: number[]
}

type DismissPetItems = {
    pet: number
}

type SimpleItems = {
    items: number[]
}

// Discriminated union for type-safe action handling
type InferredAction =
    | { type: 'sold_auction'; relatedItems: SoldAuctionItems }
    | { type: 'bought_auction'; relatedItems: BoughtAuctionItems }
    | { type: 'listed_auction'; relatedItems: ListedAuctionItems }
    | { type: 'chip_out'; relatedItems: ChipOutItems }
    | { type: 'refine'; relatedItems: RefineItems }
    | { type: 'craft'; relatedItems: CraftItems }
    | { type: 'convert_ammo'; relatedItems: ConvertAmmoItems }
    | { type: 'moved'; relatedItems: MovedItems }
    | { type: 'dismiss_pet'; relatedItems: DismissPetItems }
    | { type: 'decay'; relatedItems: SimpleItems }
    | { type: 'gained'; relatedItems: SimpleItems }
    | { type: 'lost'; relatedItems: SimpleItems }
    | { type: 'loot'; relatedItems: SimpleItems }
    | { type: 'unknown'; relatedItems: SimpleItems }
    | { type: 'reverse_fail'; relatedItems: SimpleItems }
    | { type: 'ped_deposited'; relatedItems: {} }
    | { type: 'ped_withdrawn'; relatedItems: {} }

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

function formatActionDescription(action: InferredAction | StoredAction, getInventoryItem: (id: number) => StoredInventoryItem | undefined): string {
    const info = actionTypeInfo[action.type]

    // Helper to get item info from ID
    const getItemInfo = (itemId: number) => {
        const item = getInventoryItem(itemId)
        return item ? { name: item.name, quantity: item.quantity } : { name: 'unknown', quantity: 0 }
    }

    switch (action.type) {
        case 'sold_auction': {
            const items = action.relatedItems as SoldAuctionItems
            const item = getItemInfo(items.item)
            return `${info.icon} ${info.name} ${item.quantity} ${item.name}`
        }
        case 'bought_auction': {
            const items = action.relatedItems as BoughtAuctionItems
            const item = getItemInfo(items.item)
            return `${info.icon} ${info.name} ${item.quantity} ${item.name}`
        }
        case 'listed_auction': {
            const items = action.relatedItems as ListedAuctionItems
            const item = getItemInfo(items.item)
            return `${info.icon} ${info.name} ${item.quantity} ${item.name}`
        }
        case 'chip_out': {
            const items = action.relatedItems as ChipOutItems
            const consumed = getItemInfo(items.consumed)
            return `${info.icon} ${info.name} ${consumed.name}`
        }
        case 'refine': {
            const items = action.relatedItems as RefineItems
            const produced = getItemInfo(items.produced)
            return `${info.icon} ${info.name} ${produced.quantity} ${produced.name}`
        }
        case 'craft': {
            const items = action.relatedItems as CraftItems
            if (!items.produced || items.produced.length === 0) {
                return `${info.icon} ${info.name} (no items)`
            }
            const produced = getItemInfo(items.produced[0])
            return `${info.icon} ${info.name} ${produced.quantity} ${produced.name}`
        }
        case 'convert_ammo': {
            const items = action.relatedItems as ConvertAmmoItems
            const produced = getItemInfo(items.produced)
            return `${info.icon} ${info.name} ${produced.quantity} ${produced.name}`
        }
        case 'dismiss_pet': {
            const items = action.relatedItems as DismissPetItems
            const pet = getItemInfo(items.pet)
            return `${info.icon} ${info.name} ${pet.quantity} ${pet.name}`
        }
        case 'moved': {
            const items = action.relatedItems as MovedItems
            if (!items.items || items.items.length === 0) {
                return `${info.icon} ${info.name} (no items)`
            }
            const item = getItemInfo(items.items[0])
            return `${info.icon} ${info.name} ${item.name}`
        }
        case 'decay':
        case 'gained':
        case 'lost':
        case 'loot':
        case 'unknown': {
            const items = action.relatedItems as SimpleItems
            if (!items.items || items.items.length === 0) {
                return `${info.icon} ${info.name} (no items)`
            }
            const item = getItemInfo(items.items[0])
            return `${info.icon} ${info.name} ${item.quantity} ${item.name}`
        }
        case 'ped_deposited':
        case 'ped_withdrawn':
        case 'reverse_fail':
            return `${info.icon} ${info.name}`
        default:
            return `${info.icon} Unknown action`
    }
}

interface StoredAction {
    id: string
    timestamp: number
    sources: ActionSource[]
    budgetName?: string
    type: InferredAction['type']
    relatedItems: InferredAction['relatedItems']
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

export type {
    SoldAuctionItems,
    BoughtAuctionItems,
    ListedAuctionItems,
    ChipOutItems,
    RefineItems,
    CraftItems,
    ConvertAmmoItems,
    MovedItems,
    DismissPetItems,
    SimpleItems
}
