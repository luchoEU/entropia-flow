import { SortItemData } from "../helpers/inventorySort";
import { InventoryList } from "./inventory";

type GameLogItemData = SortItemData;

interface GameLogState {
    loot: InventoryList<GameLogItemData>
}

export {
    GameLogState,
    GameLogItemData
}
