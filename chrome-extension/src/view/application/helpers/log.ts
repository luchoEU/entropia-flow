import { GameLogData } from "../../../background/client/gameLogData";
import { InventoryList } from "../state/inventory";
import { GameLogItemData, GameLogState } from "../state/log";
import { initialList } from "./inventory";
import { SORT_NAME_ASCENDING, cloneSortListSelect, nextSortType } from "./inventory.sort";

const initialState: GameLogState = {
    loot: initialList(true, SORT_NAME_ASCENDING),
    skill: {
        expanded: false,
        list: []
    },
    global: {
        expanded: false,
        list: []
    },
    stats: {
        expanded: false,
        list: []
    },
    log: {
        expanded: false,
        list: []
    }
}

const reduceSetGameLogState = (state: GameLogState, gameLog: GameLogState) => gameLog

const reduceSetCurrentGameLog = (state: GameLogState, gameLog: GameLogData): GameLogState => ({
    ...state,
    loot: {
        ...state.loot,
        items: gameLog.loot.map(d => ({
            n: d.name,
            q: d.quantity.toString(),
            v: d.value.toFixed(2),
            c: ''
        }))
    },
    skill: {
        ...state.skill,
        list: gameLog.skill
    },
    global: {
        ...state.global,
        list: gameLog.global
    },
    stats: {
        ...state.stats,
        list: Object.entries(gameLog.stats).map(([k, v]) => `${k}: ${v}`)
    },
    log: {
        ...state.log,
        list: gameLog.raw
    }
})

const reduceSetGameLootExpanded = (state: GameLogState, expanded: boolean): GameLogState => ({
    ...state,
    loot: {
        ...state.loot,
        expanded
    }
})

const reduceSetGameSkillExpanded = (state: GameLogState, expanded: boolean): GameLogState => ({
    ...state,
    skill: {
        ...state.skill,
        expanded
    }
})

const reduceSetGameGlobalExpanded = (state: GameLogState, expanded: boolean): GameLogState => ({
    ...state,
    global: {
        ...state.global,
        expanded
    }
})

const reduceSetGameStatsExpanded = (state: GameLogState, expanded: boolean): GameLogState => ({
    ...state,
    stats: {
        ...state.stats,
        expanded
    }
})

const reduceSetGameLogExpanded = (state: GameLogState, expanded: boolean): GameLogState => ({
    ...state,
    log: {
        ...state.log,
        expanded
    }
})

function _sortByPart(list: InventoryList<GameLogItemData>, part: number, select: (d: GameLogItemData) => GameLogItemData) {
    const sortType = nextSortType(part, list.sortType)
    return {
        ...list,
        sortType,
        items: cloneSortListSelect(list.items, sortType, select)
    }
}

const reduceSortLootBy = (state: GameLogState, part: number): GameLogState => ({
    ...state,
    loot: _sortByPart(state.loot, part, x => x)
})

export {
    initialState,
    reduceSetGameLogState,
    reduceSetCurrentGameLog,
    reduceSetGameLootExpanded,
    reduceSetGameSkillExpanded,
    reduceSetGameGlobalExpanded,
    reduceSetGameStatsExpanded,
    reduceSetGameLogExpanded,
    reduceSortLootBy
}
