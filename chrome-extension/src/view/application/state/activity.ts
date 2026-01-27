interface ActivityState {
    schema: number
    data: {
        // Inventory snapshots from game updates
        items: ActivityItem[]
        // Automatically inferred actions from inventory changes
        autoActions: StoredAction[]
        // User-guided actions with open inference (not yet implemented)
        userActions: ActivityAction[]
        // Sessions tracking activity over time
        sessions: ActivitySession[]
    }
    lastProcessed: {
        inventoryKey?: number
        clientLogSerial?: number
    }
    ui: {
        expanded: {
            sessions: string[]
            actionRows: string[]
        }
        showActions: ShowActionsType
    }
    blacklist: {
        // Per-session blacklist: sessionId -> item names excluded for this session
        session: Record<string, string[]>
        // Per-session action blacklist: sessionId -> action ids excluded for this session
        sessionAction: Record<string, string[]>
        // Permanent blacklist per session type: sessionType -> item names
        permanentItem: Record<SessionType, string[]>
        // Permanent action blacklist per session type: sessionType -> action type strings
        permanentAction: Record<SessionType, string[]>
    }
}

type ShowActionsType = 'items' | 'autoActions' | 'userActions'

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

type ActionSource = 'inventory' | 'client'

type SessionType = 'unknown' | 'hunt' | 'mine' | 'craft'

interface ActivityItem {
    id: number
    name: string
    quantity: number
    value: number
    container: string
    timestamp: number
    source: ActionSource
}

interface ActivityAction {
    type: string
    relatedItems: Record<string, number | number[]>
}

interface ActivitySession {
    id: string
    name: string
    type: SessionType
    startTime: number
    inventory?: { // Last total inventory stats in this session
        total: number
        items: number
    }
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

function formatActionDescription(action: InferredAction | StoredAction, getInventoryItem: (id: number) => ActivityItem | undefined): string {
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

export {
    ActionType,
    ActionSource,
    SessionType,
    ActivityItem,
    InferredAction,
    StoredAction,
    ActivitySession,
    ActivityState,
    ShowActionsType,
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
