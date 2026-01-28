import { StoredAction, ActivitySession, ActionType, ActivityItem, getActionTimestamp } from '../../application/state/activity'

function getDeltaClass(delta: number | undefined) {
    if (delta === undefined || Math.abs(delta) < 0.005)
        delta = 0
    if (delta > 0) {
        return 'positive'
    } else if (delta < 0) {
        return 'negative'
    } else {
        return ''
    }
}

const preSessionKey = 'pre-session'

const groupBySession = (actions: StoredAction[], sessions: ActivitySession[], items: ActivityItem[]): Map<string, StoredAction[]> => {
    const map = new Map<string, StoredAction[]>()
    for (const action of actions) {
        // Find which session this action belongs to
        let sessionId = preSessionKey
        const actionTimestamp = getActionTimestamp(action, items)
        for (const session of sessions) {
            if (actionTimestamp >= session.startTime) {
                sessionId = session.id
            } else {
                break
            }
        }
        if (!map.has(sessionId)) map.set(sessionId, [])
        map.get(sessionId)!.push(action)
    }
    return map
}

export { getDeltaClass, preSessionKey, groupBySession }
