import { AboutState } from "../state/about"

const SET_STATE = '[about] load state'
const SET_EXPANDED = '[about] set expanded'

const setState = (state: AboutState) => ({
    type: SET_STATE,
    payload: {
        state,
    }
})

const setExpanded = (part: string) => (expanded: boolean) => ({
    type: SET_EXPANDED,
    payload: {
        part,
        expanded
    }
})

export {
    SET_STATE,
    SET_EXPANDED,
    setState,
    setExpanded,
}
