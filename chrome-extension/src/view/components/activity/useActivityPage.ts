import { useSetAtom, useAtomValue } from 'jotai'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
    activityAtom,
    lastDeletedSessionAtom,
    createNewSessionAtom,
    updateSessionNameAtom,
    updateSessionTypeAtom,
    updateExpandedSessionsAtom,
    updateExpandedActionRowsAtom,
    setShowActionsAtom,
    setUserActionDisplayAtom,
    reinferSessionActionsAtom,
    excludeItemAtom,
    includeItemAtom,
    permanentExcludeItemAtom,
    excludeActionAtom,
    includeActionAtom,
    permanentExcludeActionAtom,
    updateActionTypeAtom,
    updateActionItemAtom,
    updateActionItemsAtom,
    deleteSessionAtom,
    undoDeleteSessionAtom,
    addActionTypeDefinitionAtom,
    updateActionTypeDefinitionAtom,
    addUserActionAtom,
    removeUserActionAtom,
    applyInferenceRuleAtom,
} from '../../application/atoms/activity'
import { getSettings } from '../../application/selectors/settings'
import { isFeatureEnabled, Feature } from '../../application/state/settings'
import { StoredAction, ActivityItem, formatActionDescription, getActionTimestamp } from '../../application/state/activity'
import { formatTime } from '../../../common/time'

export const useActivityPage = () => {
    // Jotai state
    const activity = useAtomValue(activityAtom)
    const lastDeletedSession = useAtomValue(lastDeletedSessionAtom)

    // Jotai actions
    const createNewSession = useSetAtom(createNewSessionAtom)
    const updateSessionName = useSetAtom(updateSessionNameAtom)
    const updateSessionType = useSetAtom(updateSessionTypeAtom)
    const updateExpandedSessions = useSetAtom(updateExpandedSessionsAtom)
    const updateExpandedActionRows = useSetAtom(updateExpandedActionRowsAtom)
    const setShowActions = useSetAtom(setShowActionsAtom)
    const setUserActionDisplay = useSetAtom(setUserActionDisplayAtom)
    const reinferSessionActions = useSetAtom(reinferSessionActionsAtom)
    const excludeItem = useSetAtom(excludeItemAtom)
    const includeItem = useSetAtom(includeItemAtom)
    const permanentExcludeItem = useSetAtom(permanentExcludeItemAtom)
    const excludeAction = useSetAtom(excludeActionAtom)
    const includeAction = useSetAtom(includeActionAtom)
    const permanentExcludeAction = useSetAtom(permanentExcludeActionAtom)
    const updateActionType = useSetAtom(updateActionTypeAtom)
    const deleteSession = useSetAtom(deleteSessionAtom)
    const undoDeleteSession = useSetAtom(undoDeleteSessionAtom)
    const addActionTypeDefinition = useSetAtom(addActionTypeDefinitionAtom)
    const updateActionTypeDefinition = useSetAtom(updateActionTypeDefinitionAtom)
    const addUserAction = useSetAtom(addUserActionAtom)
    const removeUserAction = useSetAtom(removeUserActionAtom)
    const applyInferenceRule = useSetAtom(applyInferenceRuleAtom)

    // Redux state (for settings only)
    const settings = useSelector(getSettings)
    const navigate = useNavigate()
    const isBudgetEnabled = isFeatureEnabled(settings, Feature.budget)
    const useComma = isFeatureEnabled(settings, Feature.commaDecimalSeparator)

    // Helper to extract all item IDs from relatedItems structure
    const getAllItemIds = (action: StoredAction): number[] => {
        const values = Object.values(action.relatedItems)
        const ids: number[] = []
        for (const value of values) {
            if (typeof value === 'number') {
                ids.push(value)
            } else if (Array.isArray(value)) {
                ids.push(...value)
            }
        }
        return ids
    }

    // Create lookup function for inventory items
    const getInventoryItem = (id: number): ActivityItem | undefined => {
        if (!activity?.data.items) return undefined
        return activity.data.items.find(item => item.id === id)
    }

    // Helper function to get inventory item with fallback
    const getInventoryItemWithFallback = (itemId: number, fallbackTimestamp?: number): ActivityItem => {
        return getInventoryItem(itemId) || {
            id: itemId,
            name: 'unknown',
            quantity: 0,
            value: 0,
            container: 'unknown',
            timestamp: fallbackTimestamp || Date.now(),
            source: 'inventory'
        }
    }

    const buildCopyTextForItems = (items: ActivityItem[]): string => {
        return items.map(d => `${d.name}\t${d.quantity}\t${useComma ? (d.value ?? 0).toFixed(2).replace('.', ',') : (d.value ?? 0).toFixed(2)}`).join('\n')
    }

    // Build a plain text representation for copying: title + list of items
    const buildCopyTextForAction = (a: StoredAction): string => {
        const timestamp = getActionTimestamp(a, getInventoryItem)
        const time = formatTime(timestamp)
        const itemIds = getAllItemIds(a)
        // Calculate total value from related inventory items
        const total = itemIds.reduce((sum, itemId) => {
            const item = getInventoryItem(itemId)
            return sum + (item ? item.value : 0)
        }, 0).toFixed(2)
        const title = formatActionDescription(a, getInventoryItem)
        const sources = a.sources.join(', ')
        let text = `${time} ${total} PED - ${title} - ${sources}`
        if (itemIds.length > 0) {
            text += '\n'
            // Get inventory items directly
            const items: ActivityItem[] = itemIds.map(itemId => getInventoryItemWithFallback(itemId, timestamp))
            text += buildCopyTextForItems(items)
        }
        return text
    }

    const copyToClipboard = async (text: string) => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text)
                return
            }
        } catch {
            // fallthrough to fallback
        }
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.left = '-9999px'
        document.body.appendChild(ta)
        ta.focus()
        ta.select()
        try { document.execCommand('copy') } catch { /* ignore */ }
        document.body.removeChild(ta)
    }

    return {
        // State
        activity,
        lastDeletedSession,
        settings,
        navigate,
        isBudgetEnabled,
        useComma,

        // Atom setters
        createNewSession,
        updateSessionName,
        updateSessionType,
        updateExpandedSessions,
        updateExpandedActionRows,
        setShowActions,
        setUserActionDisplay,
        reinferSessionActions,
        excludeItem,
        includeItem,
        permanentExcludeItem,
        excludeAction,
        includeAction,
        permanentExcludeAction,
        updateActionType,
        deleteSession,
        undoDeleteSession,
        addActionTypeDefinition,
        updateActionTypeDefinition,
        addUserAction,
        removeUserAction,
        applyInferenceRule,

        // Helper functions
        getAllItemIds,
        getInventoryItem,
        getInventoryItemWithFallback,
        buildCopyTextForItems,
        buildCopyTextForAction,
        copyToClipboard,
    }
}
