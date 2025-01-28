import {
    Inventory,
    Status,
    ViewState,
} from '../../common/state'
import { GameLogData } from '../client/gameLogData'
import { IGameLogHistory } from '../client/gameLogHistory'
import IWebSocketClient, { WebSocketState } from '../client/webSocketInterface'
import RefreshManager from '../content/refreshManager'
import InventoryManager from '../inventory/inventory'
import ViewSettings from '../settings/viewSettings'

class ViewStateManager {
    private refreshManager: RefreshManager
    private viewSettings: ViewSettings
    private inventory: InventoryManager
    private gameLogHistory: IGameLogHistory
    private webSocketClient: IWebSocketClient
    public onChange: (state: ViewState) => Promise<void>

    constructor(refreshManager: RefreshManager, viewSettings: ViewSettings, inventory: InventoryManager, gameLogHistory: IGameLogHistory, webSocketClient: IWebSocketClient) {
        this.refreshManager = refreshManager
        this.viewSettings = viewSettings
        this.inventory = inventory
        this.gameLogHistory = gameLogHistory
        this.webSocketClient = webSocketClient
    }

    public async get(): Promise<ViewState> {
        const list = await this.inventory.getList()
        const last = await this.viewSettings.getLast()
        const status = await this.refreshManager.getStatus()
        const gameLog = await this.gameLogHistory.getGameLog()
        const clientState = await this.webSocketClient.getState()
        return { list, last, status, gameLog, clientState }
    }

    public async reload(): Promise<void> {
        if (this.onChange) {
            const state = await this.get()
            await this.onChange(state)
        }
    }

    public async setStatus(status: Status): Promise<void> {
        if (this.onChange) {
            await this.onChange({ status })
        }
    }

    public async setList(list: Array<Inventory>): Promise<void> {
        if (this.onChange) {
            const last = await this.viewSettings.getLast()
            const status = await this.refreshManager.getStatus()
            await this.onChange({ list, last, status })
        }
    }

    public async setGameLog(gameLog: GameLogData) {
        if (this.onChange) {
            await this.onChange({ gameLog })
        }
    }

    public async setClientState(state: WebSocketState): Promise<void> {
        if (this.onChange) {
            await this.onChange({ clientState: state })
        }
    }

    public async setClientVersion(version: string) {
        if (this.onChange) {
            await this.onChange({ clientState: await this.webSocketClient.getState(), clientVersion: version })
        }
    }
}

export default ViewStateManager
export {
    ViewState
}
