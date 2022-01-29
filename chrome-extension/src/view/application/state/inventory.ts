import { ItemData } from "../../../common/state";

interface InventoryList {
    expanded: boolean,
    sortType: number,
    items: Array<ItemData>
}

interface InventoryState {
    visible: InventoryList,
    hidden: InventoryList,
    hiddenNames: Array<string>
}

export {
    InventoryList,
    InventoryState
}
