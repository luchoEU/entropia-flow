import { useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { initializeHistoryAtom } from '../../application/atoms/history'

export function HistoryBridge() {
    const initializeHistory = useSetAtom(initializeHistoryAtom)

    // Initialize history state from storage
    useEffect(() => {
        initializeHistory()
    }, [initializeHistory])

    return null
}
