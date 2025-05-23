const REFRESH = "[msg] refresh"
const SET_LAST = "[msg] set last"
const SET_AS_LAST = "[msg] set as last"
const COPY_LAST = "[msg] copy last"
const TIMER_ON = "[msg] timer on"
const TIMER_OFF = "[msg] timer off"
const SEND_WEB_SOCKET_MESSAGE = "[msg] send websocket message"
const SET_WEB_SOCKET_URL = "[msg] set websocket url"
const RETRY_WEB_SOCKET = "[msg] retry connect websocket"

const refresh = {
    type: REFRESH
}

const setLast = {
    type: SET_LAST
}

const copyLast = {
    type: COPY_LAST
}

const setAsLast = (last: number) => ({
    type: SET_AS_LAST,
    payload: {
        last
    }
})

const timerOn = {
    type: TIMER_ON
}

const timerOff = {
    type: TIMER_OFF
}

const sendWebSocketMessage = (type: string, data: any) => ({
    type: SEND_WEB_SOCKET_MESSAGE,
    payload: {
        type,
        data
    }
})

const setWebSocketUrl = (url: string) => ({
    type: SET_WEB_SOCKET_URL,
    payload: {
        url
    }
})

export {
    REFRESH,
    SET_LAST,
    SET_AS_LAST,
    COPY_LAST,
    TIMER_ON,
    TIMER_OFF,
    SEND_WEB_SOCKET_MESSAGE,
    SET_WEB_SOCKET_URL,
    RETRY_WEB_SOCKET,
    refresh,
    setLast,
    setAsLast,
    copyLast,
    timerOn,
    timerOff,
    sendWebSocketMessage,
    setWebSocketUrl
}
