import { STATUS_TYPE_MONITORING_OFF, STATUS_TYPE_LOG, STATUS_TYPE_TIME } from "../../../common/state"
import { STATUS_STATE } from "../state/status"

const initialState: STATUS_STATE = {
    className: 'info',
    message: 'connecting...',
    showLoading: true,
    showTimer: false,
    time: [0, 0],
    isMonitoring: true
}

function tickStatus(state: STATUS_STATE): STATUS_STATE {
    const [m, s] = state.time
    if (s === 0) {
        if (m > 0)
            return { ...state, time: [m - 1, 59] }
        else
            return state
    } else {
        return { ...state, time: [m, s - 1] }
    }
}

function setStatus(state: STATUS_STATE, status: any): STATUS_STATE {
    switch (status.type) {
        case STATUS_TYPE_MONITORING_OFF:
            return { ...state, isMonitoring: false, time: [0, 0] }
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
            return {
                className: 'info',
                message: 'next in ',
                showLoading: false,
                showTimer: true,
                time: [status.time.minutes, status.time.seconds],
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