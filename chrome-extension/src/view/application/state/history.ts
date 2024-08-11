interface ViewItemData {
    key: number // index
    n: string // name, string
    q: string // quantity, number
    v: string // value, number (2 decimals)
    c: string // container, string
    e?: boolean // excluded from difference
    x?: boolean // permanent exclude from difference
    w?: boolean // show warning
    a?: ViewItemAction // action available
}

interface ViewItemAction {
    message: string
    menu: number
}

interface ViewInventory {
    key: number
    text: string
    class: string
    info: string
    expanded: boolean
    diff: Array<ViewItemData>
    sortType: number
    isLast: boolean
    canBeLast: boolean
}

interface HistoryState {
    expanded: boolean
    hiddenError: string
    list: Array<ViewInventory>
    intervalId: NodeJS.Timeout
}

export {
    ViewItemData,
    ViewItemAction,
    ViewInventory,
    HistoryState
}