//// STATE ////

interface ItemData {
    id: string // identifier, number
    n: string // name, string
    q: string // quantity, number
    v: string // value, number (2 decimals)
    c: string // container, string
    r?: string // reference, number
}

interface Log {
    class: string
    message: string
}

interface Meta {
    date: number,
    lastDate?: number,
    total?: string
}

interface Inventory {
    log?: Log,
    itemlist?: Array<ItemData>
    meta: Meta
    tag?: any
    shortWait?: boolean
}

interface TimeLeft {
    minutes: number
    seconds: number
}

const STATUS_TYPE_MONITORING_OFF = "monitoring off"
const STATUS_TYPE_LOG = "log"
const STATUS_TYPE_TIME = "time"

interface Status {
    type: string
    log?: Log
    time?: TimeLeft
}

interface ViewState {
    list?: Array<Inventory>
    last?: number
    status: Status
}

let mockDate = undefined

function setMockDate(date: number) {
    mockDate = date
}

function makeLogInventory(_class: string, message: string): Inventory {
    let date = (new Date()).getTime()
    if (mockDate !== undefined)
        date = mockDate

    return {
        log: { class: _class, message },
        meta: { date }
    }
}

function areEqualInventoryList(inv1: Inventory, inv2: Inventory) {
    if (inv1.itemlist === undefined || inv2.itemlist === undefined)
        return false

    if (inv1.meta.total !== inv2.meta.total)
        return false

    if (inv1.itemlist.length !== inv2.itemlist.length)
        return false

    for (let n = 0; n < inv1.itemlist.length; n++) {
        const i1 = inv1.itemlist[n]
        const i2 = inv2.itemlist[n]
        if (i1.id !== i2.id
            || i1.n !== i2.n
            || i1.q !== i2.q
            || i1.v !== i2.v
            || i1.c !== i2.c
            || i1.r !== i2.r
        ) {
            return false
        }
    }

    return true
}

export {
    Log,
    Meta,
    Inventory,
    ItemData,
    TimeLeft,
    Status,
    ViewState,
    STATUS_TYPE_MONITORING_OFF,
    STATUS_TYPE_LOG,
    STATUS_TYPE_TIME,
    setMockDate,
    makeLogInventory,
    areEqualInventoryList
}