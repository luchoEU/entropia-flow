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

export { getDeltaClass, preSessionKey }
