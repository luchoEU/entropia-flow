import { Status } from "../../../common/state"

const TICK_STATUS = "[status] tick"
const SET_STATUS = "[status] set"

const tickStatus = {
    type: TICK_STATUS
}

const setStatus = (status: Status) => ({
    type: SET_STATUS,
    payload: {
        status
    }
})

export {
    TICK_STATUS,
    SET_STATUS,
    tickStatus,
    setStatus
}