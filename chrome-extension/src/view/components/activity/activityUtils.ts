import { StoredAction, ActivityItem, getActionTimestamp, ActivityState } from '../../application/state/activity'

const preSessionKey = 'pre-session'

export const getSessionActions = (sessionId: string, activity: ActivityState): (StoredAction & { timestamp: number })[] => {
    if (!activity?.data.sessions || !activity?.data.autoActions) return []

    // Handle pre-session case
    if (sessionId === preSessionKey) {
        const firstSession = activity.data.sessions[0]
        const startTime = firstSession ? firstSession.startTime : Infinity

        return activity.data.autoActions.map(a => {
            const timestamp = getActionTimestamp(a, activity.data.items)
            return { ...a, timestamp }
        }).filter(act => {
            return act.timestamp < startTime
        })
    }

    const session = activity.data.sessions.find(s => s.id === sessionId)
    if (!session) return []

    // Find the next session to determine the end time
    const sessionIndex = activity.data.sessions.indexOf(session)
    const nextSession = activity.data.sessions[sessionIndex + 1]
    const endTime = nextSession ? nextSession.startTime : Infinity

    return activity.data.autoActions.map(a => {
        const timestamp = getActionTimestamp(a, activity.data.items)
        return { ...a, timestamp }
    }).filter(act => {
        return act.timestamp >= session.startTime && act.timestamp < endTime
    })
}

export const getSessionItems = (sessionId: string, activity: ActivityState): ActivityItem[] => {
    if (!activity?.data.sessions || !activity?.data.items) return []

    // Handle pre-session case
    if (sessionId === preSessionKey) {
        const firstSession = activity.data.sessions[0]
        const startTime = firstSession ? firstSession.startTime : Infinity

        return activity.data.items.filter(item =>
            item.timestamp < startTime
        )
    }

    const session = activity.data.sessions.find(s => s.id === sessionId)
    if (!session) return []

    // Find the next session to determine the end time
    const sessionIndex = activity.data.sessions.indexOf(session)
    const nextSession = activity.data.sessions[sessionIndex + 1]
    const endTime = nextSession ? nextSession.startTime : Infinity

    return activity.data.items.filter(item =>
        item.timestamp >= session.startTime && item.timestamp < endTime
    )
}
