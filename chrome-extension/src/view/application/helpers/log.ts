import { LootLogData } from "../../../background/client/logData";
import { InventoryList } from "../state/inventory";
import { GameLogItemData, GameLogState } from "../state/log";
import { initialList } from "./inventory";
import { SORT_NAME_ASCENDING, cloneSortListSelect, nextSortType } from "./inventorySort";

const initialState: GameLogState = {
    loot: initialList(true, SORT_NAME_ASCENDING),
}

const setGameLogState = (state: GameLogState, gameLog: GameLogState) => gameLog

const setCurrentGameLog = (state: GameLogState, gameLog: Array<LootLogData>): GameLogState => ({
    ...state,
    loot: {
        ...state.loot,
        items: gameLog.map(d => ({
            n: d.material,
            q: d.amount.toString(),
            v: d.value.toFixed(2),
            c: ''
        }))
    }
})

const setGameLogExpanded = (state: GameLogState, expanded: boolean): GameLogState => ({
    ...state,
    loot: {
        ...state.loot,
        expanded
    }
})

function sortByPart(list: InventoryList<GameLogItemData>, part: number, select: (d: GameLogItemData) => GameLogItemData) {
    const sortType = nextSortType(part, list.sortType)
    return {
        ...list,
        sortType,
        items: cloneSortListSelect(list.items, sortType, select)
    }
}

const sortLootBy = (state: GameLogState, part: number): GameLogState => ({
    ...state,
    loot: sortByPart(state.loot, part, x => x)
})

export {
    initialState,
    setGameLogState,
    setCurrentGameLog,
    setGameLogExpanded,
    sortLootBy
}
