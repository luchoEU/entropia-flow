import { STATUS_TYPE_MONITORING_OFF, STATUS_TYPE_LOG, STATUS_TYPE_TIME } from "../../../common/state"
import { timerOff } from "../actions/messages"
import { STATUS_STATE } from "../state/status"

const initialState: STATUS_STATE = {
    className: 'info',
    message: 'connecting...',
    showLoading: true,
    showTimer: false,
    time: [0, 0],
    isMonitoring: true
}

function getUpdatesInMessage(time: Array<number>): string {
    const [m, s] = time
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `updates in ${pad(m)}:${pad(s)}`
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
        message = getUpdatesInMessage(time)
    else
        message = state.message
    
    return { ...state, time, message }
}

function setStatus(state: STATUS_STATE, status: any): STATUS_STATE {
    switch (status.type) {
        case STATUS_TYPE_MONITORING_OFF:
            return {
                ...state,
                showTimer: false,
                time: [0, 0],
                isMonitoring: false
            }
        case STATUS_TYPE_LOG:
            return {
                className: status.log.class,
                message: status.log.message,
                showLoading: status.log.message.includes('...'),
                showTimer: false,
                time: [0, 0],
                isMonitoring: true
            }
        case STATUS_TYPE_TIME:
            const time = [status.time.minutes, status.time.seconds]
            return {
                className: 'info',
                message: getUpdatesInMessage(time),
                showLoading: false,
                showTimer: true,
                time,
                isMonitoring: true
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