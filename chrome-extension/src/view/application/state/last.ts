import { ViewItemData } from "./history";

interface ViewPedData {
    key: number
    value: string
}

// Computed state (not persisted)
interface ComputedLastState {
    anyInventory: boolean,
    text?: string,
    delta?: number,
    date: number,
    diff?: Array<ViewItemData>,
}

// Persisted state
interface PersistedLastState {
    expanded?: boolean,
    sortType: number,
    showMarkup: boolean,
    showActions: boolean,
    blacklist: Array<string>,
    permanentBlacklist: Array<string>,
    peds: Array<ViewPedData>,
    notificationsDone: Array<string>,
}

// Combined state interface for backward compatibility
interface LastRequiredState extends PersistedLastState {
    c: ComputedLastState,
}

export {
    ViewPedData,
    ComputedLastState,
    PersistedLastState,
    LastRequiredState
}