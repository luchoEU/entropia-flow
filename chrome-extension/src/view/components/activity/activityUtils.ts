import { StoredAction, ActivityItem, getActionTimestamp, ActivityState } from '../../application/state/activity'

const preSessionKey = 'pre-session'

type SessionRange = { startTime: number; endTime: number }

export interface ActivitySessionBuckets {
    sessionRanges: Map<string, SessionRange>
    actionsBySession: Map<string, (StoredAction & { timestamp: number })[]>
    itemsBySession: Map<string, ActivityItem[]>
}

const getSessionIdForTimestamp = (timestamp: number, sessionRanges: Array<{ id: string; startTime: number }>, preSessionEnd: number): string => {
    if (timestamp < preSessionEnd) {
        return preSessionKey
    }

    let low = 0
    let high = sessionRanges.length - 1
    let matchIndex = -1

    while (low <= high) {
        const mid = (low + high) >> 1
        const range = sessionRanges[mid]

        if (timestamp >= range.startTime) {
            matchIndex = mid
            low = mid + 1
        } else {
            high = mid - 1
        }
    }

    return matchIndex >= 0 ? sessionRanges[matchIndex].id : preSessionKey
}

export const buildActivitySessionBuckets = (activity: ActivityState): ActivitySessionBuckets => {
    const sessionRanges = [...(activity?.data.sessions ?? [])].sort((a, b) => a.startTime - b.startTime)
    const preSessionEnd = sessionRanges[0]?.startTime ?? Infinity

    const sessionRangeMap = new Map<string, SessionRange>()
    const actionsBySession = new Map<string, (StoredAction & { timestamp: number })[]>()
    const itemsBySession = new Map<string, ActivityItem[]>()

    sessionRangeMap.set(preSessionKey, { startTime: 0, endTime: preSessionEnd })
    actionsBySession.set(preSessionKey, [])
    itemsBySession.set(preSessionKey, [])

    sessionRanges.forEach((session, index) => {
        const endTime = index + 1 < sessionRanges.length ? sessionRanges[index + 1].startTime : Infinity
        sessionRangeMap.set(session.id, { startTime: session.startTime, endTime })
        actionsBySession.set(session.id, [])
        itemsBySession.set(session.id, [])
    })

    for (const action of activity?.data.autoActions ?? []) {
        const timestamp = getActionTimestamp(action, activity.data.items)
        const sessionId = getSessionIdForTimestamp(timestamp, sessionRanges, preSessionEnd)
        actionsBySession.get(sessionId)!.push({ ...action, timestamp })
    }

    for (const item of activity?.data.items ?? []) {
        const sessionId = getSessionIdForTimestamp(item.timestamp, sessionRanges, preSessionEnd)
        itemsBySession.get(sessionId)!.push(item)
    }

    return { sessionRanges: sessionRangeMap, actionsBySession, itemsBySession }
}

export const getSessionActions = (sessionId: string, activity: ActivityState): (StoredAction & { timestamp: number })[] => {
    if (!activity?.data.sessions || !activity?.data.autoActions) return []
    const buckets = buildActivitySessionBuckets(activity)
    return buckets.actionsBySession.get(sessionId) ?? []
}

export const getSessionItems = (sessionId: string, activity: ActivityState): ActivityItem[] => {
    if (!activity?.data.sessions || !activity?.data.items) return []
    const buckets = buildActivitySessionBuckets(activity)
    return buckets.itemsBySession.get(sessionId) ?? []
}
