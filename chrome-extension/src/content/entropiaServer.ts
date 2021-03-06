import { CLASS_ERROR, URL_MY_ITEMS, ERROR_429, STRING_PLEASE_LOG_IN } from '../common/const'
import { Inventory, makeLogInventory } from '../common/state'
import { trace, traceData } from '../common/trace'

//// ENTROPIA SERVER ////

class EntropiaServerManager {
    async _getJson(res: Response): Promise<Inventory> {
        if (res.ok) {
            return await res.json()
        } else {
            const message = res.status === 429 ? ERROR_429 : `${res.status} - ${res.statusText}`
            return makeLogInventory(CLASS_ERROR, message)
        }
    }

    async requestItems(tag: any, shortWait?: boolean) {
        let json: Inventory
        try {
            const res = await fetch(URL_MY_ITEMS)
            json = await this._getJson(res)
        } catch (e) {
            trace('json exception:')
            traceData(e)
            json = makeLogInventory(CLASS_ERROR, STRING_PLEASE_LOG_IN)
        }
        json.tag = tag;
        json.shortWait = shortWait
        return json
    }
}

export {
    EntropiaServerManager
}