import { atom } from 'jotai'
import { getDefaultStore } from 'jotai'
import { atomWithDefault } from 'jotai/utils'
import { GameLogData, GameLogTrade } from '../../../background/client/gameLogData'
import { GameLogState } from '../state/log'
import { LOCAL_STORAGE } from '../../../chrome/chromeStorageArea'
import { STORAGE_VIEW_GAME_LOG } from '../../../common/const'
import { gameLogTabularData, gameLogTabularDefinitions } from '../tabular/log'
import { Feature } from '../state/settings'
import { isFeatureEnabledAtom } from './settings'
import { GAME_LOG_TABULAR_TRADE } from '../state/log'
import { TradeState } from '../state/trade'
import { itemMatchesFilter, setTabularDefinitions } from '../helpers/tabular'
import { createListNotification } from '../../../common/notifications'
import { tabularAtom } from './tabular'
import { tradeAtom, setLastTradeMessageCheckSerialAtom } from './trade'

const NOTIFICATION_ID = "entropiaFlowTrading"

// Initial state
const initialGameLogState: GameLogState = {}

// Storage helpers
const saveToStorage = async (state: GameLogState) => {
    await LOCAL_STORAGE.set(STORAGE_VIEW_GAME_LOG, state)
}

const loadFromStorage = async (): Promise<GameLogState | null> => {
    return await LOCAL_STORAGE.get(STORAGE_VIEW_GAME_LOG)
}

// Base atom for game log state (minimal, matches Redux GameLogState)
export const gameLogAtom = atom<GameLogState>(initialGameLogState)

// Loading state atom
export const gameLogLoadingAtom = atom<boolean>(true)

// Current transient game log data atom (writable)
export const currentGameLogDataAtom = atomWithDefault<GameLogData | null>(
    () => null
)

// Initialize game log from storage
export const initializeGameLogAtom = atom(
    null,
    async (get, set) => {
        // Set up tabular definitions for game log UI
        setTabularDefinitions(gameLogTabularDefinitions)

        const stored = await loadFromStorage()
        if (stored) {
            set(gameLogAtom, stored)
        }
        set(gameLogLoadingAtom, false)
    }
)

// Side effect: Save game log state to storage
const handleStoragePersistence = async (get: any, gameLog: GameLogData) => {
    const state = get(gameLogAtom)

    // Check if feature is enabled
    if (!getDefaultStore().get(isFeatureEnabledAtom(Feature.client))) {
        return
    }

    await saveToStorage(state)
}

// Side effect: Generate and dispatch tabular data
const handleTabularData = async (get: any, set: any, gameLog: GameLogData) => {
    if (!getDefaultStore().get(isFeatureEnabledAtom(Feature.client))) {
        return
    }

    const data = gameLogTabularData(gameLog)
    set(tabularAtom, (prev: any) => ({ ...prev, [GAME_LOG_TABULAR_TRADE]: data }))
}

// Side effect: Process trade notifications
const handleTradeNotifications = async (get: any, set: any, gameLog: GameLogData) => {
    if (gameLog.trade.length === 0) {
        return
    }

    const trade: TradeState = get(tradeAtom)

    if (!trade || !trade.notifications || trade.notifications.length === 0) {
        return
    }

    const linesByFilter: { [filter: string]: GameLogTrade[] } = {}

    for (const t of gameLog.trade) {
        if (t.serial <= trade.lastMessageCheckSerial) {
            break
        }

        for (const n of trade.notifications) {
            if (itemMatchesFilter(t, 0, null, GAME_LOG_TABULAR_TRADE, n.filter)) {
                if (!linesByFilter[n.filter]) {
                    linesByFilter[n.filter] = []
                }
                linesByFilter[n.filter].push(t)
            }
        }
    }

    for (const filter in linesByFilter) {
        const lines = linesByFilter[filter]
        if (lines.length > 0) {
            createListNotification(
                `${NOTIFICATION_ID}-${filter}`,
                `New Trade Matches: ${filter}`,
                lines.map(l => ({ title: `[${l.channel}] ${l.player}`, message: l.message }))
            )
        }
    }

    if (gameLog.trade.length > 0) {
        set(setLastTradeMessageCheckSerialAtom, gameLog.trade[0].serial)
    }
}

// Write-only atom: Process new game log data and trigger side effects
export const processGameLogAtom = atom<null, [GameLogData], Promise<void>>(
    null,
    async (get, set, gameLog: GameLogData) => {
        // Set the transient game log data for consumers like ActivityBridge
        set(currentGameLogDataAtom, gameLog)

        // Trigger side effects
        await handleStoragePersistence(get, gameLog)
        await handleTabularData(get, set, gameLog)
        await handleTradeNotifications(get, set, gameLog)
    }
)
