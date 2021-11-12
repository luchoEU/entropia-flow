import { URL_ADD_INVENTORY } from '../../common/const'
import { ItemData } from '../../common/state'
import { trace, traceData } from '../../common/trace'

//// BACKEND SERVER ////

class BackendServerManager {
    async send(list: Array<ItemData>) {
        const data = { list }
        const res = await fetch(URL_ADD_INVENTORY, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            }
        })
        if (!res.ok) {
            trace(`BackendServerManager.send error ${res.status} - ${res.statusText}`)
            traceData(await res.text())
        }
    }
}

export default BackendServerManager