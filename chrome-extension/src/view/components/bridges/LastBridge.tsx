import { useEffect, useRef } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { historyComputedAtom } from '../../application/atoms/history'
import { initializeLastAtom, computeLastAtom } from '../../application/atoms/last'

export function LastBridge() {
    const initializeLast = useSetAtom(initializeLastAtom)
    const computeLast = useSetAtom(computeLastAtom)

    // Jotai atoms for history (inventory list)
    const history = useAtomValue(historyComputedAtom)
    const prevHistoryRef = useRef(history)

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

        // Extract all inventories
        const inventoryList = history.list.map(item => item.rawInventory)

        // Find the "last" (session start) timestamp
        const lastItem = history.list.find(item => item.isLast)
        const last = lastItem?.key || 0

        if (inventoryList.length > 0 && last > 0) {
            computeLast({ list: inventoryList, last })
        }
    }, [history, computeLast])

    return null
}
