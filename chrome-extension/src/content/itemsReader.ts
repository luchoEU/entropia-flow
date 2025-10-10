import { CLASS_ERROR, ERROR_425, ERROR_429, STRING_PLEASE_LOG_IN, ACCESS_BLOCKED_WAIT_SECONDS, TOO_MANY_WAIT_SECONDS, CLASS_REQUESTED, STRING_NO_DATA, FIRST_WAIT_SECONDS, STRING_NOT_READY, NEXT_HTML_CHECK_WAIT_SECONDS, URL_MY_ITEMS_DATA, NORMAL_WAIT_SECONDS } from '../common/const'
import { Inventory, ItemData, makeLogInventory } from '../common/state'
import { Component, traceError } from '../common/trace'

// Read items from local html or get them using ajax

//// ITEMS READER ////

class ItemsReader {
    private loadFromHtml = true

    private async _getJson(res: Response): Promise<Inventory> {
        if (res.ok) {
            const data = await res.json()

            return {
                itemlist: data.items.map((item: any): ItemData => ({
                    id: item.id.toString(),
                    n: item.name,
                    q: item.quantity.toString(),
                    v: item.value.toFixed(2),
                    c: item.container,
                    r: item.containerRefId?.toString()
                })),
                meta: { date: (new Date()).getTime() },
                waitSeconds: NORMAL_WAIT_SECONDS
            }
        } else {
            const message =
                res.status === 425 ? ERROR_425 :
                res.status === 429 ? ERROR_429 :
                `${res.status} - ${res.statusText}`
            const inventory = makeLogInventory(CLASS_ERROR, message)

            if (res.status === 425)
                inventory.waitSeconds = ACCESS_BLOCKED_WAIT_SECONDS
            if (res.status === 429)
                inventory.waitSeconds = TOO_MANY_WAIT_SECONDS
            
            return inventory
        }
    }

    public async requestItemsHtml(): Promise<Inventory> {
        let inventory: Inventory
        const items = document.querySelector("main table tbody")
        if (items) {
            const rows = items.getElementsByTagName('tr')
            inventory = { itemlist: [], meta: { date: (new Date()).getTime() }, waitSeconds: FIRST_WAIT_SECONDS }
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                var cells = row.getElementsByTagName('td');
                if (cells.length === 4) {
                    const id = cells[0].getElementsByTagName('div')[0].getAttribute('id')?.substring(1); // remove the leading 'r'
                    if (!id) continue;
                    const n = cells[0].innerText
                    const q = cells[1].innerText
                    const v = cells[2].innerText.replace(' PED', '');
                    const c = cells[3].innerText
                    const refAnchor = cells[3].getElementsByTagName('a');
                    const r = refAnchor.length > 0 ? refAnchor[0].getAttribute('href')?.substring(2) ?? undefined : undefined; // remove the leading '#r'
                    inventory.itemlist?.push({ id, n, q, v, c, r })
                }
            }
            this.loadFromHtml = false // the first time should be from html
        } else {
            inventory = makeLogInventory(CLASS_ERROR, STRING_NOT_READY)
            inventory.waitSeconds = NEXT_HTML_CHECK_WAIT_SECONDS
        }
        return inventory
    }

    public async requestItemsAjax(): Promise<Inventory> {
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
            const res = await fetch(URL_MY_ITEMS_DATA, options)
            json = await this._getJson(res)
        } catch (e) {
            traceError(Component.ItemsReader, 'json exception:', e)
            json = makeLogInventory(CLASS_ERROR, STRING_PLEASE_LOG_IN)
        }
        return json
    }
}

export {
    ItemsReader
}