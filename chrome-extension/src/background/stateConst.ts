import { CLASS_ERROR, CLASS_INFO, STRING_LOADING_ITEMS, STRING_LOADING_PAGE, STRING_NO_DATA, STRING_PLEASE_LOG_IN } from "../common/const"
import { ViewState, Status, TimeLeft, StatusType } from "../common/state"
import { emptyGameLogData } from "./client/gameLogData"

const TIME_1_MIN: TimeLeft = {
    minutes: 1,
    seconds: 0
}

const DATE_CONST = 1

const STATE_LOADING_PAGE: ViewState = {
    status: {
        type: StatusType.Log,
        log: {
            class: CLASS_INFO,
            message: STRING_LOADING_PAGE
        },
        isMonitoring: false
    }
}

const STATE_LOADING_ITEMS: ViewState = {
    status: {
        type: StatusType.Log,
        log: {
            class: CLASS_INFO,
            message: STRING_LOADING_ITEMS
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

const STATE_NO_DATA: ViewState = {
    clientState: undefined,
    gameLog: emptyGameLogData(),
    last: null,
    list: [{
        log: {
            class: CLASS_INFO,
            message: STRING_NO_DATA
        },
        meta: {
            date: DATE_CONST
        }
    }]
}

const STATE_NO_DATA_PLEASE_LOG_IN: ViewState = {
    ...STATE_NO_DATA,
    status: STATUS_PLEASE_LOG_IN
}

const STATE_NO_DATA_MONITORING_OFF: ViewState = {
    ...STATE_NO_DATA,
    status: STATUS_MONTORING_OFF
}

const STATE_NO_DATA_1_MIN: ViewState = {
    ...STATE_NO_DATA,
    status: STATUS_1_MIN
}

export {
    TIME_1_MIN,
    DATE_CONST,
    STATE_LOADING_PAGE,
    STATE_LOADING_ITEMS,
    STATE_1_MIN,
    STATE_PLEASE_LOG_IN,
    STATE_MONITORING_OFF,
    STATE_NO_DATA_PLEASE_LOG_IN,
    STATE_NO_DATA_MONITORING_OFF,
    STATE_NO_DATA_1_MIN
}