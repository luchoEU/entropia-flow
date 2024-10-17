import { SortItemData } from "../helpers/inventory.sort";
import { InventoryList } from "./inventory";

type GameLogItemData = SortItemData;

interface GameLogState {
    loot: InventoryList<GameLogItemData>
}

export {
    GameLogState,
    GameLogItemData
}
