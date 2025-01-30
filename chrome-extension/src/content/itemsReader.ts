import { CLASS_ERROR, URL_MY_ITEMS, ERROR_425, ERROR_429, STRING_PLEASE_LOG_IN, ACCESS_BLOCKED_WAIT_SECONDS, TOO_MANY_WAIT_SECONDS, CLASS_REQUESTED, STRING_NO_DATA, NORMAL_WAIT_SECONDS, FIRST_WAIT_SECONDS, STRING_NOT_READY } from '../common/const'
import { Inventory, makeLogInventory } from '../common/state'
import { traceError } from '../common/trace'

// Read items from local html or get them using ajax

//// ITEMS READER ////

class ItemsReader {
    private loadFromHtml = true

    private async _getJson(res: Response): Promise<Inventory> {
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

    private _getWaitSeconds(res: Response, waitSeconds?: number): number {
        if (!res.ok) {
            if (res.status === 425)
                return ACCESS_BLOCKED_WAIT_SECONDS
            if (res.status === 429)
                return TOO_MANY_WAIT_SECONDS
        }
        return waitSeconds
    }

    public async requestItemsHtml(): Promise<Inventory> {
        let json: Inventory
        const items = document.getElementById('myItems')
        if (items) {
            const rows = items.getElementsByTagName('tr')
            if (rows.length <= 1) {
                return makeLogInventory(CLASS_ERROR, STRING_NOT_READY) // not ready yet, retry in a few seconds
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
                        let c = ''
                        const containerChildren = cells[3].childNodes
                        if (containerChildren.length === 0) {
                            c = cells[3].innerText
                        } else {
                            c = containerChildren[0].textContent
                            if (containerChildren.length === 2) {
                                var anchor = containerChildren[1] as HTMLAnchorElement
                                if (anchor) {
                                    c += '('
                                    c += anchor.getAttribute('href').split('_')[2]
                                    c += ')'
                                }
                            }
                        }
                        json.itemlist.push({ id, n, q, v, c })
                    }
                }
                json.waitSeconds = FIRST_WAIT_SECONDS
                this.loadFromHtml = false // only the first time from html
                return json
            }
        } else {
            return makeLogInventory(CLASS_ERROR, STRING_PLEASE_LOG_IN)
        }
    }

    public async requestItemsAjax(waitSeconds?: number): Promise<Inventory> {
        if (this.loadFromHtml)
            return makeLogInventory(CLASS_REQUESTED, STRING_NO_DATA)

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
        } catch (e) {
            traceError('ItemsReader', 'json exception:', e)
            json = makeLogInventory(CLASS_ERROR, STRING_PLEASE_LOG_IN)
        }
        json.waitSeconds = waitSeconds
        return json
    }
}

export {
    ItemsReader
}