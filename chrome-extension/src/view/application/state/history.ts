import { Inventory } from "../../../common/state"
import { InferredAction } from "./activity"

interface ViewItemData {
    key: number // index
    n: string // name, string
    q: string // quantity, number
    v: string // value, number (2 decimals)
    c: string // container, string
    t?: number // timestamp, number (milliseconds)
    s?: string // source, ActionSource string
    e?: boolean // excluded from difference
    x?: boolean // permanent exclude from difference
    w?: boolean // show warning
    m?: ViewItemMode // i.e for edit markup
}

const VIEW_ITEM_MODE_EDIT_MARKUP = 1

interface ViewItemMode {
    type: number,
    data: any
}

interface ViewItemAction {
    message: string
    navigateTo: string
}

interface ViewInventory {
    key: number
    text: string
    class: string
    info: string
    expanded: boolean
    diff: Array<ViewItemData> | null
    sortType: number
    isLast: boolean
    canBeLast: boolean
    rawInventory: Inventory
    actions?: InferredAction[]
    showActions: boolean
}

interface HistoryState {
    list: Array<ViewInventory>
    hiddenError?: string
    intervalId?: number
}

export {
    ViewItemData,
    ViewItemAction,
    ViewItemMode,
    VIEW_ITEM_MODE_EDIT_MARKUP,
    ViewInventory,
    HistoryState
}