import { useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { initializeLastAtom } from '../../application/atoms/last'

export function LastBridge() {
    const initializeLast = useSetAtom(initializeLastAtom)

    // Initialize Jotai state from storage
    useEffect(() => {
        initializeLast()
    }, [initializeLast])

    // Note: The lastComputedAtom is automatically computed from history and lastTimestamp
    // The timestamp is set by the messages middleware when new data arrives

    return null
}
