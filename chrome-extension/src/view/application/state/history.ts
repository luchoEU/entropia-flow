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
    m?: ViewItemMode // i.e for edit markup
}

const VIEW_ITEM_MODE_EDIT_MARKUP = 1

interface ViewItemMode {
    type: number,
    data: any
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
    hiddenError: string
    list: Array<ViewInventory>
    intervalId: NodeJS.Timeout
}

export {
    ViewItemData,
    ViewItemAction,
    ViewItemMode,
    VIEW_ITEM_MODE_EDIT_MARKUP,
    ViewInventory,
    HistoryState
}