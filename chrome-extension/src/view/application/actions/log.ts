import { GameLogData } from "../../../background/client/gameLogData"
import { GameLogState } from "../state/log"

const SET_GAME_LOG_STATE = "[log] set state"
const SET_CURRENT_GAME_LOG = "[log] set current log"

const setGameLogState = (gameLog: GameLogState) => ({
    type: SET_GAME_LOG_STATE,
    payload: {
        gameLog
    }
})

const setCurrentGameLog = (gameLog: GameLogData) => ({
    type: SET_CURRENT_GAME_LOG,
    payload: {
        gameLog
    }
})

export {
    SET_GAME_LOG_STATE,
    SET_CURRENT_GAME_LOG,
    setGameLogState,
    setCurrentGameLog,
}
