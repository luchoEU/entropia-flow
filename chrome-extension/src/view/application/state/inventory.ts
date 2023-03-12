import { ItemData } from "../../../common/state";

interface InventoryList<T> {
    expanded: boolean,
    sortType: number,
    items: Array<T>
    stats: {
        count: number,
        ped: string
    }
}

interface HideCriteria {
    name: Array<string>,
    container: Array<string>,
    value: number
}

interface AvailableCriteria {
    name: Array<string>
}

interface ItemHidden {
    data: ItemData,
    criteria: {
        name: boolean,
        container: boolean,
        value: boolean
    }
}

interface InventoryState {
    blueprints: InventoryList<ItemData>,
    auction: InventoryList<ItemData>,
    visible: InventoryList<ItemData>,
    hidden: InventoryList<ItemHidden>,
    hiddenCriteria: HideCriteria,
    available: InventoryList<ItemData>,
    availableCriteria: AvailableCriteria
}

export {
    HideCriteria,
    AvailableCriteria,
    ItemHidden,
    InventoryList,
    InventoryState
}
