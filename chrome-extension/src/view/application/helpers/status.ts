import { Status, StatusType } from "../../../common/state"
import { STATUS_STATE } from "../state/status"

const initialState: STATUS_STATE = {
    className: 'info',
    message: 'connecting...',
    showLoading: true,
    showTimer: false,
    time: [0, 0],
    isMonitoring: true
}

function getUpdatesInMessage(time: Array<number>, isMonitoring: boolean): string {
    const [m, s] = time
    if (!isMonitoring && m === 0 && s === 0) {
        return 'safe to refresh now'
    } else {
        const pad = (n: number) => n.toString().padStart(2, '0')
        const msg = isMonitoring ? 'updates' : 'safe to refresh'
        return `${msg} in ${pad(m)}:${pad(s)}`
    }
}

function tick(time: Array<number>): Array<number> {
    const [m, s] = time
    if (s === 0) {
        if (m > 0)
            return [m - 1, 59]
        else
           return time
    } else {
        return [m, s - 1]
    }
}

function tickStatus(state: STATUS_STATE): STATUS_STATE {
    let time = tick(state.time)

    let message : string
    if (state.showTimer)
        message = getUpdatesInMessage(time, state.isMonitoring)
    else
        message = state.message
    
    return { ...state, time, message }
}

function setStatus(state: STATUS_STATE, status: Status): STATUS_STATE {
    switch (status.type) {
        case StatusType.Log:
            return {
                className: status.log.class,
                message: status.log.message,
                showLoading: status.log.message.includes('...'),
                showTimer: false,
                time: [0, 0],
                isMonitoring: status.isMonitoring
            }
        case StatusType.Time:
            const time = [status.time.minutes, status.time.seconds]
            return {
                className: 'info',
                message: getUpdatesInMessage(time, status.isMonitoring),
                showLoading: false,
                showTimer: true,
                time,
                isMonitoring: status.isMonitoring
            }
        default:
            return state
    }
}

export {
    initialState,
    tickStatus,
    setStatus
}