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

interface ItemHidden {
    data: ItemData,
    criteria: {
        name: boolean,
        container: boolean,
        value: boolean
    }
}

interface InventoryState {
    visible: InventoryList<ItemData>,
    hidden: InventoryList<ItemHidden>,
    criteria: HideCriteria
}

export {
    HideCriteria,
    ItemHidden,
    InventoryList,
    InventoryState
}
