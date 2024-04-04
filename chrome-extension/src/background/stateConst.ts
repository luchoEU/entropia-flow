import { CLASS_ERROR, CLASS_INFO, STRING_LOADING, STRING_NO_DATA, STRING_PLEASE_LOG_IN } from "../common/const"
import { Inventory, ViewState, Status, TimeLeft, StatusType } from "../common/state"

const TIME_1_MIN: TimeLeft = {
    minutes: 1,
    seconds: 0
}

const DATE_CONST = 1

const STATE_LOADING: ViewState = {
    status: {
        type: StatusType.Log,
        log: {
            class: CLASS_INFO,
            message: STRING_LOADING
        },
        isMonitoring: true
    }
}

const STATUS_1_MIN: Status = {
    type: StatusType.Time,
    time: TIME_1_MIN,
    isMonitoring: true
}

const STATE_1_MIN: ViewState = {
    status: STATUS_1_MIN
}

const STATUS_PLEASE_LOG_IN: Status = {
    type: StatusType.Log,
    log: {
        class: CLASS_ERROR,
        message: STRING_PLEASE_LOG_IN
    },
    isMonitoring: true
}

const STATUS_MONTORING_OFF: Status = {
    ...STATUS_PLEASE_LOG_IN,
    isMonitoring: false
}

const STATE_PLEASE_LOG_IN: ViewState = {
    status: STATUS_PLEASE_LOG_IN
}

const STATE_MONITORING_OFF: ViewState = {
    status: STATUS_MONTORING_OFF
}

const LIST_NO_DATA: Array<Inventory> = [{
    log: {
        class: CLASS_INFO,
        message: STRING_NO_DATA
    },
    meta: {
        date: DATE_CONST
    }
}]

const STATE_NO_DATA_PLEASE_LOG_IN: ViewState = {
    list: LIST_NO_DATA,
    status: STATUS_PLEASE_LOG_IN
}

const STATE_NO_DATA_MONITORING_OFF: ViewState = {
    list: LIST_NO_DATA,
    status: STATUS_MONTORING_OFF
}

const STATE_NO_DATA_1_MIN: ViewState = {
    list: LIST_NO_DATA,
    status: STATUS_1_MIN
}

export {
    TIME_1_MIN,
    DATE_CONST,
    STATE_LOADING,
    STATE_1_MIN,
    STATE_PLEASE_LOG_IN,
    STATE_MONITORING_OFF,
    STATE_NO_DATA_PLEASE_LOG_IN,
    STATE_NO_DATA_MONITORING_OFF,
    STATE_NO_DATA_1_MIN
}