const REFRESH = "[msg] refresh"
const COPY_LAST = "[msg] copy last"
const TIMER_ON = "[msg] timer on"
const TIMER_OFF = "[msg] timer off"
const SET_WEB_SOCKET_URL = "[msg] set websocket url"
const RETRY_WEB_SOCKET = "[msg] retry connect websocket"

const refresh = {
    type: REFRESH
}

const copyLast = {
    type: COPY_LAST
}

const timerOn = {
    type: TIMER_ON
}

const timerOff = {
    type: TIMER_OFF
}

const setWebSocketUrl = (url: string) => ({
    type: SET_WEB_SOCKET_URL,
    payload: {
        url
    }
})

export {
    REFRESH,
    COPY_LAST,
    TIMER_ON,
    TIMER_OFF,
    SET_WEB_SOCKET_URL,
    RETRY_WEB_SOCKET,
    refresh,
    copyLast,
    timerOn,
    timerOff,
    setWebSocketUrl
}
