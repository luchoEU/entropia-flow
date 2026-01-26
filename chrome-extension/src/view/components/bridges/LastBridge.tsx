import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useSetAtom } from 'jotai'
import { getHistory } from '../../application/selectors/history'
import { HistoryState } from '../../application/state/history'
import { initializeLastAtom, computeLastAtom } from '../../application/atoms/last'

export function LastBridge() {
    const initializeLast = useSetAtom(initializeLastAtom)
    const computeLast = useSetAtom(computeLastAtom)

    // Redux state for history (inventory list)
    const history: HistoryState = useSelector(getHistory)
    const prevHistoryRef = useRef<HistoryState | null>(null)

    // Initialize Jotai state from storage
    useEffect(() => {
        initializeLast()
    }, [initializeLast])

    // Compute last state when history changes
    useEffect(() => {
        if (!history?.list || history.list.length === 0) return

        // Only process if history actually changed
        if (prevHistoryRef.current === history) return
        prevHistoryRef.current = history

        // Extract the inventory list and "last" timestamp
        const inventoryList = history.list
            .filter(item => item.rawInventory?.itemlist !== undefined)
            .map(item => item.rawInventory)

        // Find the "last" (session start) timestamp
        const lastItem = history.list.find(item => item.isLast)
        const last = lastItem?.key || 0

        if (inventoryList.length > 0 && last > 0) {
            computeLast({ list: inventoryList, last })
        }
    }, [history, computeLast])

    return null
}
