import { StoredAction, ActivityItem, getActionTimestamp, ActivityState } from '../../application/state/activity'

export const getSessionActions = (sessionId: string, activity: ActivityState): StoredAction[] => {
    if (!activity?.data.sessions || !activity?.data.autoActions) return []

    const session = activity.data.sessions.find(s => s.id === sessionId)
    if (!session) return []

    // Find the next session to determine the end time
    const sessionIndex = activity.data.sessions.indexOf(session)
    const nextSession = activity.data.sessions[sessionIndex + 1]
    const endTime = nextSession ? nextSession.startTime : Infinity

    return activity.data.autoActions.filter(act => {
        const timestamp = getActionTimestamp(act, activity.data.items)
        return timestamp >= session.startTime && timestamp < endTime
    })
}

export const getSessionItems = (sessionId: string, activity: ActivityState): ActivityItem[] => {
    if (!activity?.data.sessions || !activity?.data.items) return []

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
