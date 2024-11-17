import { EntropiaWikiState } from "../state/wiki"

const SET_ENTROPIA_WIKI_STATE = "[wiki] set entropia wiki state"
const LOAD_ENTROPIA_WIKI_MATERIAL = "[wiki] load entropia wiki material"

const setEntropiaWikiState = (state: EntropiaWikiState) => ({
    type: SET_ENTROPIA_WIKI_STATE,
    payload: {
        state
    }
})

const loadEntropiaWikiMaterial = (name: string) => ({
    type: LOAD_ENTROPIA_WIKI_MATERIAL,
    payload: {
        name
    }
})

export {
    SET_ENTROPIA_WIKI_STATE,
    LOAD_ENTROPIA_WIKI_MATERIAL,
    setEntropiaWikiState,
    loadEntropiaWikiMaterial,
}
