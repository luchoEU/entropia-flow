import IStorageArea from "../../chrome/IStorageArea"
import { STORAGE_GAME_LOG } from "../../common/const"
import { GameLogData } from "./gameLogData"

class GameLogStorage {
    private area: IStorageArea

    constructor(area: IStorageArea) {
        this.area = area
    }

    public async get(): Promise<GameLogData> {
        return await this.area.get(STORAGE_GAME_LOG)
    }

    public async set(log: GameLogData): Promise<void> {
        await this.area.set(STORAGE_GAME_LOG, log)
    }
}

export default GameLogStorage
