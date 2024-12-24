import { GameLogGlobal, GameLogLine, GameLogSkill } from "../../../background/client/gameLogData";
import { SortItemData } from "../helpers/inventory.sort";
import { InventoryList } from "./inventory";

type GameLogItemData = SortItemData;

interface GameLogState {
    loot: InventoryList<GameLogItemData>
    skill: {
        expanded: boolean
        list: Array<GameLogSkill>
    }
    global: {
        expanded: boolean
        list: Array<GameLogGlobal>
    }
    stats: {
        expanded: boolean
        list: Array<string>
    }
    log: {
        expanded: boolean
        list: Array<GameLogLine>
    }
}

export {
    GameLogState,
    GameLogItemData
}
