const REFRESH = "[msg] refresh"
const SET_LAST = "[msg] set last"
const SET_AS_LAST = "[msg] set as last"
const TIMER_ON = "[msg] timer on"
const TIMER_OFF = "[msg] timer off"

const refresh = {
    type: REFRESH
}

const setLast = {
    type: SET_LAST
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

export {
    REFRESH,
    SET_LAST,
    SET_AS_LAST,
    TIMER_ON,
    TIMER_OFF,
    refresh,
    setLast,
    setAsLast,
    timerOn,
    timerOff
}