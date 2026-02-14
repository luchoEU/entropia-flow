import { atom } from 'jotai'
import { atomWithDefault } from 'jotai/utils'
import { GameLogData, GameLogTrade, emptyGameLogData } from '../../../background/client/gameLogData'
import { GameLogState } from '../state/log'
import { LOCAL_STORAGE } from '../../../chrome/chromeStorageArea'
import { STORAGE_VIEW_GAME_LOG } from '../../../common/const'
import { Feature } from '../state/settings'
import { isFeatureEnabledAtom } from './settings'
import { TradeState } from '../state/trade'
import { createListNotification } from '../../../common/notifications'
import { tradeAtom, setLastTradeMessageCheckSerialAtom } from './trade'
import { multiIncludes } from '../../../common/filter'

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
// Initialize with empty game log data so it doesn't reset to null when ViewState updates don't include gameLog
export const currentGameLogDataAtom = atom<GameLogData>(emptyGameLogData())

// Initialize game log from storage
export const initializeGameLogAtom = atom(
    null,
    async (get, set) => {
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
    if (!get(isFeatureEnabledAtom(Feature.client))) {
        return
    }

    await saveToStorage(state)
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
            // Check if trade matches filter by searching in all trade fields
            const tradeStr = `${t.time} ${t.channel} ${t.player} ${t.message}`.toLowerCase()
            const filterStr = n.filter.toLowerCase()
            if (multiIncludes(filterStr, tradeStr)) {
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
        await handleTradeNotifications(get, set, gameLog)
    }
)
