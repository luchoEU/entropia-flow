import { TTServiceStateWebData } from "../state/ttService"

const LOAD_TT_SERVICE = "[tt] reload"
const SET_TT_SERVICE_PARTIAL_WEB_DATA = "[tt] set partial web data"

const loadTTService = () => ({
    type: LOAD_TT_SERVICE
})

const setTTServicePartialWebData = (change: Partial<TTServiceStateWebData>) => ({
    type: SET_TT_SERVICE_PARTIAL_WEB_DATA,
    payload: {
        change
    }
})

export {
    LOAD_TT_SERVICE,
    SET_TT_SERVICE_PARTIAL_WEB_DATA,
    loadTTService,
    setTTServicePartialWebData,
}
