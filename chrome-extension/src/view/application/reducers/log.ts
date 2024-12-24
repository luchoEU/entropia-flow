import { SET_CURRENT_GAME_LOG, SET_GAME_GLOBAL_EXPANDED, SET_GAME_LOG_EXPANDED, SET_GAME_LOG_STATE, SET_GAME_LOOT_EXPANDED, SET_GAME_SKILL_EXPANDED, SET_GAME_STATS_EXPANDED, SORT_LOOT_BY } from "../actions/log"
import { initialState, reduceSetCurrentGameLog, reduceSetGameGlobalExpanded, reduceSetGameLogExpanded, reduceSetGameLogState, reduceSetGameLootExpanded, reduceSetGameSkillExpanded, reduceSetGameStatsExpanded, reduceSortLootBy } from "../helpers/log"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_GAME_LOG_STATE: return reduceSetGameLogState(state, action.payload.gameLog)
        case SET_CURRENT_GAME_LOG: return reduceSetCurrentGameLog(state, action.payload.gameLog)
        case SET_GAME_LOOT_EXPANDED: return reduceSetGameLootExpanded(state, action.payload.expanded)
        case SET_GAME_SKILL_EXPANDED: return reduceSetGameSkillExpanded(state, action.payload.expanded)
        case SET_GAME_GLOBAL_EXPANDED: return reduceSetGameGlobalExpanded(state, action.payload.expanded)
        case SET_GAME_STATS_EXPANDED: return reduceSetGameStatsExpanded(state, action.payload.expanded)
        case SET_GAME_LOG_EXPANDED: return reduceSetGameLogExpanded(state, action.payload.expanded)
        case SORT_LOOT_BY: return reduceSortLootBy(state, action.payload.part)
        default: return state
    }
}
