import { CLASS_ERROR, CLASS_INFO, STRING_LOADING, STRING_NO_DATA, STRING_PLEASE_LOG_IN } from "../common/const"
import { Inventory, ViewState, Status, STATUS_TYPE_AUTO_REQUEST_OFF, STATUS_TYPE_LOG, STATUS_TYPE_TIME, TimeLeft } from "../common/state"

const TIME_1_MIN: TimeLeft = {
    minutes: 1,
    seconds: 0
}

const DATE_CONST = 1

const STATE_LOADING: ViewState = {
    status: {
        type: STATUS_TYPE_LOG,
        log: {
            class: CLASS_INFO,
            message: STRING_LOADING
        }
    }
}

const STATUS_1_MIN: Status = {
    type: STATUS_TYPE_TIME,
    time: TIME_1_MIN,
}

const STATE_1_MIN: ViewState = {
    status: STATUS_1_MIN
}

const STATUS_PLEASE_LOG_IN: Status = {
    type: STATUS_TYPE_LOG,
    log: {
        class: CLASS_ERROR,
        message: STRING_PLEASE_LOG_IN
    }
}

const STATE_PLEASE_LOG_IN: ViewState = {
    status: STATUS_PLEASE_LOG_IN
}

const STATE_AUTO_REQUEST_OFF: ViewState = {
    status: {
        type: STATUS_TYPE_AUTO_REQUEST_OFF
    }
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

const STATE_NO_DATA_AUTO_REQUEST_OFF: ViewState = {
    list: LIST_NO_DATA,
    status: {
        type: STATUS_TYPE_AUTO_REQUEST_OFF
    }
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
    STATE_AUTO_REQUEST_OFF,
    STATE_NO_DATA_PLEASE_LOG_IN,
    STATE_NO_DATA_AUTO_REQUEST_OFF,
    STATE_NO_DATA_1_MIN
}