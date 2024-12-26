import { GameLogData } from "../../../background/client/gameLogData";
import { GameLogState } from "../state/log";

const initialState: GameLogState = { }

const reduceSetGameLogState = (state: GameLogState, gameLog: GameLogState) => gameLog

const reduceSetCurrentGameLog = (state: GameLogState, gameLog: GameLogData): GameLogState => state

export {
    initialState,
    reduceSetGameLogState,
    reduceSetCurrentGameLog,
}
