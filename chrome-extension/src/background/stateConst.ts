import { CLASS_ERROR, CLASS_INFO, STRING_LOADING_ITEMS, STRING_LOADING_PAGE, STRING_NO_DATA, STRING_PLEASE_LOG_IN } from "../common/const"
import { ViewState, Status, TimeLeft } from "../common/state"
import { emptyGameLogData } from "./client/gameLogData"

const TIME_1_MIN: TimeLeft = {
    minutes: 1,
    seconds: 0
}

const DATE_CONST = 1

const STATUS_PLEASE_LOG_IN: Status = {
    class: CLASS_ERROR,
    message: STRING_PLEASE_LOG_IN,
    isMonitoring: true
}

const STATUS_LOADING_PAGE: Status = {
    class: CLASS_INFO,
    message: STRING_LOADING_PAGE,
    isMonitoring: true
}

const STATE_LOADING_ITEMS: ViewState = {
    status: {
        class: CLASS_INFO,
        message: STRING_LOADING_ITEMS,
        isMonitoring: true
    }
}

const STATE_LOADING_PAGE_MONITORING_ON: ViewState = {
    status: STATUS_LOADING_PAGE
}

const STATE_LOADING_PAGE_MONITORING_OFF: ViewState = {
    status: { ...STATUS_LOADING_PAGE, isMonitoring: false }
}

const STATE_UPDATES_NOW: ViewState = {
    status: {
        class: CLASS_INFO,
        message: 'updates now',
        isMonitoring: true
    }
}

const STATE_UPDATES_1_MIN: ViewState = {
    status: {
        class: CLASS_INFO,
        message: 'updates in 01:00',
        isMonitoring: true
    }
}

const STATE_SAFE_REFRESH_1_MIN: ViewState = {
    status: {
        class: CLASS_INFO,
        message: 'safe to refresh in 01:00',
        isMonitoring: false
    }
}

const STATE_PLEASE_LOG_IN_MONITORING_ON: ViewState = {
    status: STATUS_PLEASE_LOG_IN
}

const STATE_PLEASE_LOG_IN_MONITORING_OFF: ViewState = {
    status: { ...STATUS_PLEASE_LOG_IN, isMonitoring: false }
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

const STATE_NO_DATA_MONITORING_ON: ViewState = {
    ...STATE_NO_DATA,
    status: STATUS_PLEASE_LOG_IN
}

const STATE_NO_DATA_MONITORING_OFF: ViewState = {
    ...STATE_NO_DATA,
    status: { ...STATUS_PLEASE_LOG_IN, isMonitoring: false }
}

const STATE_NO_DATA_1_MIN: ViewState = {
    ...STATE_NO_DATA,
    ...STATE_UPDATES_1_MIN
}

export {
    TIME_1_MIN,
    DATE_CONST,
    STATE_LOADING_ITEMS,
    STATE_UPDATES_NOW,
    STATE_UPDATES_1_MIN,
    STATE_SAFE_REFRESH_1_MIN,
    STATE_LOADING_PAGE_MONITORING_ON,
    STATE_LOADING_PAGE_MONITORING_OFF,
    STATE_PLEASE_LOG_IN_MONITORING_ON,
    STATE_PLEASE_LOG_IN_MONITORING_OFF,
    STATE_NO_DATA_MONITORING_ON,
    STATE_NO_DATA_MONITORING_OFF,
    STATE_NO_DATA_1_MIN
}