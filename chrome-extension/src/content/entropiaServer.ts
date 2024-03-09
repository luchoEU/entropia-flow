import { CLASS_ERROR, URL_MY_ITEMS, ERROR_425, ERROR_429, STRING_PLEASE_LOG_IN, ACCESS_BLOCKED_WAIT_SECONDS, TOO_MANY_WAIT_SECONDS, CLASS_REQUESTED, STRING_NO_DATA, NORMAL_WAIT_SECONDS } from '../common/const'
import { Inventory, makeLogInventory } from '../common/state'
import { trace, traceData } from '../common/trace'

//// ENTROPIA SERVER ////

class EntropiaServerManager {
    private loadFromHtml = true

    async _getJson(res: Response): Promise<Inventory> {
        if (res.ok) {
            return await res.json()
        } else {
            const message =
                res.status === 425 ? ERROR_425 :
                res.status === 429 ? ERROR_429 :
                `${res.status} - ${res.statusText}`
            return makeLogInventory(CLASS_ERROR, message)
        }
    }

    _getWaitSeconds(res: Response, waitSeconds?: number): number {
        if (!res.ok) {
            if (res.status === 425)
                return ACCESS_BLOCKED_WAIT_SECONDS
            if (res.status === 429)
                return TOO_MANY_WAIT_SECONDS
        }
        return waitSeconds
    }

    async requestItems(tag: any, waitSeconds?: number) {
        let json: Inventory
        if (this.loadFromHtml) {
            json = await this.requestItemsHtml(waitSeconds)
        } else {
            json = await this.requestItemsAjax(waitSeconds)
        }
        json.tag = tag;
        return json
    }

    async requestItemsHtml(waitSeconds?: number) {
        let json: Inventory
        const items = document.getElementById('myItems')
        if (items) {
            const rows = items.getElementsByTagName('tr')
            if (rows.length <= 1) {
                json = makeLogInventory(CLASS_REQUESTED, STRING_NO_DATA)
                waitSeconds = 2
            } else {
                json = { itemlist: [], meta: { date: (new Date()).getTime() } }
                for (var i = 1; i < rows.length; i++) {
                    var row = rows[i];
                    var cells = row.getElementsByTagName('td');
                    if (cells.length === 4) {
                        const id = cells[0].getAttribute('id').split('_')[2]
                        const n = cells[0].innerText
                        const q = cells[1].innerText
                        const v = cells[2].innerText
                        const containerChildren = cells[3].childNodes
                        let c = containerChildren[0].textContent
                        if (containerChildren.length === 2) {
                            var anchor = containerChildren[1] as HTMLAnchorElement
                            if (anchor) {
                                c += '('
                                c += anchor.getAttribute('href').split('_')[2]
                                c += ')'
                            }
                        }
                        json.itemlist.push({ id, n, q, v, c })
                    }
                }
                this.loadFromHtml = false // only the first time
                waitSeconds = NORMAL_WAIT_SECONDS
            }
        } else {
            json = makeLogInventory(CLASS_ERROR, STRING_PLEASE_LOG_IN)
        }
        json.waitSeconds = waitSeconds
        return json
    }

    async requestItemsAjax(waitSeconds?: number) {
        let json: Inventory
        try {
            const options = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'Origin': 'https://account.entropiauniverse.com',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: null
            };
            const res = await fetch(URL_MY_ITEMS, options)
            json = await this._getJson(res)
            waitSeconds = this._getWaitSeconds(res, waitSeconds)
            if (res.ok) {
                // The Hub container has '&#10;' in the json but an '\a' when read from html
                // Some names have '&apos;' in the json but a ' when read from html
                let jsonString = JSON.stringify(json);
                jsonString = jsonString.replace(/&#10;/g, '\a');
                jsonString = jsonString.replace(/&apos;/g, "'");
                json = JSON.parse(jsonString);
            }
        } catch (e) {
            trace('json exception:')
            traceData(e)
            json = makeLogInventory(CLASS_ERROR, STRING_PLEASE_LOG_IN)
        }
        json.waitSeconds = waitSeconds
        return json
    }
}

export {
    EntropiaServerManager
}