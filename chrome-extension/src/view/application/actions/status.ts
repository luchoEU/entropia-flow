import { Status } from "../../../common/state"

const SET_STATUS = "[status] set"

const setStatus = (status: Status) => ({
    type: SET_STATUS,
    payload: {
        status
    }
})

export {
    SET_STATUS,
    setStatus
}
