import { CLASS_INFO, STRING_CONNECTING } from "../../../common/const"
import { Status } from "../../../common/state"
import StatusState from "../state/status"

const initialState: StatusState = {
    class: CLASS_INFO,
    message: STRING_CONNECTING,
    showLoading: true,
    showTimer: false,
    isMonitoring: true
}

const reduceSetStatus = (state: StatusState, status: Status): StatusState => ({
    ...status,
    showLoading: status.message.includes('...'),
    showTimer: status.message.includes(':'),
})

export {
    initialState,
    reduceSetStatus
}
