interface ViewItemData {
    key: number // index
    n: string // name, string
    q: string // quantity, number
    v: string // value, number (2 decimals)
    c: string // container, string
    e?: boolean // excluded from difference
    x?: boolean // permanent exclude from difference
    w?: boolean // show warning
    a?: MindEssenceLogAction // action available
}

const ME_SOLD = 1
const LME_SOLD = 2
const NB_SOLD = 3
const KIN_AMP_SOLD = 4

const MindEssenceLogText = [
    'Unknown',
    'ME sold in Auction', // ME_SOLD
    'LME sold in Auction', // LME_SOLD
    'NB sold in Auction', // NB_SOLD
    'Kinetic Amp sold in Auction', // KIN_AMP_SOLD
]

interface MindEssenceLogAction {
    type: number,
    q: number
}

interface ViewInventory {
    key: number,
    text: string,
    class: string,
    info: string,
    expanded: boolean,
    diff: Array<ViewItemData>,
    sortType: number,
    isLast: boolean,
    canBeLast: boolean
}

interface HistoryState {
    expanded: boolean,
    hiddenError: string,
    list: Array<ViewInventory>,
    intervalId: NodeJS.Timer
}

export {
    ME_SOLD,
    LME_SOLD,
    NB_SOLD,
    KIN_AMP_SOLD,
    MindEssenceLogText,
    ViewItemData,
    MindEssenceLogAction,
    ViewInventory,
    HistoryState
}